import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "cyan" | "slate" | "emerald" | "amber" | "red" | "violet";

type BadgeProps = {
    children: ReactNode;
    tone?: BadgeTone;
    className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    red: "bg-red-500/10 text-red-300 border-red-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                toneClasses[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

