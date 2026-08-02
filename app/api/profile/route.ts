import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/profile — update the authenticated user's role-specific profile
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const role = session.user.role;

        if (role === "CONTRACTOR") {
            const data: Record<string, unknown> = {};
            if (typeof body.headline === "string") data.headline = body.headline;
            if (typeof body.bio === "string") data.bio = body.bio;
            if (Array.isArray(body.skills)) data.skills = body.skills;
            if (typeof body.experienceYears === "number") data.experienceYears = body.experienceYears;
            if (typeof body.hourlyRate === "number") data.hourlyRate = body.hourlyRate;
            if (Array.isArray(body.portfolioLinks)) data.portfolioLinks = body.portfolioLinks;
            if (typeof body.githubUrl === "string") data.githubUrl = body.githubUrl;
            if (typeof body.linkedinUrl === "string") data.linkedinUrl = body.linkedinUrl;
            if (typeof body.availability === "string") data.availability = body.availability;

            // Requesting verification triggers a PENDING state for admin review
            if (body.requestVerification === true) {
                data.verificationStatus = "PENDING";
            }

            // MongoDB has no unique constraint — upsert is emulated with findFirst + create/update.
            const existing = await prisma.contractorProfile.findFirst({
                where: { userId: session.user.id },
            });

            let profile;
            if (existing) {
                profile = await prisma.contractorProfile.update({
                    where: { id: existing.id },
                    data,
                });
            } else {
                profile = await prisma.contractorProfile.create({
                    data: {
                        userId: session.user.id,
                        headline: body.headline ?? "New to Om Techwala",
                        bio: body.bio ?? null,
                        skills: Array.isArray(body.skills) ? body.skills : [],
                        languages: ["English"],
                        ...data,
                    },
                });
            }

            return NextResponse.json({ profile });
        }

        if (role === "CLIENT") {
            const data: Record<string, unknown> = {};
            if (typeof body.companyName === "string") data.companyName = body.companyName;
            if (typeof body.companyWebsite === "string") data.companyWebsite = body.companyWebsite;
            if (typeof body.companySize === "string") data.companySize = body.companySize;
            if (typeof body.industry === "string") data.industry = body.industry;
            if (typeof body.country === "string") data.country = body.country;
            if (typeof body.billingEmail === "string") data.billingEmail = body.billingEmail;
            if (typeof body.taxId === "string") data.taxId = body.taxId;

            const existing = await prisma.clientProfile.findFirst({
                where: { userId: session.user.id },
            });

            let profile;
            if (existing) {
                profile = await prisma.clientProfile.update({
                    where: { id: existing.id },
                    data,
                });
            } else {
                profile = await prisma.clientProfile.create({
                    data: {
                        userId: session.user.id,
                        companyName: body.companyName ?? "My Company",
                        billingEmail: body.billingEmail ?? null,
                        ...data,
                    },
                });
            }

            return NextResponse.json({ profile });
        }

        return NextResponse.json({ error: "Profile updates are not available for this role." }, { status: 400 });
    } catch (error) {
        console.error("Profile update failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

