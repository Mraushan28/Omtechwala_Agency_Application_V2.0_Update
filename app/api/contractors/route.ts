import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contractorOnboardingSchema } from "@/lib/validations";
import type { ContractorAvailability, VerificationStatus } from "@/lib/status";

// GET /api/contractors
// - Verified talent directory, filterable by skill, availability, minRating.
// - Clients & Admins can browse vetted talent. Contractors can see their own profile.
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skill = searchParams.get("skill");
    const availability = searchParams.get("availability");
    const minRating = searchParams.get("minRating");
    const mine = searchParams.get("mine") === "1";

    if (mine) {
        const profile = await prisma.contractorProfile.findFirst({
            where: { userId: session.user.id },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
        });
        return NextResponse.json({ contractors: profile ? [profile] : [] });
    }

    // Non-admin/non-client roles are not permitted to browse the full directory.
    if (session.user.role !== "ADMIN" && session.user.role !== "CLIENT") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const where: Record<string, unknown> = {
        verificationStatus: "VERIFIED",
    };
    if (skill) where.skills = { has: skill };
    if (availability) where.availability = availability;
    if (minRating) where.rating = { gte: Number(minRating) };

    const contractors = await prisma.contractorProfile.findMany({
        where,
        orderBy: [{ isTopRated: "desc" }, { rating: "desc" }],
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });

    return NextResponse.json({ contractors });
}

// POST /api/contractors
// Upsert the authenticated contractor's profile (onboarding + verification request).
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = contractorOnboardingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const {
            headline,
            bio,
            skills,
            experienceYears,
            hourlyRate,
            availability,
            portfolioLinks,
            githubUrl,
            linkedinUrl,
            resumeUrl,
            languages,
            requestVerification,
        } = parsed.data;

        // MongoDB has no unique constraint on userId — emulate upsert with findFirst.
        const existing = await prisma.contractorProfile.findFirst({
            where: { userId: session.user.id },
        });

        const updateData: Record<string, unknown> = {
            headline,
            bio,
            skills,
            experienceYears,
            hourlyRate,
            availability: availability as ContractorAvailability,
            portfolioLinks: portfolioLinks ?? [],
            githubUrl: githubUrl || null,
            linkedinUrl: linkedinUrl || null,
            resumeUrl: resumeUrl || null,
            languages: languages ?? existing?.languages ?? ["English"],
        };
        // A re-submission while VERIFIED keeps verified status.
        if (requestVerification && existing?.verificationStatus !== "VERIFIED") {
            updateData.verificationStatus = "PENDING" as VerificationStatus;
        }

        let profile;
        if (existing) {
            profile = await prisma.contractorProfile.update({
                where: { id: existing.id },
                data: updateData,
            });
        } else {
            profile = await prisma.contractorProfile.create({
                data: {
                    userId: session.user.id,
                    headline,
                    bio,
                    skills,
                    experienceYears,
                    hourlyRate,
                    availability: availability as ContractorAvailability,
                    portfolioLinks: portfolioLinks ?? [],
                    githubUrl: githubUrl || null,
                    linkedinUrl: linkedinUrl || null,
                    resumeUrl: resumeUrl || null,
                    languages: languages ?? ["English"],
                    verificationStatus: requestVerification ? ("PENDING" as VerificationStatus) : ("UNVERIFIED" as VerificationStatus),
                },
            });
        }

        return NextResponse.json({ profile }, { status: 200 });
    } catch (error) {
        console.error("Contractor profile update failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

