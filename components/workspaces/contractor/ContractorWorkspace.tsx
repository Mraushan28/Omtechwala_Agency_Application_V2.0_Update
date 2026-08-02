"use client";

import { useState } from "react";
import { WorkspaceTabs } from "@/components/workspaces/WorkspaceTabs";
import { OnboardingForm } from "@/components/workspaces/contractor/OnboardingForm";
import { ContractsBoard } from "@/components/workspaces/contractor/ContractsBoard";
import { JobsTracker } from "@/components/workspaces/contractor/JobsTracker";
import { UserCog, BriefcaseBusiness, ClipboardCheck } from "lucide-react";
import type { ContractorWorkspaceProps } from "@/types/workspace";

type TabId = "onboarding" | "board" | "jobs";

export function ContractorWorkspace({ profile, profileVerificationStatus, openProjects, activeJobs, earnings }: ContractorWorkspaceProps) {
    const [active, setActive] = useState<TabId>("onboarding");

    const tabs = [
        { id: "onboarding" as const, label: "Onboarding & Verification", icon: <UserCog className="h-4 w-4" /> },
        { id: "board" as const, label: "Available Contracts", icon: <BriefcaseBusiness className="h-4 w-4" /> },
        { id: "jobs" as const, label: "My Jobs & Milestones", icon: <ClipboardCheck className="h-4 w-4" /> },
    ];

    return (
        <div>
            <WorkspaceTabs tabs={tabs} active={active} onChange={(id) => setActive(id as TabId)} />

            {active === "onboarding" && <OnboardingForm profile={profile} verificationStatus={profileVerificationStatus} />}
            {active === "board" && <ContractsBoard projects={openProjects} />}
            {active === "jobs" && <JobsTracker jobs={activeJobs} earnings={earnings} />}
        </div>
    );
}

