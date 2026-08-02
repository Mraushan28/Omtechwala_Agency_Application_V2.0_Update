import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Search, Briefcase, Wallet, Star, ArrowRight } from "lucide-react";

export const metadata = { title: "Contractor Dashboard" };

export default async function ContractorDashboardPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const [profile, applications, projects, milestones] = await Promise.all([
        prisma.contractorProfile.findFirst({ where: { userId: session.user.id } }),
        prisma.application.findMany({
            where: { contractorId: session.user.id },
            orderBy: { submittedAt: "desc" },
            take: 5,
            include: { project: { select: { id: true, title: true, category: true, budget: true, status: true } } },
        }),
        prisma.project.findMany({
            where: { contractorId: session.user.id, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
            select: { id: true },
        }),
        prisma.milestone.aggregate({
            where: { contractorId: session.user.id, status: { in: ["PAID", "RELEASED"] } },
            _sum: { contractorPayout: true },
        }),
    ]);

    const openProjects = await prisma.project.count({ where: { status: "BIDDING" } });

    return (
        <DashboardShell
            title="Contractor Dashboard"
            description={profile?.headline ?? "Welcome back, talent."}
            actions={
                <Link href="/contractor/find-work">
                    <Button leftIcon={<Search className="h-4 w-4" />}>Find Work</Button>
                </Link>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Open Projects" value={String(openProjects)} icon={Briefcase} tone="cyan" />
                <StatCard label="Applications" value={String(applications.length)} icon={Search} tone="amber" />
                <StatCard label="Active Contracts" value={String(projects.length)} icon={Briefcase} tone="violet" />
                <StatCard
                    label="Total Earnings"
                    value={formatCurrency(Number(milestones._sum.contractorPayout ?? 0))}
                    icon={Wallet}
                    tone="emerald"
                />
            </div>

            {/* Verification banner */}
            {profile?.verificationStatus === "UNVERIFIED" && (
                <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm font-medium text-amber-300">
                        Complete your profile and verification to unlock premium project invitations.
                    </p>
                </div>
            )}

            <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
                    <Link href="/contractor/applications" className="text-sm text-cyan-400 hover:text-cyan-300">
                        View all
                    </Link>
                </div>
                {applications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
                        <p className="text-sm text-slate-500">You have not applied to any projects yet.</p>
                        <Link href="/contractor/find-work" className="mt-3 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
                            Browse open projects
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {applications.map((application) => (
                            <Link
                                key={application.id}
                                href={`/contractor/projects/${application.project.id}`}
                                className="group flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-cyan-500/30"
                            >
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-cyan-300">
                                        {application.project.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {application.project.category.replace(/_/g, " ")} · {formatCurrency(Number(application.project.budget))}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <Badge
                                        tone={
                                            application.status === "ACCEPTED"
                                                ? "emerald"
                                                : application.status === "SHORTLISTED"
                                                    ? "amber"
                                                    : application.status === "REJECTED"
                                                        ? "red"
                                                        : "slate"
                                        }
                                    >
                                        {application.status.replace(/_/g, " ")}
                                    </Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-cyan-400" />
                                </div>
                            </Link>
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

