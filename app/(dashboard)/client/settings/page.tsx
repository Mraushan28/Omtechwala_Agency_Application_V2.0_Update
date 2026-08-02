"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export default function ClientSettingsPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        setError(null);

        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyName: form.get("companyName"),
                companyWebsite: form.get("companyWebsite"),
                companySize: form.get("companySize"),
                industry: form.get("industry"),
                country: form.get("country"),
                billingEmail: form.get("billingEmail"),
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
            title="Account Settings"
            description="Manage your company profile and billing information."
        >
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                <Input name="companyName" label="Company name" defaultValue={session?.user?.name ?? ""} required />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Input name="companyWebsite" label="Company website" type="url" placeholder="https://company.com" />
                    <Input name="companySize" label="Company size" placeholder="11-50" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Input name="industry" label="Industry" placeholder="Fintech, Healthcare, SaaS..." />
                    <Input name="country" label="Country" placeholder="United States" />
                </div>
                <Input name="billingEmail" label="Billing email" type="email" placeholder="billing@company.com" />
                <Input name="taxId" label="Tax ID (optional)" placeholder="VAT / Tax identification" />

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

