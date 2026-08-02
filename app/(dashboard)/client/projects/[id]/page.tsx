import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MilestoneRow } from "@/components/dashboard/MilestoneRow";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, CircleDollarSign, FileText, ShieldCheck, Star } from "lucide-react";

export const metadata = { title: "Project Detail" };

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user) redirect("/signin");

    const { id } = await params;
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            contractor: { select: { name: true, contractorProfiles: { select: { headline: true, rating: true }, take: 1 } } },
            applications: {
                include: {
                    contractor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            contractorProfiles: { select: { headline: true, hourlyRate: true, skills: true, rating: true }, take: 1 },
                        },
                    },
                },
            },
            milestones: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!project) notFound();

    const isOwner = project.clientId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) redirect("/client");

    const categoryLabel = project.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <DashboardShell
            title={project.title}
            description={`${categoryLabel} · Posted ${formatDate(project.createdAt)}`}
            actions={<Badge tone={project.status === "IN_PROGRESS" ? "emerald" : project.status === "BIDDING" ? "cyan" : project.status === "COMPLETED" ? "violet" : "slate"}>{project.status.replace(/_/g, " ")}</Badge>}
        >
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main column */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Overview */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Overview</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{project.description}</p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <CircleDollarSign className="h-5 w-5 text-cyan-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Budget</p>
                                    <p className="text-sm font-semibold text-white">{formatCurrency(Number(project.budget))}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CalendarDays className="h-5 w-5 text-cyan-500" />
                                <div>
                                    <p className="text-xs text-slate-500">Deadline</p>
                                    <p className="text-sm font-semibold text-white">{project.deadline ? formatDate(project.deadline) : "Flexible"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-cyan-500" />
                                <div>
                                    <p className="text-xs text-slate-500">NDA</p>
                                    <p className="text-sm font-semibold text-white">Protected</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Scope */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Scope of Work</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{project.scope}</p>
                    </section>

                    {/* Applications */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Applications</h2>
                            <Badge tone="cyan">{project.applications.length} total</Badge>
                        </div>
                        {project.applications.length === 0 ? (
                            <p className="text-sm text-slate-500">No applications yet. Promote this project to attract talent.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {project.applications.map((application) => (
                                    <div key={application.id} className="flex items-start justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar name={application.contractor.name} src={application.contractor.image} />
                                            <div>
                                                <p className="text-sm font-medium text-white">{application.contractor.name}</p>
                                                <p className="text-xs text-slate-500">{application.contractor.contractorProfiles?.[0]?.headline}</p>
                                                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{application.coverLetter}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {application.contractor.contractorProfiles?.[0]?.skills?.slice(0, 3).map((skill) => (
                                                        <Badge key={skill} tone="slate">{skill}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            {application.contractor.contractorProfiles?.[0]?.rating ? (
                                                <span className="flex items-center gap-1 text-sm text-amber-400">
                                                    <Star className="h-4 w-4 fill-amber-400" />
                                                    {application.contractor.contractorProfiles[0].rating.toFixed(1)}
                                                </span>
                                            ) : null}
                                            <span className="text-sm font-semibold text-white">
                                                {application.proposedRate ? formatCurrency(Number(application.proposedRate)) + "/hr" : "Rate on request"}
                                            </span>
                                            <Badge tone={application.status === "SHORTLISTED" ? "amber" : application.status === "ACCEPTED" ? "emerald" : "slate"}>
                                                {application.status.replace(/_/g, " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="flex flex-col gap-6">
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Escrow Milestones</h3>
                        <div className="flex flex-col gap-3">
                            {project.milestones.length === 0 ? (
                                <p className="text-sm text-slate-500">No milestones created yet.</p>
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

                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Contractor</h3>
                        {project.contractor ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar name={project.contractor.name} size="md" />
                                    <div>
                                        <p className="text-sm font-medium text-white">{project.contractor.name}</p>
                                        <p className="text-xs text-slate-500">{project.contractor.contractorProfiles?.[0]?.headline}</p>
                                    </div>
                                </div>
                                {project.contractor.contractorProfiles?.[0]?.rating ? (
                                    <span className="flex items-center gap-1 text-sm text-amber-400">
                                        <Star className="h-4 w-4 fill-amber-400" />
                                        {project.contractor.contractorProfiles[0].rating.toFixed(1)} rating
                                    </span>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No contractor assigned yet.</p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                            <FileText className="h-4 w-4" />
                            Actions
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">Export Project Data</Button>
                            <Button variant="ghost" size="sm">Edit Details</Button>
                        </div>
                    </section>
                </aside>
            </div>
        </DashboardShell>
    );
}

