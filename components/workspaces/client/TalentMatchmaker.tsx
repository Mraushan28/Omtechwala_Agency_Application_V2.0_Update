"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency } from "@/lib/utils";
import { Search, Star, ShieldCheck, Briefcase } from "lucide-react";
import type { WorkspaceContractor, WorkspaceProject } from "@/types/workspace";

type TalentMatchmakerProps = {
    projects: WorkspaceProject[];
    contractors: WorkspaceContractor[];
};

export function TalentMatchmaker({ projects, contractors }: TalentMatchmakerProps) {
    const [query, setQuery] = useState("");
    const [skillFilter, setSkillFilter] = useState("ALL");

    const allSkills = Array.from(new Set(contractors.flatMap((c) => c.skills))).sort();

    const filtered = contractors.filter((c) => {
        const matchesQuery =
            (c.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
            (c.headline ?? "").toLowerCase().includes(query.toLowerCase());
        const matchesSkill = skillFilter === "ALL" || c.skills.includes(skillFilter);
        return matchesQuery && matchesSkill;
    });

    const assignedContractorIds = new Set(
        projects.filter((p) => p.contractorId).map((p) => p.contractorId),
    );

    return (
        <div>
            <p className="mb-6 max-w-2xl text-sm text-slate-400">
                Review verified contractor profiles matched to your projects. Admin assigns talent to a contract; this view helps you shortlist.
            </p>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-xs">
                    <Input
                        name="search"
                        placeholder="Search talent..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                    />
                </div>
                <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="h-11 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                >
                    <option value="ALL">All skills</option>
                    {allSkills.map((skill) => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>
            </div>

            {/* Contractor cards */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-14 text-center">
                    <p className="text-sm text-slate-500">No talent matches your filters.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((contractor) => (
                        <div
                            key={contractor.id}
                            className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-cyan-500/30"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar name={contractor.name} src={contractor.image} size="lg" />
                                    <div>
                                        <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                                            {contractor.name}
                                            {contractor.isTopRated && (
                                                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{contractor.headline}</p>
                                    </div>
                                </div>
                                {contractor.rating ? (
                                    <span className="flex items-center gap-1 text-sm text-amber-400">
                                        <Star className="h-4 w-4 fill-amber-400" />
                                        {contractor.rating.toFixed(1)}
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {contractor.skills.slice(0, 4).map((skill) => (
                                    <Badge key={skill} tone="slate">{skill}</Badge>
                                ))}
                                {contractor.skills.length > 4 ? (
                                    <Badge tone="slate">+{contractor.skills.length - 4}</Badge>
                                ) : null}
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
                                <div>
                                    <p className="font-semibold text-white">
                                        {contractor.hourlyRate ? `${formatCurrency(contractor.hourlyRate)}/hr` : "Rate on request"}
                                    </p>
                                    <p className="text-xs text-slate-500">{contractor.experienceYears} yrs exp</p>
                                </div>
                                <div className="text-right">
                                    {assignedContractorIds.has(contractor.id) ? (
                                        <Badge tone="emerald">Assigned</Badge>
                                    ) : (
                                        <Badge tone="cyan">{contractor.availability.replace(/_/g, " ")}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assigned talent on current projects */}
            {projects.filter((p) => p.contractor).length > 0 && (
                <div className="mt-10">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                        <Briefcase className="h-4 w-4" />
                        Assigned to your projects
                    </h3>
                    <div className="flex flex-col gap-2">
                        {projects.filter((p) => p.contractor).map((p) => (
                            <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-white">{p.title}</p>
                                    <p className="text-xs text-slate-500">{p.contractor?.name}</p>
                                </div>
                                <Badge tone="emerald">Active</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

