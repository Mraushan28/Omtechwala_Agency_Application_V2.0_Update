"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Send, Star } from "lucide-react";

export default function ContractorProjectDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [applied, setApplied] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["project", params.id],
        queryFn: async () => {
            const res = await fetch(`/api/projects/${params.id}`);
            if (!res.ok) throw new Error("Failed to load project");
            return (await res.json()).project;
        },
    });

    async function handleApply(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: params.id,
                coverLetter: form.get("coverLetter"),
                proposedRate: Number(form.get("proposedRate")) || undefined,
                proposedTimeline: Number(form.get("proposedTimeline")) || undefined,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setSubmitError(data.error ?? "Failed to submit application.");
            setSubmitting(false);
            return;
        }

        setApplied(true);
        router.refresh();
    }

    if (isLoading) {
        return <DashboardShell title="Loading..." description="Fetching project details."><p className="text-sm text-slate-500">Loading...</p></DashboardShell>;
    }

    if (!data) {
        return (
            <DashboardShell title="Project not found" description="This project may no longer be available.">
                <p className="text-sm text-slate-500">The project you are looking for does not exist or has been removed.</p>
            </DashboardShell>
        );
    }

    const categoryLabel = data.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());

    return (
        <DashboardShell
            title={data.title}
            description={`${categoryLabel} · Posted ${formatDate(data.createdAt)}`}
            actions={<Badge tone={data.status === "BIDDING" ? "cyan" : "slate"}>{data.status.replace(/_/g, " ")}</Badge>}
        >
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Project Overview</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{data.description}</p>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-4 text-lg font-semibold text-white">Scope of Work</h2>
                        <p className="text-sm leading-relaxed text-slate-400">{data.scope}</p>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h2 className="mb-3 text-lg font-semibold text-white">About the Client</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                <Briefcase className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {data.client?.clientProfile?.companyName ?? data.client?.name ?? "Enterprise Client"}
                                </p>
                                <p className="text-xs text-slate-500">{data.client?.name}</p>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="flex flex-col gap-6">
                    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Project Details</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Budget</span>
                                <span className="font-semibold text-white">{formatCurrency(data.budget)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Deadline</span>
                                <span className="text-white">{data.deadline ? formatDate(data.deadline) : "Flexible"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Applications</span>
                                <span className="text-white">{data.applications?.length ?? 0}</span>
                            </div>
                        </div>
                    </section>

                    {/* Apply form */}
                    {applied ? (
                        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                            <p className="text-sm font-medium text-emerald-300">Application submitted successfully.</p>
                        </section>
                    ) : (
                        <form onSubmit={handleApply} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Apply for this project</h3>
                            <div className="flex flex-col gap-4">
                                <Input
                                    name="coverLetter"
                                    label="Cover letter"
                                    placeholder="Why are you a great fit for this project?"
                                    as="textarea"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input name="proposedRate" label="Rate (USD/hr)" type="number" min={0} placeholder="e.g. 80" />
                                    <Input name="proposedTimeline" label="Weeks" type="number" min={1} placeholder="e.g. 6" />
                                </div>
                                {submitError && (
                                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{submitError}</p>
                                )}
                                <Button type="submit" disabled={submitting} leftIcon={<Send className="h-4 w-4" />}>
                                    {submitting ? "Submitting..." : "Apply Now"}
                                </Button>
                            </div>
                        </form>
                    )}
                </aside>
            </div>
        </DashboardShell>
    );
}

