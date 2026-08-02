import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus, ProjectStatus } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES: ApplicationStatus[] = ["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED", "WITHDRAWN"];

// PATCH /api/applications/:id — update status (client/admin shortlist, accept, reject)
export async function PATCH(request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const application = await prisma.application.findUnique({
        where: { id },
        include: { project: { select: { clientId: true } } },
    });

    if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const isClient = application.project.clientId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = application.contractorId === session.user.id;

    const body = await request.json();
    const newStatus = body.status as ApplicationStatus;

    if (!VALID_STATUSES.includes(newStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Contractors may only withdraw their own applications
    if (isOwner && !isClient && !isAdmin) {
        if (newStatus !== "WITHDRAWN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    } else if (!isClient && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.application.update({
        where: { id },
        data: { status: newStatus },
    });

    // When accepted, assign the contractor to the project and move it to IN_PROGRESS.
    // MongoDB does not support $transaction — run sequential updates.
    if (newStatus === "ACCEPTED") {
        await prisma.project.update({
            where: { id: application.projectId },
            data: { contractorId: application.contractorId, status: "IN_PROGRESS" as ProjectStatus },
        });
        const others = await prisma.application.findMany({
            where: { projectId: application.projectId, status: { in: ["PENDING", "SHORTLISTED"] } },
            select: { id: true },
        });
        for (const other of others) {
            await prisma.application.update({
                where: { id: other.id },
                data: { status: "REJECTED" as ApplicationStatus },
            });
        }
    }

    return NextResponse.json({ application: updated });
}

