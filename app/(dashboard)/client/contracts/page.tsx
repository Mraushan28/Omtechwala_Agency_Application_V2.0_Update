import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { MilestoneRow } from "@/components/dashboard/MilestoneRow";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileSignature } from "lucide-react";

export const metadata = { title: "Contracts & Escrow" };

export default async function ClientContractsPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const projects = await prisma.project.findMany({
        where: { clientId: session.user.id, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
        include: {
            contractor: { select: { name: true } },
            milestones: { orderBy: { dueDate: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return (
        <DashboardShell
            title="Contracts & Escrow"
            description="Track active contracts, milestones, and escrow payouts."
        >
            {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <FileSignature className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-500">No active contracts yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {projects.map((project) => {
                        const committed = project.milestones.reduce((sum, m) => sum + Number(m.amount), 0);
                        const paid = project.milestones
                            .filter((m) => m.status === "PAID" || m.status === "RELEASED")
                            .reduce((sum, m) => sum + Number(m.amount), 0);

                        return (
                            <section key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-white">{project.title}</h2>
                                        <p className="text-xs text-slate-500">
                                            {project.contractor?.name ?? "Unassigned"} · Started {formatDate(project.startDate ?? project.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">
                                            {formatCurrency(paid)} paid / {formatCurrency(committed)} committed
                                        </span>
                                        <Badge tone={project.status === "COMPLETED" ? "violet" : "emerald"}>
                                            {project.status.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {project.milestones.length === 0 ? (
                                        <p className="text-sm text-slate-500">No milestones defined for this contract.</p>
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
                        );
                    })}
                </div>
            )}
        </DashboardShell>
    );
}

