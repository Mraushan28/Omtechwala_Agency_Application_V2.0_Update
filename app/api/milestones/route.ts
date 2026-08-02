import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { milestoneSchema } from "@/lib/validations";
import type { MilestoneStatus } from "@/lib/status";

// POST /api/milestones — client/admin adds a milestone (escrow line item)
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const parsed = milestoneSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const { projectId, title, description, amount, dueDate } = body;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isClient = project.clientId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";
        if (!isClient && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const milestone = await prisma.milestone.create({
            data: {
                projectId,
                contractorId: project.contractorId,
                title,
                description: description ?? null,
                amount,
                commissionRate: 0.12,
                status: "PENDING" as MilestoneStatus,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });

        return NextResponse.json({ milestone }, { status: 201 });
    } catch (error) {
        console.error("Milestone creation failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

