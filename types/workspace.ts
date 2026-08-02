// Serialized (JSON-safe) types shared between Server Components and Client Workspaces.

export type WorkspaceContractor = {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    headline: string | null;
    bio: string | null;
    skills: string[];
    experienceYears: number;
    hourlyRate: number | null;
    availability: string;
    portfolioLinks: string[];
    githubUrl: string | null;
    linkedinUrl: string | null;
    resumeUrl: string | null;
    languages: string[];
    verificationStatus: string;
    rating: number | null;
    isTopRated: boolean;
    completedProjects: number;
    totalEarnings: number;
};

export type WorkspaceMilestone = {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    commissionRate: number;
    contractorPayout: number | null;
    status: string;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    approvedAt: string | null;
    paidAt: string | null;
};

export type WorkspaceProject = {
    id: string;
    clientId: string;
    contractorId: string | null;
    title: string;
    description: string;
    scope: string;
    category: string;
    budget: number;
    budgetMin: number | null;
    budgetMax: number | null;
    techStack: string[];
    deliverables: string[];
    timelineWeeks: number | null;
    commissionRate: number;
    clientRate: number | null;
    contractorRate: number | null;
    currency: string;
    status: string;
    startDate: string | null;
    deadline: string | null;
    createdAt: string;
    updatedAt: string;
    client?: {
        name: string | null;
        companyName: string | null;
    } | null;
    contractor?: {
        name: string | null;
        headline: string | null;
        rating: number | null;
    } | null;
    milestones: WorkspaceMilestone[];
    applicationsCount?: number;
};

export type WorkspaceApplication = {
    id: string;
    projectId: string;
    contractorId: string;
    coverLetter: string | null;
    proposedRate: number | null;
    proposedTimeline: number | null;
    status: string;
    submittedAt: string;
    contractor: WorkspaceContractor;
    project: Pick<WorkspaceProject, "id" | "title" | "category" | "budget" | "status">;
};

// Client Workspace props
export type ClientWorkspaceProps = {
    projects: WorkspaceProject[];
    contractors: WorkspaceContractor[];
};

// Contractor Workspace props
export type ContractorWorkspaceProps = {
    profile: WorkspaceContractor | null;
    profileVerificationStatus: string;
    openProjects: WorkspaceProject[];
    activeJobs: WorkspaceProject[];
    earnings: {
        lifetime: number;
        pending: number;
        paidMilestones: number;
    };
};

// Admin Workspace props
export type AdminWorkspaceProps = {
    overview: {
        tcv: number;
        grossMargin: number;
        activeProjects: number;
        vettedTalent: number;
        pendingRequests: number;
        verificationQueue: number;
    };
    pendingProjects: WorkspaceProject[];
    verificationQueue: WorkspaceContractor[];
    contractors: WorkspaceContractor[];
};

