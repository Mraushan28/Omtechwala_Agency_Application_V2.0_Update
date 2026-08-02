"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, FileStack, Users } from "lucide-react";
import type { WorkspaceProject } from "@/types/workspace";

function statusTone(status: string): "emerald" | "cyan" | "violet" | "slate" | "red" {
    switch (status) {
        case "IN_PROGRESS":
            return "emerald";
        case "BIDDING":
            return "cyan";
        case "COMPLETED":
            return "violet";
        case "CANCELLED":
            return "red";
        default:
            return "slate";
    }
}

export function ContractsTable({ projects }: { projects: WorkspaceProject[] }) {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filtered = projects.filter((p) => {
        const matchesQuery =
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            (p.contractor?.name ?? "").toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    const activeContracts = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "COMPLETED");
    const committed = activeContracts.reduce(
        (sum, p) => sum + p.milestones.reduce((m, x) => m + x.amount, 0),
        0,
    );
    const paid = activeContracts.reduce(
        (sum, p) =>
            sum +
            p.milestones
                .filter((m) => m.status === "PAID" || m.status === "RELEASED")
                .reduce((m, x) => m + x.amount, 0),
        0,
    );

    return (
        <div>
            {/* Summary */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Active Contracts" value={String(activeContracts.length)} />
                <SummaryCard label="Escrow Committed" value={formatCurrency(committed)} />
                <SummaryCard label="Paid to Talent" value={formatCurrency(paid)} />
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-xs">
                    <Input
                        name="search"
                        placeholder="Search contracts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {["ALL", "DRAFT", "BIDDING", "IN_PROGRESS", "COMPLETED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={
                                statusFilter === s
                                    ? "rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950"
                                    : "rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700"
                            }
                        >
                            {s.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Contract</th>
                                <th className="px-4 py-3 font-medium">Assigned Talent</th>
                                <th className="px-4 py-3 font-medium">Milestones</th>
                                <th className="px-4 py-3 font-medium">Budget</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                                        No contracts match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((project) => {
                                    const projectPaid = project.milestones
                                        .filter((m) => m.status === "PAID" || m.status === "RELEASED")
                                        .reduce((sum, m) => sum + m.amount, 0);
                                    const total = project.milestones.reduce((sum, m) => sum + m.amount, 0);
                                    return (
                                        <tr key={project.id} className="bg-slate-900/40 transition-colors hover:bg-slate-900/80">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{project.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {project.category.replace(/_/g, " ")}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {project.contractor?.name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar name={project.contractor.name} size="sm" />
                                                        <span className="text-slate-300">{project.contractor.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Users className="h-3.5 w-3.5" />
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-xs text-slate-400">
                                                    {project.milestones.filter((m) => m.status === "PAID" || m.status === "RELEASED").length} / {project.milestones.length} paid
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatCurrency(projectPaid)} of {formatCurrency(total)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{formatCurrency(project.budget)}</td>
                                            <td className="px-4 py-3">
                                                <Badge tone={statusTone(project.status)}>
                                                    {project.status.replace(/_/g, " ")}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {projects.length === 0 && (
                <div className="mt-8 rounded-xl border border-dashed border-slate-800 p-10 text-center">
                    <FileStack className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-500">No contracts yet. Create a project in the New Project tab to get started.</p>
                </div>
            )}
        </div>
    );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

