import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ContractorWorkspace } from "@/components/workspaces/contractor/ContractorWorkspace";
import { serializeProject, serializeContractor } from "@/lib/serialize";
import type { ContractorWorkspaceProps } from "@/types/workspace";

export const metadata = { title: "Contractor Workspace" };

export default async function ContractorDashboardPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const [profile, openProjects, activeJobs] = await Promise.all([
        prisma.contractorProfile.findFirst({
            where: { userId: session.user.id },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
        }),
        prisma.project.findMany({
            where: { status: "BIDDING" },
            orderBy: { createdAt: "desc" },
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
        prisma.project.findMany({
            where: { contractorId: session.user.id, status: "IN_PROGRESS" },
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
    ]);

    const paidMilestones = await prisma.milestone.count({
        where: { contractorId: session.user.id, status: { in: ["PAID", "RELEASED"] } },
    });

    const pendingMilestones = await prisma.milestone.findMany({
        where: { contractorId: session.user.id, status: { notIn: ["PAID", "RELEASED"] } },
        select: { contractorPayout: true, amount: true },
    });

    const pendingAmount = pendingMilestones.reduce(
        (sum, m) => sum + Number(m.contractorPayout ?? m.amount),
        0,
    );

    const props: ContractorWorkspaceProps = {
        profile: profile ? serializeContractor(profile) : null,
        profileVerificationStatus: profile?.verificationStatus ?? "UNVERIFIED",
        openProjects: openProjects.map(serializeProject),
        activeJobs: activeJobs.map(serializeProject),
        earnings: {
            lifetime: Number(profile?.totalEarnings ?? 0),
            pending: pendingAmount,
            paidMilestones,
        },
    };

    return (
        <DashboardShell
            title="Contractor Workspace"
            description="Complete onboarding, browse contracts, and track milestone payouts."
        >
            <ContractorWorkspace {...props} />
        </DashboardShell>
    );
}

