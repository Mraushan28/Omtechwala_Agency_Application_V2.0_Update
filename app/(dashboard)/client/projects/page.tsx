import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "My Projects" };

export default async function ClientProjectsPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const projects = await prisma.project.findMany({
        where: { clientId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { applications: { select: { id: true } }, milestones: true },
    });

    const escrowTotal = projects.reduce(
        (sum, p) => sum + p.milestones.reduce((mSum, m) => mSum + Number(m.amount), 0),
        0,
    );

    return (
        <DashboardShell
            title="My Projects"
            description={`${projects.length} projects · ${formatCurrency(escrowTotal)} committed to escrow`}
            actions={
                <Link href="/client/projects/new">
                    <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
                </Link>
            }
        >
            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No projects yet.</p>
                    <Link href="/client/projects/new" className="mt-3 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
                        Create your first project
                    </Link>
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
        </DashboardShell>
    );
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

