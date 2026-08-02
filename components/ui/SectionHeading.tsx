import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: "center" | "left";
    className?: string;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = "center",
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4",
                align === "center" ? "items-center text-center" : "items-start text-left",
                className,
            )}
        >
            {eyebrow ? (
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    <span className="h-px w-6 bg-cyan-500/60" />
                    {eyebrow}
                    {align === "center" ? <span className="h-px w-6 bg-cyan-500/60" /> : null}
                </span>
            ) : null}
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {title}
            </h2>
            {description ? (
                <p className="max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">{description}</p>
            ) : null}
        </div>
    );
}

