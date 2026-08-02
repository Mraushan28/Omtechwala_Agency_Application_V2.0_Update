import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { MilestoneRow } from "@/components/dashboard/MilestoneRow";
import { Badge } from "@/components/ui/Badge";
import { Wallet, TrendingUp, FileCheck2, Clock } from "lucide-react";

export const metadata = { title: "Earnings" };

export default async function ContractorEarningsPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const [profile, milestones] = await Promise.all([
        prisma.contractorProfile.findFirst({ where: { userId: session.user.id } }),
        prisma.milestone.findMany({
            where: { contractorId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: { project: { select: { title: true } } },
        }),
    ]);

    const totalEarnings = Number(profile?.totalEarnings ?? 0);
    const paidMilestones = milestones.filter((m) => m.status === "PAID" || m.status === "RELEASED");
    const pendingMilestones = milestones.filter((m) => m.status !== "PAID" && m.status !== "RELEASED");

    const pendingAmount = pendingMilestones.reduce((sum, m) => sum + Number(m.contractorPayout ?? m.amount), 0);

    return (
        <DashboardShell
            title="Earnings"
            description="Track your payouts, pending milestones, and lifetime earnings."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Lifetime Earnings" value={formatCurrency(totalEarnings)} icon={Wallet} tone="emerald" />
                <StatCard label="Pending Payout" value={formatCurrency(pendingAmount)} icon={Clock} tone="amber" />
                <StatCard label="Paid Milestones" value={String(paidMilestones.length)} icon={FileCheck2} tone="cyan" />
                <StatCard label="Avg. Milestone" value={paidMilestones.length ? formatCurrency(totalEarnings / paidMilestones.length) : formatCurrency(0)} icon={TrendingUp} tone="violet" />
            </div>

            <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Milestone History</h2>
                    <Badge tone="slate">{milestones.length} total</Badge>
                </div>
                {milestones.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                        <p className="text-sm text-slate-500">No milestones yet. Once approved, payouts appear here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {milestones.map((milestone) => (
                            <MilestoneRow
                                key={milestone.id}
                                title={milestone.title}
                                amount={String(milestone.contractorPayout ?? milestone.amount)}
                                status={milestone.status}
                                dueDate={milestone.dueDate?.toISOString()}
                                description={`${milestone.project.title} · ${milestone.status === "PAID" || milestone.status === "RELEASED" ? "net payout" : "gross amount"}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

