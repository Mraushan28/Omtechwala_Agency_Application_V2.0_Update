import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export const metadata = { title: "All Projects" };

export default async function AdminProjectsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: { applications: { select: { id: true } } },
    });

    return (
        <DashboardShell
            title="All Projects"
            description="Platform-wide view of every project and contract."
        >
            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No projects on the platform yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            href={`/admin/projects/${project.id}`}
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

