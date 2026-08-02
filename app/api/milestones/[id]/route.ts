import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { MilestoneStatus } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

const VALID_TRANSITIONS: Partial<Record<MilestoneStatus, MilestoneStatus[]>> = {
    PENDING: ["IN_REVIEW", "DISPUTED"],
    IN_REVIEW: ["APPROVED", "DISPUTED", "PENDING"],
    APPROVED: ["PAID"],
    PAID: [],
    DISPUTED: ["PENDING", "IN_REVIEW"],
    RELEASED: [],
};

// PATCH /api/milestones/:id — advance milestone through escrow lifecycle
// Contractors: submit for review (PENDING -> IN_REVIEW)
// Clients/Admins: approve (IN_REVIEW -> APPROVED), pay (APPROVED -> PAID)
export async function PATCH(request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const milestone = await prisma.milestone.findUnique({
        where: { id },
        include: { project: { select: { clientId: true, contractorId: true } } },
    });

    if (!milestone) {
        return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const body = await request.json();
    const newStatus = body.status as MilestoneStatus;

    const allowedTransitions = VALID_TRANSITIONS[milestone.status as MilestoneStatus] ?? [];
    if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json({
            error: `Cannot transition milestone from ${milestone.status} to ${newStatus}.`,
        }, { status: 400 });
    }

    const role = session.user.role;
    const isClient = milestone.project.clientId === session.user.id;
    const isAdmin = role === "ADMIN";
    const isContractor = milestone.project.contractorId === session.user.id;

    // Permission rules per transition
    const allowed =
        (isContractor && newStatus === "IN_REVIEW") ||
        (isClient && ["APPROVED", "PAID", "DISPUTED", "PENDING", "IN_REVIEW"].includes(newStatus)) ||
        (isAdmin && ["APPROVED", "PAID", "DISPUTED", "PENDING", "IN_REVIEW", "RELEASED"].includes(newStatus));

    if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: Record<string, unknown> = { status: newStatus };
    if (newStatus === "APPROVED") data.approvedAt = new Date();
    if (newStatus === "PAID") data.paidAt = new Date();

    if (newStatus === "PAID") {
        const contractorPayout = Number(milestone.amount) * (1 - Number(milestone.commissionRate));
        data.contractorPayout = contractorPayout;
    }

    const updated = await prisma.milestone.update({ where: { id }, data });

    // Update contractor earnings when paid
    if (newStatus === "PAID" && milestone.project.contractorId) {
        const profile = await prisma.contractorProfile.findFirst({
            where: { userId: milestone.project.contractorId },
        });
        if (profile) {
            await prisma.contractorProfile.update({
                where: { id: profile.id },
                data: { totalEarnings: { increment: Number(milestone.amount) * (1 - Number(milestone.commissionRate)) } },
            });
        }
    }

    return NextResponse.json({ milestone: updated });
}

