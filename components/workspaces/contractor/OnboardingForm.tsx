"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractorOnboardingSchema, type ContractorOnboardingInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Save, ShieldCheck } from "lucide-react";
import type { WorkspaceContractor } from "@/types/workspace";

const availabilityOptions = ["FULL_TIME", "PART_TIME", "HOURLY", "NOT_AVAILABLE"];

const skillSuggestions = ["Next.js", "React", "TypeScript", "Node.js", "Python", "AI/ML", "Figma", "PostgreSQL", "AWS", "GraphQL", "UI/UX", "Data Science"];

type OnboardingFormProps = {
    profile: WorkspaceContractor | null;
    verificationStatus: string;
};

export function OnboardingForm({ profile, verificationStatus }: OnboardingFormProps) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [requestVerification, setRequestVerification] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ContractorOnboardingInput>({
        resolver: zodResolver(contractorOnboardingSchema),
        defaultValues: {
            headline: profile?.headline ?? "",
            bio: profile?.bio ?? "",
            skills: profile?.skills ?? [],
            experienceYears: profile?.experienceYears ?? 0,
            hourlyRate: profile?.hourlyRate ?? 0,
            availability: (profile?.availability as ContractorOnboardingInput["availability"]) ?? "FULL_TIME",
            portfolioLinks: profile?.portfolioLinks ?? [],
            githubUrl: profile?.githubUrl ?? "",
            linkedinUrl: profile?.linkedinUrl ?? "",
            resumeUrl: profile?.resumeUrl ?? "",
            languages: profile?.languages ?? ["English"],
            requestVerification: false,
        },
        mode: "onTouched",
    });

    const skills = watch("skills");

    function toggleSkill(skill: string) {
        const next = skills.includes(skill) ? skills.filter((s) => s !== skill) : [...skills, skill];
        setValue("skills", next, { shouldValidate: true });
    }

    async function submit(data: ContractorOnboardingInput) {
        setSaving(true);
        setSaved(false);
        setError(null);

        const res = await fetch("/api/contractors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, requestVerification }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error ?? "Failed to save profile.");
            setSaving(false);
            return;
        }

        setSaved(true);
        setSaving(false);
    }

    return (
        <form onSubmit={handleSubmit(submit)} className="max-w-2xl space-y-5">
            {/* Verification status banner */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-cyan-400" />
                        <div>
                            <p className="text-sm font-medium text-white">Profile verification</p>
                            <p className="text-xs text-slate-500">Required to be eligible for premium contracts.</p>
                        </div>
                    </div>
                    <Badge tone={verificationStatus === "VERIFIED" ? "emerald" : verificationStatus === "PENDING" ? "amber" : "slate"}>
                        {verificationStatus.replace(/_/g, " ")}
                    </Badge>
                </div>
                {(verificationStatus === "UNVERIFIED" || verificationStatus === "REJECTED") && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                        <p className="text-xs text-slate-400">Request admin review of your profile and skill assessment.</p>
                        <button
                            type="button"
                            onClick={() => setRequestVerification(!requestVerification)}
                            className={cn(
                                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                                requestVerification
                                    ? "bg-amber-500 text-slate-950"
                                    : "border border-slate-700 text-slate-300 hover:border-amber-500/50",
                            )}
                            aria-pressed={requestVerification}
                        >
                            {requestVerification ? "Requested" : "Request Verification"}
                        </button>
                    </div>
                )}
            </div>

            <Input
                label="Professional headline"
                placeholder="Senior Full-Stack Engineer — React, Node.js"
                error={errors.headline?.message}
                {...register("headline")}
            />
            <Input
                label="Bio"
                as="textarea"
                placeholder="Tell clients about your experience and specialties."
                error={errors.bio?.message}
                {...register("bio")}
            />

            {/* Skills */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Skills</label>
                <div className="flex flex-wrap gap-2">
                    {skillSuggestions.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                skills.includes(skill)
                                    ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700",
                            )}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
                {errors.skills ? <p className="mt-2 text-xs text-red-400">{errors.skills.message}</p> : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                <Input
                    label="Years of experience"
                    type="number"
                    min={0}
                    placeholder="6"
                    error={errors.experienceYears?.message}
                    {...register("experienceYears")}
                />
                <Input
                    label="Hourly rate (USD)"
                    type="number"
                    min={0}
                    placeholder="80"
                    error={errors.hourlyRate?.message}
                    {...register("hourlyRate")}
                />
                <Input label="Availability" as="select" error={errors.availability?.message} {...register("availability")}>
                    {availabilityOptions.map((option) => (
                        <option key={option} value={option}>
                            {option.replace(/_/g, " ")}
                        </option>
                    ))}
                </Input>
            </div>

            <Input
                label="Portfolio links (comma separated)"
                placeholder="https://github.com/you, https://your-site.com"
                error={errors.portfolioLinks?.message}
                {...register("portfolioLinks")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    label="GitHub profile"
                    type="url"
                    placeholder="https://github.com/you"
                    error={errors.githubUrl?.message}
                    {...register("githubUrl")}
                />
                <Input
                    label="LinkedIn profile"
                    type="url"
                    placeholder="https://linkedin.com/in/you"
                    error={errors.linkedinUrl?.message}
                    {...register("linkedinUrl")}
                />
            </div>
            <Input
                label="Skill assessment / resume URL"
                type="url"
                placeholder="https://your-site.com/resume.pdf"
                error={errors.resumeUrl?.message}
                {...register("resumeUrl")}
            />

            {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
            {saved && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                    Profile saved successfully.
                </p>
            )}

            <Button type="submit" disabled={saving} leftIcon={<Save className="h-4 w-4" />}>
                {saving ? "Saving..." : "Save & Update Profile"}
            </Button>
        </form>
    );
}

