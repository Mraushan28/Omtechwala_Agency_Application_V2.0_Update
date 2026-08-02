"use client";

import { cn } from "@/lib/utils";

export type TabDefinition = {
    id: string;
    label: string;
    icon?: React.ReactNode;
};

type WorkspaceTabsProps = {
    tabs: TabDefinition[];
    active: string;
    onChange: (id: string) => void;
};

export function WorkspaceTabs({ tabs, active, onChange }: WorkspaceTabsProps) {
    return (
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                        active === tab.id
                            ? "bg-cyan-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    )}
                    aria-pressed={active === tab.id}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

