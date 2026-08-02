"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome, Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SocialAuthButtonsProps = {
    /** Optional role requested for a first-time social sign-in. Defaults to CLIENT server-side. */
    role?: "CLIENT" | "CONTRACTOR";
    className?: string;
};

type ProviderConfig = {
    id: "google" | "github";
    label: string;
    icon: typeof Chrome;
};

const providers: ProviderConfig[] = [
    { id: "google", label: "Google", icon: Chrome },
    { id: "github", label: "GitHub", icon: Github },
];

/**
 * "Sign in with Google" / "Sign in with GitHub" buttons for the auth pages.
 * Calls the NextAuth client `signIn` with a callbackUrl derived from the
 * current URL so users return to where they were heading.
 */
export function SocialAuthButtons({ role, className }: SocialAuthButtonsProps) {
    const searchParams = useSearchParams();
    const [pendingProvider, setPendingProvider] = useState<"google" | "github" | null>(null);
    const [error, setError] = useState<string | null>(null);

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    async function handleSignIn(provider: "google" | "github") {
        setPendingProvider(provider);
        setError(null);
        try {
            await signIn(provider, {
                callbackUrl,
                redirect: true,
            });
            // The page redirects on success; a rejected Promise surfaces errors here.
        } catch {
            setError("We could not complete the sign-in. Please try again.");
            setPendingProvider(null);
        }
    }

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700/70" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">or continue with</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700/70" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {providers.map((provider) => {
                    const Icon = provider.icon;
                    const isLoading = pendingProvider === provider.id;
                    return (
                        <button
                            key={provider.id}
                            type="button"
                            onClick={() => handleSignIn(provider.id)}
                            disabled={pendingProvider !== null}
                            aria-label={`Sign in with ${provider.label}`}
                            className={cn(
                                "inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-slate-700 bg-slate-900/80 px-4 text-sm font-medium text-slate-200 transition-all duration-200",
                                "hover:border-cyan-500/60 hover:bg-slate-800/80 hover:text-white",
                                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                            ) : (
                                <>
                                    <Icon className="h-4 w-4 text-slate-300" />
                                    <span>Continue with {provider.label}</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

