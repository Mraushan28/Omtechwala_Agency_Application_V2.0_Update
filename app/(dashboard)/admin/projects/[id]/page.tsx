import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { MilestoneRow } from "@/components/dashboard/MilestoneRow";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Project Detail" };

export default async function AdminProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            client: { select: { name: true, email: true, clientProfiles: { select: { companyName: true }, take: 1 } } },
            contractor: { select: { name: true, email: true, contractorProfiles: { select: { headline: true }, take: 1 } } },
            milestones: true,
        },
    });

    if (!project) notFound();

    return (
        <DashboardShell
            title={project.title}
            description={`Posted by ${project.client?.clientProfiles?.[0]?.companyName ?? project.client?.name} · ${formatDate(project.createdAt)}`}
            actions={<Badge tone={project.status === "IN_PROGRESS" ? "emerald" : project.status === "BIDDING" ? "cyan" : "slate"}>{project.status.replace(/_/g, " ")}</Badge>}
        >
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Description</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{project.description}</p>
                    </section>
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Scope</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{project.scope}</p>
                    </section>
                </div>

                <aside className="flex flex-col gap-6">
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Contract</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Budget</span>
                                <span className="font-semibold text-white">{formatCurrency(Number(project.budget))}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Deadline</span>
                                <span className="text-white">{project.deadline ? formatDate(project.deadline) : "Flexible"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Client</span>
                                <span className="text-white">{project.client?.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Contractor</span>
                                <span className="text-white">{project.contractor?.name ?? "Unassigned"}</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Milestones</h3>
                        <div className="flex flex-col gap-2">
                            {project.milestones.length === 0 ? (
                                <p className="text-sm text-slate-500">No milestones.</p>
                            ) : (
                                project.milestones.map((milestone) => (
                                    <MilestoneRow
                                        key={milestone.id}
                                        title={milestone.title}
                                        amount={String(milestone.amount)}
                                        status={milestone.status}
                                        dueDate={milestone.dueDate?.toISOString()}
                                        description={milestone.description}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </DashboardShell>
    );
}

