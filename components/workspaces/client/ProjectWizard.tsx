"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectWizardSchema, type ProjectWizardInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Trash2, Plus } from "lucide-react";

const categories = [
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "AI_ML", label: "AI & ML Engineering" },
    { value: "AI_TRAINING", label: "AI Data Labeling & Training" },
    { value: "UI_UX_DESIGN", label: "UI/UX Design" },
    { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
];

const techStackOptions = ["Next.js", "Python", "AI/ML", "Figma", "React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "GraphQL"];

const steps = ["Basics", "Tech Stack", "Budget", "Deliverables", "Review"];

export function ProjectWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [deliverables, setDeliverables] = useState<string[]>([""]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        trigger,
        formState: { errors },
    } = useForm<ProjectWizardInput>({
        resolver: zodResolver(projectWizardSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "WEB_DEVELOPMENT",
            techStack: [],
            scope: "",
            budgetMin: 0,
            budgetMax: 0,
            timelineWeeks: 4,
            deadline: "",
            deliverables: [""],
        },
        mode: "onTouched",
    });

    const techStack = watch("techStack");

    function updateDeliverable(index: number, value: string) {
        const next = deliverables.map((d, i) => (i === index ? value : d));
        setDeliverables(next);
        setValue("deliverables", next, { shouldValidate: step === 3 });
    }

    function addDeliverable() {
        const next = [...deliverables, ""];
        setDeliverables(next);
        setValue("deliverables", next);
    }

    function removeDeliverable(index: number) {
        if (deliverables.length === 1) return;
        const next = deliverables.filter((_, i) => i !== index);
        setDeliverables(next);
        setValue("deliverables", next);
    }

    async function submit(data: ProjectWizardInput) {
        const payload = { ...data, deliverables: deliverables.filter((d) => d.trim().length > 0) };
        setSubmitting(true);
        setSubmitError(null);

        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setSubmitError(body.error ?? "Failed to create project.");
            setSubmitting(false);
            return;
        }

        router.push("/client/projects");
        router.refresh();
    }

    const nextStep = async () => {
        const fieldsByStep: (keyof ProjectWizardInput)[][] = [
            ["title", "description", "category"],
            ["techStack", "scope"],
            ["budgetMin", "budgetMax", "timelineWeeks", "deadline"],
            [],
        ];
        const fields = fieldsByStep[step] ?? [];
        const valid = fields.length ? await trigger(fields) : true;
        if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
    };

    const toggleTech = (tech: string) => {
        const current = getValues("techStack");
        const next = current.includes(tech) ? current.filter((t) => t !== tech) : [...current, tech];
        setValue("techStack", next, { shouldValidate: true });
    };

    const cleanDeliverables = deliverables.filter((d) => d.trim().length > 0);

    return (
        <form onSubmit={handleSubmit(submit)} className="max-w-3xl">
            {/* Stepper */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
                {steps.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div
                            className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                                i < step
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : i === step
                                        ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                                        : "border-slate-800 bg-slate-900 text-slate-600",
                            )}
                        >
                            {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={cn("text-xs", i === step ? "font-medium text-white" : "text-slate-500")}>
                            {label}
                        </span>
                        {i < steps.length - 1 ? <span className="mx-1 h-px w-6 bg-slate-800" /> : null}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                {step === 0 && (
                    <div className="space-y-5">
                        <Input
                            label="Project title"
                            placeholder="e.g. AI-powered fraud detection dashboard"
                            error={errors.title?.message}
                            {...register("title")}
                        />
                        <Input
                            label="Category"
                            as="select"
                            error={errors.category?.message}
                            {...register("category")}
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </Input>
                        <Input
                            label="Detailed description"
                            as="textarea"
                            placeholder="Describe the problem you are solving, key features, and success criteria."
                            error={errors.description?.message}
                            {...register("description")}
                        />
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">Tech stack</label>
                            <div className="flex flex-wrap gap-2">
                                {techStackOptions.map((tech) => (
                                    <button
                                        key={tech}
                                        type="button"
                                        onClick={() => toggleTech(tech)}
                                        className={cn(
                                            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                            techStack.includes(tech)
                                                ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-300"
                                                : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700",
                                        )}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                            {errors.techStack ? <p className="mt-2 text-xs text-red-400">{errors.techStack.message}</p> : null}
                        </div>
                        <Input
                            label="Project scope"
                            as="textarea"
                            placeholder="Full lifecycle delivery: architecture, implementation, deployment, and documentation."
                            error={errors.scope?.message}
                            {...register("scope")}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Minimum budget (USD)"
                                type="number"
                                min={0}
                                placeholder="e.g. 40000"
                                error={errors.budgetMin?.message}
                                {...register("budgetMin")}
                            />
                            <Input
                                label="Maximum budget (USD)"
                                type="number"
                                min={0}
                                placeholder="e.g. 50000"
                                error={errors.budgetMax?.message}
                                {...register("budgetMax")}
                            />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Input
                                label="Project timeline (weeks)"
                                type="number"
                                min={1}
                                placeholder="e.g. 12"
                                error={errors.timelineWeeks?.message}
                                {...register("timelineWeeks")}
                            />
                            <Input
                                label="Target deadline"
                                type="date"
                                error={errors.deadline?.message}
                                {...register("deadline")}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-300">Deliverables</label>
                        <div className="flex flex-col gap-3">
                            {deliverables.map((deliverable, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Input
                                        placeholder={`Deliverable ${index + 1} — e.g. System architecture & data pipeline`}
                                        value={deliverable}
                                        onChange={(e) => updateDeliverable(index, e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeDeliverable(index)}
                                        disabled={deliverables.length === 1}
                                        aria-label="Remove deliverable"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-400" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addDeliverable}
                            leftIcon={<Plus className="h-4 w-4" />}
                        >
                            Add deliverable
                        </Button>
                        {cleanDeliverables.length === 0 ? (
                            <p className="text-xs text-red-400">Add at least one deliverable</p>
                        ) : null}
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-5">
                        <ReviewRow label="Title" value={getValues("title")} />
                        <ReviewRow label="Category" value={categories.find((c) => c.value === getValues("category"))?.label ?? ""} />
                        <ReviewRow
                            label="Tech stack"
                            value={getValues("techStack")?.join(", ") ?? ""}
                        />
                        <ReviewRow
                            label="Budget range"
                            value={`${fmt(getValues("budgetMin"))} – ${fmt(getValues("budgetMax"))} · ${getValues("timelineWeeks")} weeks`}
                        />
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-300">Deliverables</p>
                            {cleanDeliverables.length === 0 ? (
                                <p className="text-xs text-red-400">No deliverables added.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {cleanDeliverables.map((d, i) => (
                                        <Badge key={i} tone="cyan">{d}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        {submitError && (
                            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{submitError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                    Back
                </Button>
                {step < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Continue
                    </Button>
                ) : (
                    <Button type="submit" disabled={submitting} leftIcon={<Send className="h-4 w-4" />}>
                        {submitting ? "Publishing..." : "Submit Contract"}
                    </Button>
                )}
            </div>
        </form>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="max-w-[70%] text-right text-sm font-medium text-white">{value}</span>
        </div>
    );
}

function fmt(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

