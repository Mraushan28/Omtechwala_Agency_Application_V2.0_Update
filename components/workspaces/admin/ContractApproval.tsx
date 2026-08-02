"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { FileSignature, Star, Search } from "lucide-react";
import type { WorkspaceContractor, WorkspaceProject } from "@/types/workspace";

type ContractApprovalProps = {
    projects: WorkspaceProject[];
    contractors: WorkspaceContractor[];
};

type AssignmentState = {
    projectId: string;
    contractorId: string;
    clientRate: string;
    contractorRate: string;
    submitting: boolean;
    error: string | null;
    success: string | null;
};

function emptyState(projectId: string): AssignmentState {
    return { projectId, contractorId: "", clientRate: "", contractorRate: "", submitting: false, error: null, success: null };
}

export function ContractApproval({ projects, contractors }: ContractApprovalProps) {
    const [query, setQuery] = useState("");
    const [assignment, setAssignment] = useState<Record<string, AssignmentState>>({});

    const getState = (projectId: string) => assignment[projectId] ?? emptyState(projectId);

    function updateProject(projectId: string, patch: Partial<AssignmentState>) {
        setAssignment((prev) => ({ ...prev, [projectId]: { ...emptyState(projectId), ...prev[projectId], ...patch } }));
    }

    async function assign(project: WorkspaceProject, state: AssignmentState) {
        updateProject(project.id, { submitting: true, error: null, success: null });

        const res = await fetch("/api/admin/contracts/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: project.id,
                contractorId: state.contractorId,
                clientRate: Number(state.clientRate),
                contractorRate: Number(state.contractorRate),
            }),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            updateProject(project.id, { submitting: false, error: body.error ?? "Failed to assign contract." });
            return;
        }

        updateProject(project.id, {
            submitting: false,
            success: `Contract assigned. Commission rate ${(body.commission?.commissionRate * 100).toFixed(1)}%.`,
        });
    }

    const filteredContractors = contractors.filter((c) =>
        (c.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (c.headline ?? "").toLowerCase().includes(query.toLowerCase()),
    );

    if (projects.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                <FileSignature className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-500">No pending contract requests. New client projects will appear here for assignment.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {projects.map((project) => {
                const state = getState(project.id);
                const commissionDelta = state.clientRate && state.contractorRate
                    ? (1 - Number(state.contractorRate) / Number(state.clientRate)) * 100
                    : null;

                return (
                    <section key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">{project.title}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {project.client?.companyName ?? project.client?.name ?? "Client"} · {project.category.replace(/_/g, " ")}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {project.techStack.slice(0, 5).map((tech) => (
                                        <Badge key={tech} tone="slate">{tech}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                                <Badge tone="cyan">{project.status.replace(/_/g, " ")}</Badge>
                                <span className="text-sm font-semibold text-white">{formatCurrency(project.budget)}</span>
                                <span className="text-xs text-slate-500">
                                    {project.deliverables.length} deliverables · {project.timelineWeeks ?? "—"} weeks
                                </span>
                            </div>
                        </div>

                        {/* Assignment form */}
                        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Contractor</p>
                            </div>

                            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative w-full max-w-xs">
                                    <Input
                                        name={`contractor-search-${project.id}`}
                                        placeholder="Search verified talent..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        leftIcon={<Search className="h-4 w-4" />}
                                    />
                                </div>
                                <select
                                    value={state.contractorId}
                                    onChange={(e) => updateProject(project.id, { contractorId: e.target.value })}
                                    className="h-11 flex-1 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                >
                                    <option value="">Select a contractor...</option>
                                    {filteredContractors.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} — {formatCurrency(c.hourlyRate ?? 0)}/hr · {c.rating ? `${c.rating}★` : "Unrated"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {state.contractorId && (
                                <SelectedContractor
                                    contractor={contractors.find((c) => c.id === state.contractorId)}
                                />
                            )}

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <Input
                                    name={`client-rate-${project.id}`}
                                    label="Client rate (USD)"
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 85000"
                                    value={state.clientRate}
                                    onChange={(e) => updateProject(project.id, { clientRate: e.target.value })}
                                />
                                <Input
                                    name={`contractor-rate-${project.id}`}
                                    label="Contractor payout rate (USD)"
                                    type="number"
                                    min={0}
                                    placeholder="e.g. 68000"
                                    value={state.contractorRate}
                                    onChange={(e) => updateProject(project.id, { contractorRate: e.target.value })}
                                />
                            </div>

                            {commissionDelta !== null && commissionDelta >= 0 && (
                                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/80 px-4 py-2.5 text-sm">
                                    <span className="text-slate-400">Commission delta (gross margin)</span>
                                    <span className="font-semibold text-emerald-400">{commissionDelta.toFixed(1)}%</span>
                                </div>
                            )}

                            {state.error && (
                                <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
                            )}
                            {state.success && (
                                <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</p>
                            )}

                            <div className="mt-4">
                                <Button
                                    size="sm"
                                    disabled={state.submitting || !state.contractorId || !state.clientRate || !state.contractorRate}
                                    onClick={() => assign(project, state)}
                                    leftIcon={<FileSignature className="h-4 w-4" />}
                                >
                                    {state.submitting ? "Assigning..." : "Approve & Assign Contract"}
                                </Button>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function SelectedContractor({ contractor }: { contractor: WorkspaceContractor | undefined }) {
    if (!contractor) return null;
    return (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-900/80 px-4 py-2.5">
            <Avatar name={contractor.name} src={contractor.image} size="sm" />
            <div>
                <p className="text-sm font-medium text-white">{contractor.name}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{contractor.headline}</p>
            </div>
            {contractor.rating ? (
                <span className="ml-auto flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    {contractor.rating.toFixed(1)}
                </span>
            ) : null}
        </div>
    );
}

