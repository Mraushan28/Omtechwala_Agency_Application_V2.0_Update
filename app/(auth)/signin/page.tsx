"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Code2, Lock, Mail, ArrowRight } from "lucide-react";

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    const errorParam = searchParams.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        errorParam === "CredentialsSignin" ? "Invalid email or password." : null,
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await signIn("credentials", { email, password, redirect: false });

        if (res?.error) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
        }

        // Fetch the session to get the role, then route accordingly.
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role;

        router.push(role === "ADMIN" ? "/admin" : role === "CLIENT" ? "/client" : role === "CONTRACTOR" ? "/contractor" : (callbackUrl ?? "/"));
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
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
                            <p className="mt-1 text-sm text-slate-500">Sign in to your Om Techwala workspace</p>
                        </div>
                    </div>

                    <SocialAuthButtons className="mb-6" />

                    <div className="relative mb-6" aria-hidden="true">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                                or sign in with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            type="email"
                            name="email"
                            label="Email address"
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
                            placeholder="Enter your password"
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
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 flex items-center justify-between text-sm">
                        <Link href="/signup" className="text-cyan-500 hover:text-cyan-400 dark:text-cyan-400 dark:hover:text-cyan-300">
                            Create an account
                        </Link>
                        <span className="text-slate-500">Forgot password?</span>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Demo accounts: admin@omtechwala.com / client@omtechwala.com / contractor@omtechwala.com
                </p>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<Container className="flex justify-center py-24 text-slate-500">Loading...</Container>}>
            <SignInForm />
        </Suspense>
    );
}

