import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Wallet } from "lucide-react";

type MilestoneRowProps = {
    title: string;
    amount: string;
    status: string;
    dueDate?: string | null;
    description?: string | null;
};

const statusTone = {
    PENDING: "slate",
    IN_REVIEW: "amber",
    APPROVED: "cyan",
    PAID: "emerald",
    DISPUTED: "red",
    RELEASED: "emerald",
} as const;

function StatusIcon({ status }: { status: string }) {
    if (status === "PAID" || status === "RELEASED") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === "PENDING") return <Clock className="h-4 w-4 text-slate-500" />;
    return <Wallet className="h-4 w-4 text-amber-400" />;
}

export function MilestoneRow({ title, amount, status, dueDate, description }: MilestoneRowProps) {
    const tone = statusTone[status as keyof typeof statusTone] ?? "slate";
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
                <StatusIcon status={status} />
                <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    {description ? <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{description}</p> : null}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {dueDate ? <span className="hidden text-xs text-slate-500 sm:block">{formatDate(dueDate)}</span> : null}
                <span className="text-sm font-semibold text-white">{formatCurrency(amount)}</span>
                <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>
            </div>
        </div>
    );
}

