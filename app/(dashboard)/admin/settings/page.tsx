import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Admin Settings" };

export default async function AdminSettingsPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/signin");
    }

    return (
        <DashboardShell
            title="Admin Settings"
            description="Platform configuration and security settings."
        >
            <div className="max-w-2xl space-y-5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <ShieldCheck className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Super Administrator</p>
                            <p className="text-xs text-slate-500">{session.user.email}</p>
                        </div>
                        <Badge tone="violet">ADMIN</Badge>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Platform Controls</h3>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-slate-400">Contractor verification</span>
                            <span className="text-emerald-400">Automated + manual review</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-slate-400">Default commission rate</span>
                            <span className="text-white">12%</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                            <span className="text-slate-400">NDA policy</span>
                            <span className="text-white">Enforced on all contracts</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

