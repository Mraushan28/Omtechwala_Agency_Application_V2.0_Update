import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

export const metadata = { title: "Verifications" };

export default async function AdminVerificationsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    const profiles = await prisma.contractorProfile.findMany({
        where: { verificationStatus: { in: ["PENDING", "UNVERIFIED"] } },
        orderBy: { updatedAt: "asc" },
        include: { user: { select: { name: true, email: true, image: true } } },
    });

    return (
        <DashboardShell
            title="Contractor Verifications"
            description="Review and approve contractor profiles requesting verification."
        >
            {profiles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <BadgeCheck className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-500">No profiles pending verification. Excellent.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {profiles.map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                            <div className="flex items-center gap-4">
                                <Avatar name={profile.user.name} src={profile.user.image} />
                                <div>
                                    <p className="text-sm font-medium text-white">{profile.user.name}</p>
                                    <p className="text-xs text-slate-500">{profile.user.email}</p>
                                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{profile.headline}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">
                                        {profile.hourlyRate ? formatCurrency(Number(profile.hourlyRate)) + "/hr" : "—"}
                                    </p>
                                    <p className="text-xs text-slate-500">{profile.experienceYears} yrs exp</p>
                                </div>
                                <Badge tone={profile.verificationStatus === "PENDING" ? "amber" : "slate"}>
                                    {profile.verificationStatus.replace(/_/g, " ")}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}

