import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectCategory, ProjectStatus } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/:id
export async function GET(_request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: { select: { name: true, email: true, clientProfiles: { select: { companyName: true }, take: 1 } } },
            contractor: { select: { name: true, contractorProfiles: { select: { headline: true, hourlyRate: true }, take: 1 } } },
            applications: {
                include: {
                    contractor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            contractorProfiles: { select: { headline: true, hourlyRate: true, skills: true, rating: true }, take: 1 },
                        },
                    },
                },
            },
            milestones: true,
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
}

// PATCH /api/projects/:id — update status or fields (owner / admin)
export async function PATCH(request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.clientId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const allowed: Record<string, unknown> = {};

        if (typeof body.title === "string") allowed.title = body.title;
        if (typeof body.description === "string") allowed.description = body.description;
        if (typeof body.scope === "string") allowed.scope = body.scope;
        if (typeof body.budget === "number") allowed.budget = body.budget;
        if (typeof body.budgetMin === "number") allowed.budgetMin = body.budgetMin;
        if (typeof body.budgetMax === "number") allowed.budgetMax = body.budgetMax;
        if (typeof body.category === "string") allowed.category = body.category as ProjectCategory;
        if (Array.isArray(body.techStack)) allowed.techStack = body.techStack;
        if (Array.isArray(body.deliverables)) allowed.deliverables = body.deliverables;
        if (typeof body.timelineWeeks === "number") allowed.timelineWeeks = body.timelineWeeks;
        if (typeof body.clientRate === "number") allowed.clientRate = body.clientRate;
        if (typeof body.contractorRate === "number") allowed.contractorRate = body.contractorRate;
        if (typeof body.commissionRate === "number") allowed.commissionRate = body.commissionRate;
        if (body.status && ["DRAFT", "BIDDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(body.status)) {
            allowed.status = body.status as ProjectStatus;
        }
        if (body.deadline) allowed.deadline = new Date(body.deadline);

        const updated = await prisma.project.update({ where: { id }, data: allowed });
        return NextResponse.json({ project: updated });
    } catch (error) {
        console.error("Project update failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

