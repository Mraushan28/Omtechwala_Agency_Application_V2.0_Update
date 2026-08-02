"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

const categories = [
    { value: "WEB_DEVELOPMENT", label: "Web Development" },
    { value: "AI_ML", label: "AI & ML Engineering" },
    { value: "AI_TRAINING", label: "AI Data Labeling & Training" },
    { value: "UI_UX_DESIGN", label: "UI/UX Design" },
    { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
];

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const form = new FormData(e.currentTarget);
        const payload = {
            title: form.get("title"),
            description: form.get("description"),
            scope: form.get("scope"),
            category: form.get("category"),
            budget: Number(form.get("budget")),
            deadline: form.get("deadline") ? String(form.get("deadline")) : undefined,
        };

        const res = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Failed to create project.");
            setLoading(false);
            return;
        }

        router.push("/client/projects");
        router.refresh();
    }

    return (
        <DashboardShell
            title="Post a Project"
            description="Define your requirements and start receiving proposals from pre-vetted talent."
        >
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                <Input name="title" label="Project title" placeholder="e.g. AI-powered fraud detection dashboard" required />
                <Input name="category" label="Category" as="select">
                    {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </Input>
                <Input name="budget" label="Budget (USD)" type="number" min={0} placeholder="e.g. 45000" required />
                <Input name="deadline" label="Target deadline" type="date" />
                <Input name="scope" label="Project scope" placeholder="Full lifecycle delivery: architecture, implementation, deployment, and documentation." as="textarea" />
                <Input name="description" label="Detailed description" placeholder="Describe the problem you are solving, key features, and success criteria." as="textarea" />

                {error && (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
                )}

                <div className="flex gap-3">
                    <Button type="submit" disabled={loading} leftIcon={<Send className="h-4 w-4" />}>
                        {loading ? "Publishing..." : "Post Project"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </DashboardShell>
    );
}

