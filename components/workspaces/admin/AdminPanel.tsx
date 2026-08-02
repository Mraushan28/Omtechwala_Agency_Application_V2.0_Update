"use client";

import { useState } from "react";
import { WorkspaceTabs } from "@/components/workspaces/WorkspaceTabs";
import { PlatformOverview } from "@/components/workspaces/admin/PlatformOverview";
import { ContractApproval } from "@/components/workspaces/admin/ContractApproval";
import { VerificationQueue } from "@/components/workspaces/admin/VerificationQueue";
import { LayoutDashboard, FileSignature, BadgeCheck } from "lucide-react";
import type { AdminWorkspaceProps } from "@/types/workspace";

type TabId = "overview" | "contracts" | "verifications";

export function AdminPanel(props: AdminWorkspaceProps) {
    const [active, setActive] = useState<TabId>("overview");

    const tabs = [
        { id: "overview" as const, label: "Platform Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: "contracts" as const, label: "Contract & Escrow", icon: <FileSignature className="h-4 w-4" /> },
        { id: "verifications" as const, label: "Verification Queue", icon: <BadgeCheck className="h-4 w-4" /> },
    ];

    return (
        <div>
            <WorkspaceTabs tabs={tabs} active={active} onChange={(id) => setActive(id as TabId)} />

            {active === "overview" && <PlatformOverview overview={props.overview} />}
            {active === "contracts" && <ContractApproval projects={props.pendingProjects} contractors={props.contractors} />}
            {active === "verifications" && <VerificationQueue queue={props.verificationQueue} />}
        </div>
    );
}

