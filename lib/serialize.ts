// Helpers to convert Prisma result objects into plain JSON-safe serializable
// shapes for passing from Server Components to Client Components.
import type {
    ContractorProfile,
    Milestone,
    Project,
    User,
} from "@prisma/client";
import type {
    WorkspaceContractor,
    WorkspaceMilestone,
    WorkspaceProject,
} from "@/types/workspace";

function toNumber(value: number | null | undefined): number {
    return value ?? 0;
}

function toDate(value: Date | null | undefined): string | null {
    return value ? value.toISOString() : null;
}

export function serializeMilestone(milestone: Milestone): WorkspaceMilestone {
    return {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        amount: toNumber(milestone.amount),
        commissionRate: toNumber(milestone.commissionRate),
        contractorPayout: milestone.contractorPayout !== null ? toNumber(milestone.contractorPayout) : null,
        status: milestone.status,
        dueDate: toDate(milestone.dueDate),
        createdAt: milestone.createdAt.toISOString(),
        updatedAt: milestone.updatedAt.toISOString(),
        approvedAt: toDate(milestone.approvedAt),
        paidAt: toDate(milestone.paidAt),
    };
}

export function serializeContractor(
    profile: ContractorProfile & { user?: Pick<User, "id" | "name" | "email" | "image"> },
): WorkspaceContractor {
    return {
        id: profile.user?.id ?? profile.userId,
        name: profile.user?.name ?? null,
        email: profile.user?.email ?? "",
        image: profile.user?.image ?? null,
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        experienceYears: profile.experienceYears,
        hourlyRate: profile.hourlyRate !== null ? toNumber(profile.hourlyRate) : null,
        availability: profile.availability,
        portfolioLinks: profile.portfolioLinks,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        resumeUrl: profile.resumeUrl,
        languages: profile.languages,
        verificationStatus: profile.verificationStatus,
        rating: profile.rating !== null ? toNumber(profile.rating) : null,
        isTopRated: profile.isTopRated,
        completedProjects: profile.completedProjects,
        totalEarnings: toNumber(profile.totalEarnings),
    };
}

export type ProjectWithRelations = Project & {
    client?: { name: string | null; clientProfiles?: { companyName: string | null }[] } | null;
    contractor?: {
        name: string | null;
        contractorProfiles?: { headline: string | null; rating: number | null }[];
    } | null;
    milestones?: Milestone[];
    applications?: { id: string }[];
};

export function serializeProject(project: ProjectWithRelations): WorkspaceProject {
    const clientProfile = project.client?.clientProfiles?.[0];
    const contractorProfile = project.contractor?.contractorProfiles?.[0];

    return {
        id: project.id,
        clientId: project.clientId,
        contractorId: project.contractorId,
        title: project.title,
        description: project.description,
        scope: project.scope,
        category: project.category,
        budget: toNumber(project.budget),
        budgetMin: project.budgetMin !== null ? toNumber(project.budgetMin) : null,
        budgetMax: project.budgetMax !== null ? toNumber(project.budgetMax) : null,
        techStack: project.techStack ?? [],
        deliverables: project.deliverables ?? [],
        timelineWeeks: project.timelineWeeks,
        commissionRate: toNumber(project.commissionRate),
        clientRate: project.clientRate !== null ? toNumber(project.clientRate) : null,
        contractorRate: project.contractorRate !== null ? toNumber(project.contractorRate) : null,
        currency: project.currency,
        status: project.status,
        startDate: toDate(project.startDate),
        deadline: toDate(project.deadline),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        client: project.client
            ? {
                name: project.client.name,
                companyName: clientProfile?.companyName ?? null,
            }
            : null,
        contractor: project.contractor
            ? {
                name: project.contractor.name,
                headline: contractorProfile?.headline ?? null,
                rating: contractorProfile?.rating !== null && contractorProfile?.rating !== undefined
                    ? toNumber(contractorProfile.rating)
                    : null,
            }
            : null,
        milestones: (project.milestones ?? []).map(serializeMilestone),
        applicationsCount: project.applications?.length ?? 0,
    };
}

