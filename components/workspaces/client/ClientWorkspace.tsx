"use client";

import { useState } from "react";
import { WorkspaceTabs } from "@/components/workspaces/WorkspaceTabs";
import { ProjectWizard } from "@/components/workspaces/client/ProjectWizard";
import { ContractsTable } from "@/components/workspaces/client/ContractsTable";
import { TalentMatchmaker } from "@/components/workspaces/client/TalentMatchmaker";
import { FilePlus2, FileStack, UserCheck } from "lucide-react";
import type { ClientWorkspaceProps } from "@/types/workspace";

type TabId = "wizard" | "contracts" | "talent";

export function ClientWorkspace({ projects, contractors }: ClientWorkspaceProps) {
    const [active, setActive] = useState<TabId>("wizard");

    const tabs = [
        { id: "wizard" as const, label: "New Project", icon: <FilePlus2 className="h-4 w-4" /> },
        { id: "contracts" as const, label: "Contracts", icon: <FileStack className="h-4 w-4" /> },
        { id: "talent" as const, label: "Talent Matchmaker", icon: <UserCheck className="h-4 w-4" /> },
    ];

    return (
        <div>
            <WorkspaceTabs tabs={tabs} active={active} onChange={(id) => setActive(id as TabId)} />

            {active === "wizard" && <ProjectWizard />}
            {active === "contracts" && <ContractsTable projects={projects} />}
            {active === "talent" && <TalentMatchmaker projects={projects} contractors={contractors} />}
        </div>
    );
}

