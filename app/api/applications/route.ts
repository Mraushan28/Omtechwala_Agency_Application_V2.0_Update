import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations";
import type { ApplicationStatus } from "@/lib/status";

// GET /api/applications
// - Contractors: their own applications
// - Clients: applications on their projects
// - Admin: all applications
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    const where =
        role === "CONTRACTOR"
            ? { contractorId: session.user.id }
            : role === "CLIENT"
                ? { project: { clientId: session.user.id } }
                : {};

    const applications = await prisma.application.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        include: {
            project: { select: { id: true, title: true, category: true, budget: true, status: true } },
            contractor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    contractorProfiles: { select: { headline: true, hourlyRate: true, rating: true }, take: 1 },
                },
            },
        },
    });

    return NextResponse.json({ applications });
}

// POST /api/applications — contractor applies to a project
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CONTRACTOR") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = applicationSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const { projectId, coverLetter, proposedRate, proposedTimeline } = body;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || project.status !== "BIDDING") {
            return NextResponse.json({ error: "This project is not open for applications." }, { status: 400 });
        }

        // MongoDB has no compound unique — check for an existing application manually.
        const existing = await prisma.application.findFirst({
            where: { projectId, contractorId: session.user.id },
        });
        if (existing) {
            return NextResponse.json({ error: "You have already applied to this project." }, { status: 409 });
        }

        const application = await prisma.application.create({
            data: {
                projectId,
                contractorId: session.user.id,
                coverLetter,
                proposedRate: proposedRate ?? undefined,
                proposedTimeline: proposedTimeline ?? undefined,
                status: "PENDING" as ApplicationStatus,
            },
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error) {
        console.error("Application failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

