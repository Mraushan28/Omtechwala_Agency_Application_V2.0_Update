"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Save, ShieldCheck } from "lucide-react";

const availabilityOptions = ["FULL_TIME", "PART_TIME", "HOURLY", "NOT_AVAILABLE"];

export default function ContractorSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestedVerification, setRequestedVerification] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);

        const form = new FormData(e.currentTarget);
        const skills = String(form.get("skills") ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const portfolioLinks = String(form.get("portfolioLinks") ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                headline: form.get("headline"),
                bio: form.get("bio"),
                skills,
                experienceYears: Number(form.get("experienceYears")) || 0,
                hourlyRate: Number(form.get("hourlyRate")) || undefined,
                portfolioLinks,
                githubUrl: form.get("githubUrl"),
                linkedinUrl: form.get("linkedinUrl"),
                availability: form.get("availability"),
                requestVerification: requestedVerification,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Failed to save profile.");
            setSaving(false);
            return;
        }

        setSaved(true);
        setSaving(false);
    }

    return (
        <DashboardShell
            title="Contractor Settings"
            description="Complete your profile to unlock premium project invitations."
        >
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                <Input name="headline" label="Professional headline" placeholder="Senior Full-Stack Engineer — React, Node.js" required />
                <Input name="bio" label="Bio" as="textarea" placeholder="Tell clients about your experience and specialties." />
                <Input name="skills" label="Skills (comma separated)" placeholder="React, TypeScript, Node.js, AWS" />
                <div className="grid gap-5 sm:grid-cols-3">
                    <Input name="experienceYears" label="Years of experience" type="number" min={0} placeholder="6" />
                    <Input name="hourlyRate" label="Hourly rate (USD)" type="number" min={0} placeholder="80" />
                    <Input name="availability" label="Availability" as="select">
                        {availabilityOptions.map((option) => (
                            <option key={option} value={option}>
                                {option.replace(/_/g, " ")}
                            </option>
                        ))}
                    </Input>
                </div>
                <Input name="portfolioLinks" label="Portfolio links (comma separated)" placeholder="https://github.com/you, https://your-site.com" />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Input name="githubUrl" label="GitHub profile" type="url" placeholder="https://github.com/you" />
                    <Input name="linkedinUrl" label="LinkedIn profile" type="url" placeholder="https://linkedin.com/in/you" />
                </div>

                {/* Verification request */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-cyan-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Request profile verification</p>
                                <p className="text-xs text-slate-500">Reviewed by our admin team within 2 business days.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setRequestedVerification(!requestedVerification)}
                            className="relative h-6 w-11 rounded-full bg-slate-800 transition-colors data-[on=true]:bg-cyan-500"
                            data-on={requestedVerification}
                            aria-pressed={requestedVerification}
                        >
                            <span
                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${requestedVerification ? "left-[22px]" : "left-0.5"}`}
                            />
                        </button>
                    </div>
                    {requestedVerification && (
                        <div className="mt-3">
                            <Badge tone="amber">Verification request pending</Badge>
                        </div>
                    )}
                </div>

                {error && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
                )}
                {saved && (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                        Profile saved successfully.
                    </p>
                )}

                <Button type="submit" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </DashboardShell>
    );
}

