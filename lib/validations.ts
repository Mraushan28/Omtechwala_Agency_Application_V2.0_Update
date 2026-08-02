import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CLIENT", "CONTRACTOR"]),
});

export const signInSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const projectCategorySchema = z.enum([
    "WEB_DEVELOPMENT",
    "AI_ML",
    "AI_TRAINING",
    "UI_UX_DESIGN",
    "GRAPHIC_DESIGN",
]);

// Existing simple project schema (used by the legacy /client/projects/new form)
export const projectSchema = z.object({
    title: z.string().min(4, "Title must be at least 4 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    scope: z.string().min(10, "Scope must be at least 10 characters"),
    category: projectCategorySchema,
    budget: z.coerce.number().positive("Budget must be greater than zero"),
    budgetMin: z.coerce.number().positive("Minimum budget must be greater than zero").optional(),
    budgetMax: z.coerce.number().positive("Maximum budget must be greater than zero").optional(),
    techStack: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).min(1, "At least one deliverable is required").optional(),
    timelineWeeks: z.coerce.number().int().positive("Timeline must be a positive number of weeks").optional(),
    deadline: z.string().optional(),
});

export const applicationSchema = z.object({
    coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
    proposedRate: z.coerce.number().positive().optional(),
    proposedTimeline: z.coerce.number().int().positive().optional(),
});

export const milestoneSchema = z.object({
    title: z.string().min(3, "Title is required"),
    description: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    dueDate: z.string().optional(),
});

export const availabilitySchema = z.enum(["FULL_TIME", "PART_TIME", "HOURLY", "NOT_AVAILABLE"]);

// ---------------------------------------------------------------------------
// Project Creation Wizard (multi-step contract submission)
// ---------------------------------------------------------------------------

export const projectBasicsSchema = z.object({
    title: z.string().min(4, "Title must be at least 4 characters"),
    description: z.string().min(20, "Description must be at least 20 characters"),
    category: projectCategorySchema,
});

export const projectScopeSchema = z.object({
    techStack: z.array(z.string()).min(1, "Select at least one technology"),
    scope: z.string().min(10, "Scope must be at least 10 characters"),
});

export const projectBudgetSchema = z.object({
    budgetMin: z.coerce.number().positive("Minimum budget must be greater than zero"),
    budgetMax: z.coerce.number().positive("Maximum budget must be greater than zero"),
    timelineWeeks: z.coerce.number().int().min(1, "Timeline must be at least 1 week"),
    deadline: z.string().optional(),
});

export const projectDeliverablesSchema = z.object({
    deliverables: z
        .array(z.object({ title: z.string().min(2, "Deliverable title is required") }))
        .min(1, "Add at least one deliverable"),
});

export const projectWizardSchema = z
    .object({
        title: z.string().min(4, "Title must be at least 4 characters"),
        description: z.string().min(20, "Description must be at least 20 characters"),
        category: projectCategorySchema,
        techStack: z.array(z.string()).min(1, "Select at least one technology"),
        scope: z.string().min(10, "Scope must be at least 10 characters"),
        budgetMin: z.coerce.number().positive("Minimum budget must be greater than zero"),
        budgetMax: z.coerce.number().positive("Maximum budget must be greater than zero"),
        timelineWeeks: z.coerce.number().int().min(1, "Timeline must be at least 1 week"),
        deadline: z.string().optional(),
        deliverables: z.array(z.string()).min(1, "Add at least one deliverable"),
    })
    .superRefine((data, ctx) => {
        if (data.budgetMax < data.budgetMin) {
            ctx.addIssue({
                code: "custom",
                message: "Maximum budget must be greater than or equal to the minimum budget",
                path: ["budgetMax"],
            });
        }
    });

export type ProjectWizardInput = z.infer<typeof projectWizardSchema>;

// ---------------------------------------------------------------------------
// Contractor onboarding & verification
// ---------------------------------------------------------------------------

export const contractorOnboardingSchema = z.object({
    headline: z.string().min(4, "Headline must be at least 4 characters"),
    bio: z.string().min(20, "Bio must be at least 20 characters"),
    skills: z.array(z.string()).min(1, "Add at least one skill"),
    experienceYears: z.coerce.number().int().min(0, "Experience cannot be negative"),
    hourlyRate: z.coerce.number().positive("Hourly rate must be greater than zero"),
    availability: availabilitySchema,
    portfolioLinks: z.array(z.string().url("Portfolio links must be valid URLs")).optional(),
    githubUrl: z.string().url("GitHub URL must be a valid URL").optional().or(z.literal("")),
    linkedinUrl: z.string().url("LinkedIn URL must be a valid URL").optional().or(z.literal("")),
    resumeUrl: z.string().url("Resume URL must be a valid URL").optional().or(z.literal("")),
    languages: z.array(z.string()).optional(),
    requestVerification: z.boolean().optional(),
});

export type ContractorOnboardingInput = z.infer<typeof contractorOnboardingSchema>;

// ---------------------------------------------------------------------------
// Admin: contract assignment with commission delta
// ---------------------------------------------------------------------------

export const contractAssignmentSchema = z.object({
    projectId: z.string().min(1, "Project is required"),
    contractorId: z.string().min(1, "Contractor is required"),
    clientRate: z.coerce.number().positive("Client rate must be greater than zero"),
    contractorRate: z.coerce.number().positive("Contractor payout rate must be greater than zero"),
    startDate: z.string().optional(),
}).refine((data) => data.contractorRate <= data.clientRate, {
    message: "Contractor payout rate cannot exceed the client rate",
    path: ["contractorRate"],
});

export type ContractAssignmentInput = z.infer<typeof contractAssignmentSchema>;

// ---------------------------------------------------------------------------
// Admin: verification decision
// ---------------------------------------------------------------------------

export const verificationSchema = z.object({
    decision: z.enum(["APPROVE", "REJECT"]),
    notes: z.string().optional(),
});

export type VerificationInput = z.infer<typeof verificationSchema>;

