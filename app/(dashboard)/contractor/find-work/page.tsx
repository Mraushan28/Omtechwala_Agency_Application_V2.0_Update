import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProjectCard } from "@/components/dashboard/ProjectCard";

export const metadata = { title: "Find Work" };

export default async function FindWorkPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    // Projects in BIDDING status that the contractor has not applied to yet
    const applied = await prisma.application.findMany({
        where: { contractorId: session.user.id },
        select: { projectId: true },
    });
    const appliedIds = applied.map((a) => a.projectId);

    const projects = await prisma.project.findMany({
        where: {
            status: "BIDDING",
            id: { notIn: appliedIds },
        },
        orderBy: { createdAt: "desc" },
        include: {
            client: { select: { name: true, clientProfiles: { select: { companyName: true }, take: 1 } } },
            applications: { select: { id: true } },
        },
    });

    return (
        <DashboardShell
            title="Find Work"
            description="Browse open contracts from enterprise clients. Apply in one click."
        >
            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No open projects right now. Check back soon.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            href={`/contractor/projects/${project.id}`}
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

