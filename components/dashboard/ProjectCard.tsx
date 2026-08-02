import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, CircleDollarSign } from "lucide-react";

type ProjectCardProps = {
    id: string;
    title: string;
    category: string;
    budget: string;
    status: string;
    deadline?: string | null;
    applicationsCount?: number;
    href: string;
};

function categoryLabel(category: string): string {
    return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProjectCard({
    id,
    title,
    category,
    budget,
    status,
    deadline,
    applicationsCount,
    href,
}: ProjectCardProps) {
    return (
        <Link
            href={href}
            key={id}
            className="group flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/80"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold text-white transition-colors group-hover:text-cyan-300">
                        {title}
                    </h3>
                    <p className="text-xs text-slate-500">{categoryLabel(category)}</p>
                </div>
                <Badge tone={status === "IN_PROGRESS" ? "emerald" : status === "BIDDING" ? "cyan" : status === "COMPLETED" ? "violet" : status === "DRAFT" ? "slate" : "red"}>
                    {status.replace(/_/g, " ")}
                </Badge>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400">
                    <CircleDollarSign className="h-4 w-4 text-cyan-500" />
                    {formatCurrency(budget)}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {deadline ? formatDate(deadline) : "No deadline"}
                </span>
                {typeof applicationsCount === "number" && (
                    <span className="text-xs text-slate-500">{applicationsCount} apps</span>
                )}
            </div>
        </Link>
    );
}

