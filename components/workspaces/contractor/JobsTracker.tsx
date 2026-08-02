"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Send, Wallet, TrendingUp, Clock, FileCheck2 } from "lucide-react";
import type { WorkspaceMilestone, WorkspaceProject } from "@/types/workspace";

type JobsTrackerProps = {
    jobs: WorkspaceProject[];
    earnings: {
        lifetime: number;
        pending: number;
        paidMilestones: number;
    };
};

function milestoneTone(status: string): "slate" | "amber" | "cyan" | "emerald" | "red" {
    switch (status) {
        case "IN_REVIEW":
            return "amber";
        case "APPROVED":
            return "cyan";
        case "PAID":
        case "RELEASED":
            return "emerald";
        case "DISPUTED":
            return "red";
        default:
            return "slate";
    }
}

export function JobsTracker({ jobs, earnings }: JobsTrackerProps) {
    return (
        <div>
            {/* Earnings summary */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-emerald-400" />
                        <div>
                            <p className="text-sm text-slate-400">Lifetime Earnings</p>
                            <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(earnings.lifetime)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-400" />
                        <div>
                            <p className="text-sm text-slate-400">Pending Payout</p>
                            <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(earnings.pending)}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-3">
                        <FileCheck2 className="h-5 w-5 text-cyan-400" />
                        <div>
                            <p className="text-sm text-slate-400">Paid Milestones</p>
                            <p className="mt-1 text-2xl font-bold text-white">{earnings.paidMilestones}</p>
                        </div>
                    </div>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <TrendingUp className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-500">No active jobs yet. Apply to contracts from the Available Contracts tab.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {jobs.map((job) => (
                        <section key={job.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-white">{job.title}</h3>
                                    <p className="text-xs text-slate-500">
                                        {job.client?.companyName ?? job.client?.name ?? "Client"} · Started {formatDate(job.startDate)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">
                                        Client rate {formatCurrency(job.clientRate ?? job.budget)}
                                    </span>
                                    <Badge tone="emerald">In Progress</Badge>
                                </div>
                            </div>

                            {/* Milestones */}
                            <div className="flex flex-col gap-2">
                                {job.milestones.length === 0 ? (
                                    <p className="text-sm text-slate-500">No milestones defined for this contract.</p>
                                ) : (
                                    job.milestones.map((milestone) => (
                                        <MilestoneItem key={milestone.id} jobId={job.id} milestone={milestone} />
                                    ))
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}

function MilestoneItem({ jobId, milestone }: { jobId: string; milestone: WorkspaceMilestone }) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deliverable, setDeliverable] = useState("");

    const canSubmit = milestone.status === "PENDING" || milestone.status === "DISPUTED";

    async function submitDeliverable(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const res = await fetch(`/api/milestones/${milestone.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "IN_REVIEW" }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error ?? "Failed to submit deliverable.");
            setSubmitting(false);
            return;
        }

        setSubmitted(true);
        setSubmitting(false);
    }

    const gross = milestone.amount;
    const commission = gross * milestone.commissionRate;
    const net = milestone.contractorPayout ?? gross - commission;

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white">{milestone.title}</p>
                        <Badge tone={milestoneTone(milestone.status)}>{milestone.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                        {milestone.description} · Due {formatDate(milestone.dueDate)}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-6 text-xs">
                    <div className="text-right">
                        <p className="text-slate-500">Gross</p>
                        <p className="font-semibold text-white">{formatCurrency(gross)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-600">Commission</p>
                        <p className="font-medium text-slate-400">-{formatCurrency(commission)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500">Net payout</p>
                        <p className="font-semibold text-emerald-400">{formatCurrency(net)}</p>
                    </div>
                </div>
            </div>

            {/* Deliverable submission */}
            {canSubmit && !submitted && (
                <form onSubmit={submitDeliverable} className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row">
                    <Input
                        name="deliverable"
                        placeholder="Link or summary of completed deliverable"
                        value={deliverable}
                        onChange={(e) => setDeliverable(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={submitting || deliverable.trim().length === 0} leftIcon={<Send className="h-3.5 w-3.5" />}>
                        {submitting ? "Submitting..." : "Submit for Review"}
                    </Button>
                </form>
            )}
            {submitted && (
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    Deliverable submitted for review.
                </p>
            )}
            {error && (
                <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}

