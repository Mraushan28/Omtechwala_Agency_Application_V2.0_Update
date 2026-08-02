"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, BriefcaseBusiness, Clock, Layers } from "lucide-react";
import Link from "next/link";
import type { WorkspaceProject } from "@/types/workspace";

const COMMISSION_RATE = 0.12;

const categoryOptions = ["ALL", "WEB_DEVELOPMENT", "AI_ML", "AI_TRAINING", "UI_UX_DESIGN", "GRAPHIC_DESIGN"];
const budgetOptions = [
    { label: "Any budget", value: "ANY" },
    { label: "Under $25k", value: "UNDER_25" },
    { label: "$25k – $50k", value: "25_50" },
    { label: "Over $50k", value: "OVER_50" },
];

export function ContractsBoard({ projects }: { projects: WorkspaceProject[] }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [budgetFilter, setBudgetFilter] = useState("ANY");
    const [techFilter, setTechFilter] = useState("ALL");

    const allTech = Array.from(new Set(projects.flatMap((p) => p.techStack))).sort();

    const filtered = projects.filter((p) => {
        const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "ALL" || p.category === category;
        const matchesTech = techFilter === "ALL" || p.techStack.includes(techFilter);
        let matchesBudget = true;
        if (budgetFilter === "UNDER_25") matchesBudget = p.budget <= 25000;
        if (budgetFilter === "25_50") matchesBudget = p.budget > 25000 && p.budget <= 50000;
        if (budgetFilter === "OVER_50") matchesBudget = p.budget > 50000;
        return matchesQuery && matchesCategory && matchesTech && matchesBudget;
    });

    return (
        <div>
            <p className="mb-6 max-w-2xl text-sm text-slate-400">
                Open enterprise contracts. The platform commission of {COMMISSION_RATE * 100}% is deducted transparently — you see the full client budget and your estimated net payout.
            </p>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full max-w-xs">
                    <Input
                        name="search"
                        placeholder="Search contracts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="h-11 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                        {categoryOptions.map((c) => (
                            <option key={c} value={c}>{c === "ALL" ? "All categories" : c.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                    <select
                        value={budgetFilter}
                        onChange={(e) => setBudgetFilter(e.target.value)}
                        className="h-11 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                        {budgetOptions.map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                    <select
                        value={techFilter}
                        onChange={(e) => setTechFilter(e.target.value)}
                        className="h-11 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    >
                        <option value="ALL">All tech stacks</option>
                        {allTech.map((tech) => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-slate-700" />
                    <p className="text-sm text-slate-500">No open contracts match your filters.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((project) => {
                        const netPayout = project.budget * (1 - COMMISSION_RATE);
                        return (
                            <div key={project.id} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-cyan-500/30">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-white">{project.title}</h3>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {project.client?.companyName ?? project.client?.name ?? "Enterprise Client"}
                                        </p>
                                    </div>
                                    <Badge tone="cyan">{project.category.replace(/_/g, " ")}</Badge>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {project.techStack.slice(0, 4).map((tech) => (
                                        <Badge key={tech} tone="slate">{tech}</Badge>
                                    ))}
                                    {project.techStack.length > 4 ? <Badge tone="slate">+{project.techStack.length - 4}</Badge> : null}
                                </div>

                                {/* Commission transparency */}
                                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Client budget</span>
                                        <span className="font-semibold text-white">{formatCurrency(project.budget)}</span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                        <span className="text-slate-600">Platform commission ({(project.commissionRate * 100).toFixed(0)}%)</span>
                                        <span className="text-slate-500">-{formatCurrency(project.budget * project.commissionRate)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 text-sm">
                                        <span className="text-slate-400">Estimated net payout</span>
                                        <span className="font-bold text-emerald-400">{formatCurrency(netPayout)}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        {project.timelineWeeks ? `${project.timelineWeeks} weeks` : formatDate(project.deadline)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Layers className="h-3.5 w-3.5" />
                                        {project.deliverables.length} deliverables
                                    </span>
                                </div>

                                <Link href={`/contractor/projects/${project.id}`}>
                                    <Button variant="outline" size="sm" fullWidth>View & Apply</Button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

