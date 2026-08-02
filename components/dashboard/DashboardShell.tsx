import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type DashboardShellProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function DashboardShell({ title, description, actions, children }: DashboardShellProps) {
    return (
        <Container className="py-10">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
                    {description ? <p className="mt-1.5 text-sm text-slate-400">{description}</p> : null}
                </div>
                {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
            </div>
            {children}
        </Container>
    );
}

