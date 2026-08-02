import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Applications" };

export default async function ClientApplicationsPage() {
    const session = await auth();
    if (!session?.user || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
        redirect("/signin");
    }

    const applications = await prisma.application.findMany({
        where: { project: { clientId: session.user.id } },
        orderBy: { submittedAt: "desc" },
        include: {
            project: { select: { id: true, title: true } },
            contractor: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    contractorProfiles: { select: { headline: true, hourlyRate: true, rating: true }, take: 1 },
                },
            },
        },
    });

    return (
        <DashboardShell
            title="Applications"
            description="Review proposals from vetted contractors across all your projects."
        >
            {applications.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No applications received yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {applications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                            <div className="flex items-center gap-4">
                                <Avatar name={application.contractor.name} src={application.contractor.image} />
                                <div>
                                    <p className="text-sm font-medium text-white">{application.contractor.name}</p>
                                    <p className="text-xs text-slate-500">{application.contractor.contractorProfiles?.[0]?.headline ?? "Contractor"}</p>
                                    <p className="mt-1 text-xs text-slate-400">Applied to: {application.project.title}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">
                                        {application.proposedRate ? `$${Number(application.proposedRate)}/hr` : "Rate on request"}
                                    </p>
                                    <p className="text-xs text-slate-500">{formatDate(application.submittedAt)}</p>
                                </div>
                                <Badge tone={application.status === "SHORTLISTED" ? "amber" : application.status === "ACCEPTED" ? "emerald" : application.status === "REJECTED" ? "red" : "slate"}>
                                    {application.status.replace(/_/g, " ")}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}

