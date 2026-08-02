import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contractAssignmentSchema } from "@/lib/validations";
import type { ApplicationStatus, MilestoneStatus, ProjectStatus } from "@/lib/status";

// POST /api/admin/contracts/assign
// Admin assigns a contractor to a client project.
// Sets client rate vs contractor payout rate and derives the commission delta.
// Moves project to IN_PROGRESS, accepts the matching application, and seeds
// escrow milestones from the project deliverables.
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = contractAssignmentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const { projectId, contractorId, clientRate, contractorRate, startDate } = parsed.data;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { milestones: { select: { id: true } } },
        });
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        if (project.status === "IN_PROGRESS" || project.status === "COMPLETED") {
            return NextResponse.json({ error: "This project already has an active contract." }, { status: 409 });
        }

        const contractor = await prisma.user.findUnique({
            where: { id: contractorId },
            include: { contractorProfiles: { take: 1 } },
        });
        const contractorProfile = contractor?.contractorProfiles?.[0];
        if (!contractor || contractor.role !== "CONTRACTOR") {
            return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
        }
        if (contractorProfile?.verificationStatus !== "VERIFIED") {
            return NextResponse.json({ error: "Only verified contractors can be assigned to contracts." }, { status: 400 });
        }

        // Commission delta is the margin between client rate and contractor payout.
        const commissionRate = clientRate > 0 ? Math.max(0, 1 - contractorRate / clientRate) : 0;

        // Approve this contractor's application (if any), reject the others.
        // MongoDB does not support $transaction — run sequential writes.
        const existingApplication = await prisma.application.findFirst({
            where: { projectId, contractorId },
        });

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                contractorId,
                status: "IN_PROGRESS" as ProjectStatus,
                clientRate,
                contractorRate,
                commissionRate,
                startDate: startDate ? new Date(startDate) : new Date(),
            },
        });

        if (existingApplication) {
            await prisma.application.update({
                where: { id: existingApplication.id },
                data: { status: "ACCEPTED" as ApplicationStatus },
            });
            const others = await prisma.application.findMany({
                where: { projectId, status: { in: ["PENDING", "SHORTLISTED"] } },
                select: { id: true },
            });
            for (const other of others) {
                await prisma.application.update({
                    where: { id: other.id },
                    data: { status: "REJECTED" as ApplicationStatus },
                });
            }
        }

        // Seed escrow milestones from deliverables (budget spread evenly).
        const deliverables = project.deliverables?.length ? project.deliverables : [project.title];
        const perMilestone = Number(project.budget) / deliverables.length;
        const baseDue = startDate ? new Date(startDate) : new Date();
        const weekMs = 7 * 24 * 60 * 60 * 1000;

        for (let index = 0; index < deliverables.length; index += 1) {
            const deliverable = deliverables[index];
            await prisma.milestone.create({
                data: {
                    projectId,
                    contractorId,
                    title: `Milestone ${index + 1}: ${deliverable}`,
                    description: deliverable,
                    amount: Math.round(perMilestone * 100) / 100,
                    commissionRate,
                    contractorPayout: null,
                    status: "PENDING" as MilestoneStatus,
                    dueDate: new Date(baseDue.getTime() + (index + 1) * weekMs * 2),
                },
            });
        }

        return NextResponse.json({
            project: updatedProject,
            commission: {
                clientRate,
                contractorRate,
                commissionRate,
                grossMarginPerDeliverable: Number(project.budget) * commissionRate,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Contract assignment failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

