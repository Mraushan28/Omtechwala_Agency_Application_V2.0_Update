import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
    label: string;
    value: string;
    icon: LucideIcon;
    sub?: string;
    tone?: "cyan" | "emerald" | "amber" | "violet" | "slate";
};

const tones = {
    cyan: "bg-cyan-500/10 text-cyan-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    violet: "bg-violet-500/10 text-violet-400",
    slate: "bg-slate-800 text-slate-400",
};

export function StatCard({ label, value, icon: Icon, sub, tone = "cyan" }: StatCardProps) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-white">{value}</p>
                    {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

