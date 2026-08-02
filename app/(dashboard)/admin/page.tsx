import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Briefcase, Wallet, BadgeCheck } from "lucide-react";

export const metadata = { title: "Admin Panel" };

export default async function AdminDashboardPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const [userCount, contractorCount, clientCount, projectCount, milestoneCount, verificationQueue, escrowAgg] =
        await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "CONTRACTOR" } }),
            prisma.user.count({ where: { role: "CLIENT" } }),
            prisma.project.count(),
            prisma.milestone.count(),
            prisma.contractorProfile.count({ where: { verificationStatus: "PENDING" } }),
            prisma.milestone.aggregate({ where: { status: { notIn: ["PAID", "RELEASED"] } }, _sum: { amount: true } }),
        ]);

    return (
        <DashboardShell
            title="Super Admin Panel"
            description="Platform-wide oversight of users, projects, escrow, and verifications."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Users" value={String(userCount)} icon={Users} tone="cyan" />
                <StatCard label="Projects" value={String(projectCount)} icon={Briefcase} tone="violet" />
                <StatCard label="Active Escrow" value={formatCurrency(Number(escrowAgg._sum.amount ?? 0))} icon={Wallet} tone="emerald" />
                <StatCard label="Verification Queue" value={String(verificationQueue)} icon={BadgeCheck} tone="amber" />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Platform Composition</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-sm text-slate-400">Contractors</span>
                            <span className="text-sm font-semibold text-white">{contractorCount}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-sm text-slate-400">Clients</span>
                            <span className="text-sm font-semibold text-white">{clientCount}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-sm text-slate-400">Milestones Created</span>
                            <span className="text-sm font-semibold text-white">{milestoneCount}</span>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h2 className="mb-4 text-lg font-semibold text-white">Quick Links</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a href="/admin/users" className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300 transition-colors hover:border-cyan-500/30">
                            Manage Users
                        </a>
                        <a href="/admin/verifications" className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300 transition-colors hover:border-cyan-500/30">
                            Verify Talent
                        </a>
                        <a href="/admin/projects" className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300 transition-colors hover:border-cyan-500/30">
                            All Projects
                        </a>
                        <a href="/api/auth/signout" className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-red-400 transition-colors hover:border-red-500/30">
                            Sign Out
                        </a>
                    </div>
                </section>
            </div>
        </DashboardShell>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

