import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "My Applications" };

export default async function ContractorApplicationsPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CONTRACTOR" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const applications = await prisma.application.findMany({
        where: { contractorId: session.user.id },
        orderBy: { submittedAt: "desc" },
        include: {
            project: { select: { id: true, title: true, category: true, budget: true } },
        },
    });

    return (
        <DashboardShell
            title="My Applications"
            description="Track the status of every proposal you have submitted."
        >
            {applications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No applications yet.</p>
                    <Link href="/contractor/find-work" className="mt-3 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300">
                        Browse open projects
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {applications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                            <div>
                                <Link href={`/contractor/projects/${application.project.id}`} className="text-sm font-medium text-white transition-colors hover:text-cyan-300">
                                    {application.project.title}
                                </Link>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {application.project.category.replace(/_/g, " ")} · {formatCurrency(Number(application.project.budget))} · Submitted {formatDate(application.submittedAt)}
                                </p>
                            </div>
                            <Badge
                                tone={
                                    application.status === "ACCEPTED"
                                        ? "emerald"
                                        : application.status === "SHORTLISTED"
                                            ? "amber"
                                            : application.status === "REJECTED" || application.status === "WITHDRAWN"
                                                ? "red"
                                                : "slate"
                                }
                            >
                                {application.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}

function formatCurrency(value: string | number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value));
}

