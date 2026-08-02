"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { cn } from "@/lib/utils";
import { Code2, User, Mail, Lock, ArrowRight, Building2, HardHat } from "lucide-react";

type Role = "CLIENT" | "CONTRACTOR";

function SignUpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialRole = searchParams.get("role") === "client" ? "CLIENT" : "CONTRACTOR";

    const [role, setRole] = useState<Role>(initialRole);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Registration failed. Please try again.");
            setLoading(false);
            return;
        }

        await router.push("/signin?registered=1");
        router.refresh();
    }

    return (
        <div className="flex flex-1 items-center justify-center px-5 py-16">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 shadow-glow-cyan">
                            <Code2 className="h-6 w-6 text-slate-950" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
                            <p className="mt-1 text-sm text-slate-500">Join Om Techwala in under two minutes</p>
                        </div>
                    </div>

                    <SocialAuthButtons role={role} className="mb-6" />

                    <div className="relative mb-6" aria-hidden="true">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                                or sign up with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Role selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("CLIENT")}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-colors",
                                    role === "CLIENT"
                                        ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-500 dark:text-cyan-300"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700",
                                )}
                            >
                                <Building2 className="h-5 w-5" />
                                I am a Client
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("CONTRACTOR")}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-colors",
                                    role === "CONTRACTOR"
                                        ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-500 dark:text-cyan-300"
                                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700",
                                )}
                            >
                                <HardHat className="h-5 w-5" />
                                I am Talent
                            </button>
                        </div>

                        <Input
                            type="text"
                            name="name"
                            label="Full name"
                            placeholder={role === "CLIENT" ? "Company contact name" : "Your full name"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            leftIcon={<User className="h-4 w-4" />}
                            required
                        />
                        <Input
                            type="email"
                            name="email"
                            label="Work email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail className="h-4 w-4" />}
                            required
                        />
                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="Min 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<Lock className="h-4 w-4" />}
                            required
                        />

                        {error && (
                            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        <Button type="submit" fullWidth size="lg" disabled={loading} rightIcon={<ArrowRight className="h-5 w-5" />}>
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Already have an account?</span>{" "}
                        <Link href="/signin" className="text-cyan-500 hover:text-cyan-400 dark:text-cyan-400 dark:hover:text-cyan-300">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<Container className="flex justify-center py-24 text-slate-500">Loading...</Container>}>
            <SignUpForm />
        </Suspense>
    );
}

