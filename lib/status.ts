// Shared status/role type unions for the MongoDB data layer.
// Prisma's MongoDB connector does not support enums, so these string literal
// unions replace the former Prisma enums across the application.

export type Role = "ADMIN" | "CLIENT" | "CONTRACTOR";

export type ProjectCategory =
    | "WEB_DEVELOPMENT"
    | "AI_ML"
    | "AI_TRAINING"
    | "UI_UX_DESIGN"
    | "GRAPHIC_DESIGN";

export type ProjectStatus =
    | "DRAFT"
    | "BIDDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

export type ApplicationStatus =
    | "PENDING"
    | "SHORTLISTED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";

export type MilestoneStatus =
    | "PENDING"
    | "IN_REVIEW"
    | "APPROVED"
    | "PAID"
    | "DISPUTED"
    | "RELEASED";

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export type VerificationStatus =
    | "UNVERIFIED"
    | "PENDING"
    | "VERIFIED"
    | "REJECTED";

export type NDAStatus = "NOT_SIGNED" | "PENDING" | "SIGNED";

export type ContractorAvailability =
    | "FULL_TIME"
    | "PART_TIME"
    | "HOURLY"
    | "NOT_AVAILABLE";

