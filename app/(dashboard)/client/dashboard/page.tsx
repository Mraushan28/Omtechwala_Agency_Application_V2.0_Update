import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ClientWorkspace } from "@/components/workspaces/client/ClientWorkspace";
import { serializeProject, serializeContractor } from "@/lib/serialize";
import type { ClientWorkspaceProps } from "@/types/workspace";

export const metadata = { title: "Client Workspace" };

export default async function ClientDashboardPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const [projects, contractors] = await Promise.all([
        prisma.project.findMany({
            where: { clientId: session.user.id },
            orderBy: { updatedAt: "desc" },
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
            where: { verificationStatus: "VERIFIED" },
            orderBy: [{ isTopRated: "desc" }, { rating: "desc" }],
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
        }),
    ]);

    const props: ClientWorkspaceProps = {
        projects: projects.map(serializeProject),
        contractors: contractors.map(serializeContractor),
    };

    return (
        <DashboardShell
            title="Client Workspace"
            description="Create contracts, manage milestones, and review matched talent."
        >
            <ClientWorkspace {...props} />
        </DashboardShell>
    );
}

