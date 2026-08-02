import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema, projectWizardSchema } from "@/lib/validations";
import type { ProjectCategory, ProjectStatus } from "@/lib/status";

// GET /api/projects
// - Clients & Admins: all projects (optionally filtered by ?mine=1)
// - Contractors: open (BIDDING) projects available to apply to
// Filters: ?status=, ?category=, ?techStack=, ?minBudget=, ?maxBudget=, ?mine=1, ?assigned=1
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const assigned = searchParams.get("assigned") === "1";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const techStack = searchParams.get("techStack");
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");

    const where: Record<string, unknown> = {};
    if (status) where.status = status as ProjectStatus;
    if (category) where.category = category as ProjectCategory;
    if (techStack) where.techStack = { has: techStack };

    const budgetFilter: { gte?: number; lte?: number } = {};
    if (minBudget) budgetFilter.gte = Number(minBudget);
    if (maxBudget) budgetFilter.lte = Number(maxBudget);
    if (Object.keys(budgetFilter).length > 0) where.budget = budgetFilter;

    if (mine) where.clientId = session.user.id;
    if (assigned && session.user.role === "CONTRACTOR") where.contractorId = session.user.id;

    const role = session.user.role;
    if (role === "CONTRACTOR" && !mine && !assigned) {
        where.status = "BIDDING";
    }

    const projects = await prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            client: { select: { name: true, clientProfiles: { select: { companyName: true }, take: 1 } } },
            contractor: { select: { name: true } },
            applications: { select: { id: true } },
            milestones: { select: { id: true, status: true, amount: true } },
        },
    });

    return NextResponse.json({ projects });
}

// POST /api/projects
// Create a new project (CLIENT or ADMIN only)
// Accepts both the legacy projectSchema and the multi-step projectWizardSchema payload.
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();

        // Try the full wizard schema first; fall back to the legacy schema.
        const wizardParsed = projectWizardSchema.safeParse(body);
        if (wizardParsed.success) {
            const data = wizardParsed.data;
            const project = await prisma.project.create({
                data: {
                    clientId: session.user.id,
                    title: data.title,
                    description: data.description,
                    scope: data.scope,
                    category: data.category,
                    budget: data.budgetMax,
                    budgetMin: data.budgetMin,
                    budgetMax: data.budgetMax,
                    techStack: data.techStack,
                    deliverables: data.deliverables,
                    timelineWeeks: data.timelineWeeks,
                    status: "DRAFT",
                    deadline: data.deadline ? new Date(data.deadline) : null,
                },
            });
            return NextResponse.json({ project }, { status: 201 });
        }

        const parsed = projectSchema.safeParse(body);
        if (!parsed.success) {
            const message = wizardParsed.error.issues[0]?.message ?? parsed.error.issues[0]?.message ?? "Invalid input";
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const { title, description, scope, category, budget, budgetMin, budgetMax, techStack, deliverables, timelineWeeks, deadline } = parsed.data;

        const project = await prisma.project.create({
            data: {
                clientId: session.user.id,
                title,
                description,
                scope,
                category: category as ProjectCategory,
                budget,
                budgetMin: budgetMin ?? null,
                budgetMax: budgetMax ?? null,
                techStack: techStack ?? [],
                deliverables: deliverables ?? [],
                timelineWeeks: timelineWeeks ?? null,
                status: "DRAFT",
                deadline: deadline ? new Date(deadline) : null,
            },
        });

        return NextResponse.json({ project }, { status: 201 });
    } catch (error) {
        console.error("Project creation failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

