import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verificationSchema } from "@/lib/validations";
import type { VerificationStatus } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/verifications/:id
// Admin approves or rejects a contractor's verification request.
// body: { decision: "APPROVE" | "REJECT", notes?: string }
export async function PATCH(request: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const parsed = verificationSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const { id } = await params;
        const { decision, notes } = parsed.data;

        const profile = await prisma.contractorProfile.findUnique({ where: { id } });
        if (!profile) {
            return NextResponse.json({ error: "Contractor profile not found" }, { status: 404 });
        }

        const verificationStatus: VerificationStatus = decision === "APPROVE" ? "VERIFIED" : "REJECTED";

        const updated = await prisma.contractorProfile.update({
            where: { id },
            data: {
                verificationStatus,
                verificationNotes: notes ?? null,
            },
        });

        return NextResponse.json({ profile: updated });
    } catch (error) {
        console.error("Verification decision failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

