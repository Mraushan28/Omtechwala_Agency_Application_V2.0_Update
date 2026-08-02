"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/utils";
import { CircleDollarSign, Percent, Briefcase, BadgeCheck, Clock, FileClock } from "lucide-react";

type Overview = {
    tcv: number;
    grossMargin: number;
    activeProjects: number;
    vettedTalent: number;
    pendingRequests: number;
    verificationQueue: number;
};

export function PlatformOverview({ overview }: { overview: Overview }) {
    return (
        <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Contract Value (TCV)"
                    value={formatCurrency(overview.tcv)}
                    icon={CircleDollarSign}
                    tone="cyan"
                    sub="Committed escrow across all contracts"
                />
                <StatCard
                    label="Gross Margin (Commission)"
                    value={formatCurrency(overview.grossMargin)}
                    icon={Percent}
                    tone="emerald"
                    sub="Platform commission on committed milestones"
                />
                <StatCard
                    label="Active Projects"
                    value={String(overview.activeProjects)}
                    icon={Briefcase}
                    tone="violet"
                />
                <StatCard
                    label="Vetted Talent"
                    value={String(overview.vettedTalent)}
                    icon={BadgeCheck}
                    tone="amber"
                />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <div>
                            <p className="text-sm text-slate-400">Pending Contract Requests</p>
                            <p className="mt-1 text-2xl font-bold text-white">{overview.pendingRequests}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <FileClock className="h-5 w-5 text-cyan-400" />
                        <div>
                            <p className="text-sm text-slate-400">Verification Queue</p>
                            <p className="mt-1 text-2xl font-bold text-white">{overview.verificationQueue}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

