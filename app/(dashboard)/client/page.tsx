import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, FolderKanban, Users, DollarSign, Clock } from "lucide-react";

export const metadata = { title: "Client Dashboard" };

export default async function ClientDashboardPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const [projects, applications, milestones] = await Promise.all([
        prisma.project.findMany({
            where: { clientId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 6,
            include: { applications: { select: { id: true } } },
        }),
        prisma.application.count({
            where: { project: { clientId: session.user.id } },
        }),
        prisma.milestone.aggregate({
            where: { project: { clientId: session.user.id } },
            _sum: { amount: true },
            _count: true,
        }),
    ]);

    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
    const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS").length;

    return (
        <DashboardShell
            title="Client Dashboard"
            description="Manage your outsourcing projects, applications, and escrow milestones."
            actions={
                <Link href="/client/projects/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
                </Link>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Projects" value={String(projects.length)} icon={FolderKanban} tone="cyan" />
                <StatCard label="Active Contracts" value={String(activeProjects)} icon={Clock} tone="violet" />
                <StatCard label="Total Applications" value={String(applications)} icon={Users} tone="amber" />
                <StatCard label="Escrow Committed" value={formatCurrency(totalBudget)} icon={DollarSign} tone="emerald" />
            </div>

            <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                    <Link href="/client/projects" className="text-sm text-cyan-400 hover:text-cyan-300">
                        View all
                    </Link>
                </div>
                {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
                        <p className="text-sm text-slate-500">No projects yet. Create your first project to start hiring.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                id={project.id}
                                href={`/client/projects/${project.id}`}
                                title={project.title}
                                category={project.category}
                                budget={String(project.budget)}
                                status={project.status}
                                deadline={project.deadline?.toISOString()}
                                applicationsCount={project.applications.length}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

// Helper (local to avoid circular import)
function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

