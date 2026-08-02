"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { Check, X, BadgeCheck } from "lucide-react";
import type { WorkspaceContractor } from "@/types/workspace";

type VerificationQueueProps = {
    queue: WorkspaceContractor[];
};

type DecisionState = {
    decision: "APPROVE" | "REJECT" | null;
    submitting: boolean;
    error: string | null;
    done: "APPROVE" | "REJECT" | null;
};

export function VerificationQueue({ queue }: VerificationQueueProps) {
    const [decisions, setDecisions] = useState<Record<string, DecisionState>>({});

    const getState = (id: string): DecisionState =>
        decisions[id] ?? { decision: null, submitting: false, error: null, done: null };

    async function decide(contractor: WorkspaceContractor, decision: "APPROVE" | "REJECT") {
        setDecisions((prev) => ({
            ...prev,
            [contractor.id]: { decision, submitting: true, error: null, done: null },
        }));

        const res = await fetch(`/api/admin/verifications/${contractor.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                decision,
                notes: decision === "APPROVE" ? "Approved by admin review" : "Application did not meet vetting criteria",
            }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setDecisions((prev) => ({
                ...prev,
                [contractor.id]: { decision, submitting: false, error: body.error ?? "Failed to update verification.", done: null },
            }));
            return;
        }

        setDecisions((prev) => ({
            ...prev,
            [contractor.id]: { decision, submitting: false, error: null, done: decision },
        }));
    }

    if (queue.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                <BadgeCheck className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-500">Verification queue is clear. New contractor verification requests will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {queue.map((contractor) => {
                const state = getState(contractor.id);
                const done = state.done;

                return (
                    <div key={contractor.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar name={contractor.name} src={contractor.image} size="lg" />
                                <div>
                                    <p className="text-sm font-medium text-white">{contractor.name}</p>
                                    <p className="text-xs text-slate-500">{contractor.email}</p>
                                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{contractor.headline}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                                <Badge tone={contractor.verificationStatus === "PENDING" ? "amber" : contractor.verificationStatus === "REJECTED" ? "red" : "slate"}>
                                    {contractor.verificationStatus.replace(/_/g, " ")}
                                </Badge>
                                <p className="text-sm font-semibold text-white">
                                    {contractor.hourlyRate ? `${formatCurrency(contractor.hourlyRate)}/hr` : "—"}
                                </p>
                                <p className="text-xs text-slate-500">{contractor.experienceYears} yrs exp · {contractor.skills.length} skills</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {contractor.skills.slice(0, 6).map((skill) => (
                                <Badge key={skill} tone="slate">{skill}</Badge>
                            ))}
                            {contractor.skills.length > 6 ? <Badge tone="slate">+{contractor.skills.length - 6}</Badge> : null}
                        </div>

                        {contractor.resumeUrl && (
                            <p className="mt-3 text-xs text-slate-500">
                                Assessment: <a href={contractor.resumeUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{contractor.resumeUrl}</a>
                            </p>
                        )}

                        {state.error && (
                            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
                        )}

                        {done === "APPROVE" && (
                            <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                Verification approved. Contractor is now vetted.
                            </p>
                        )}
                        {done === "REJECT" && (
                            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                Verification rejected.
                            </p>
                        )}

                        {!done && (
                            <div className="mt-4 flex items-center gap-3">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={state.submitting}
                                    onClick={() => decide(contractor, "APPROVE")}
                                    leftIcon={<Check className="h-4 w-4" />}
                                >
                                    {state.submitting && state.decision === "APPROVE" ? "Approving..." : "Approve"}
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    disabled={state.submitting}
                                    onClick={() => decide(contractor, "REJECT")}
                                    leftIcon={<X className="h-4 w-4" />}
                                >
                                    {state.submitting && state.decision === "REJECT" ? "Rejecting..." : "Reject"}
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

