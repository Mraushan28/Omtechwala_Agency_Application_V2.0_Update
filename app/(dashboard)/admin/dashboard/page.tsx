import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AdminPanel } from "@/components/workspaces/admin/AdminPanel";
import { serializeProject, serializeContractor } from "@/lib/serialize";
import type { AdminWorkspaceProps } from "@/types/workspace";

export const metadata = { title: "Admin Control Panel" };

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const [milestones, activeProjectsCount, vettedTalentCount, verificationQueueCount, pendingProjects, verificationProfiles, contractors] =
        await Promise.all([
            prisma.milestone.findMany({ select: { amount: true, commissionRate: true, status: true } }),
            prisma.project.count({ where: { status: "IN_PROGRESS" } }),
            prisma.contractorProfile.count({ where: { verificationStatus: "VERIFIED" } }),
            prisma.contractorProfile.count({ where: { verificationStatus: "PENDING" } }),
            prisma.project.findMany({
                where: { status: { in: ["DRAFT", "BIDDING"] } },
                orderBy: { updatedAt: "desc" },
                take: 20,
                include: {
                    client: { select: { name: true, clientProfiles: { select: { companyName: true }, take: 1 } } },
                    contractor: {
                        select: {
                            name: true,
                            contractorProfiles: { select: { headline: true, rating: true }, take: 1 },
                        },
                    },
                    milestones: { orderBy: { dueDate: "asc" } },
                    applications: { select: { id: true } },
                },
            }),
            prisma.contractorProfile.findMany({
                where: { verificationStatus: { in: ["PENDING", "UNVERIFIED", "REJECTED"] } },
                orderBy: { updatedAt: "asc" },
                include: { user: { select: { id: true, name: true, email: true, image: true } } },
            }),
            prisma.contractorProfile.findMany({
                where: { verificationStatus: "VERIFIED" },
                orderBy: [{ isTopRated: "desc" }, { rating: "desc" }],
                include: { user: { select: { id: true, name: true, email: true, image: true } } },
            }),
        ]);

    // TCV: total milestone value across all projects (committed escrow).
    const tcv = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
    // Gross margin = platform commission on committed milestones.
    const grossMargin = milestones.reduce(
        (sum, m) => sum + Number(m.amount) * Number(m.commissionRate),
        0,
    );

    const props: AdminWorkspaceProps = {
        overview: {
            tcv,
            grossMargin,
            activeProjects: activeProjectsCount,
            vettedTalent: vettedTalentCount,
            pendingRequests: pendingProjects.length,
            verificationQueue: verificationQueueCount,
        },
        pendingProjects: pendingProjects.map(serializeProject),
        verificationQueue: verificationProfiles.map(serializeContractor),
        contractors: contractors.map(serializeContractor),
    };

    return (
        <DashboardShell
            title="Admin Control Panel"
            description="Platform overview, contract assignment, escrow approval, and talent verification."
        >
            <AdminPanel {...props} />
        </DashboardShell>
    );
}

