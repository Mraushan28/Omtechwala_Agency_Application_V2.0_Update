"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle button. Shows the Sun icon in dark mode (click to switch to
 * light) and the Moon icon in light mode (click to switch to dark).
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch: next-themes resolves the theme on the client.
    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors duration-200 hover:border-cyan-500/60 hover:text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        >
            {mounted ? (
                isDark ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                )
            ) : (
                <span className="h-4 w-4" aria-hidden="true" />
            )}
        </button>
    );
}

