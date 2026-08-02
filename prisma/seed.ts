import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Om Techwala database (MongoDB)...");

    const passwordHash = await bcrypt.hash("Password123!", 10);

    // Clean existing data (dev convenience)
    await prisma.milestone.deleteMany();
    await prisma.application.deleteMany();
    await prisma.project.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.contractorProfile.deleteMany();
    await prisma.user.deleteMany();

    // --- Admin ---
    const admin = await prisma.user.create({
        data: {
            email: "admin@omtechwala.com",
            name: "Om Techwala Admin",
            passwordHash,
            role: "ADMIN",
        },
    });

    // --- Client ---
    const client = await prisma.user.create({
        data: {
            email: "client@omtechwala.com",
            name: "Nova Enterprises",
            passwordHash,
            role: "CLIENT",
        },
    });

    await prisma.clientProfile.create({
        data: {
            userId: client.id,
            companyName: "Nova Enterprises",
            companyWebsite: "https://nova.example.com",
            companySize: "201-500",
            industry: "Fintech",
            country: "United States",
            billingEmail: "billing@nova.example.com",
            ndaStatus: "SIGNED",
            isVerified: true,
        },
    });

    // --- Contractor ---
    const contractor = await prisma.user.create({
        data: {
            email: "contractor@omtechwala.com",
            name: "Aarav Sharma",
            passwordHash,
            role: "CONTRACTOR",
        },
    });

    await prisma.contractorProfile.create({
        data: {
            userId: contractor.id,
            headline: "Senior Full-Stack Engineer — React, Node.js, PostgreSQL",
            bio: "8+ years building scalable web platforms for enterprise clients.",
            skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "GraphQL"],
            experienceYears: 8,
            hourlyRate: 85,
            portfolioLinks: ["https://github.com/aarav-dev", "https://aarav.example.com"],
            languages: ["English", "Hindi"],
            verificationStatus: "VERIFIED",
            isTopRated: true,
            rating: 4.9,
        },
    });

    // --- Sample Project (BIDDING) ---
    const project = await prisma.project.create({
        data: {
            clientId: client.id,
            title: "AI-Powered Fraud Detection Dashboard",
            description:
                "Build a real-time fraud detection dashboard with anomaly alerts, transaction streaming, and an admin console.",
            scope: "Full lifecycle delivery: architecture, implementation, deployment, and documentation.",
            category: "AI_ML",
            budget: 45000,
            budgetMin: 40000,
            budgetMax: 50000,
            techStack: ["Python", "AI/ML", "Next.js", "PostgreSQL"],
            deliverables: [
                "Data ingestion pipeline",
                "Anomaly detection models",
                "Real-time dashboard UI",
            ],
            timelineWeeks: 12,
            commissionRate: 0.12,
            status: "BIDDING",
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        },
    });

    const application = await prisma.application.create({
        data: {
            projectId: project.id,
            contractorId: contractor.id,
            coverLetter:
                "I have shipped three production ML platforms and specialize in real-time anomaly detection pipelines.",
            proposedRate: 82,
            proposedTimeline: 10,
            status: "SHORTLISTED",
        },
    });

    if (application) {
        // MongoDB has no createMany — insert milestones in a loop.
        const milestoneData = [
            {
                title: "Architecture & Data Pipeline",
                description: "System design, data ingestion, and feature store setup.",
                amount: 18000,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            },
            {
                title: "ML Models & Real-Time Alerts",
                description: "Anomaly detection models, alerting, and dashboard UI.",
                amount: 18000,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
            },
            {
                title: "Deployment & Handover",
                description: "Production deployment, monitoring, and knowledge transfer.",
                amount: 9000,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            },
        ];

        for (const m of milestoneData) {
            await prisma.milestone.create({
                data: {
                    projectId: project.id,
                    contractorId: contractor.id,
                    title: m.title,
                    description: m.description,
                    amount: m.amount,
                    commissionRate: 0.12,
                    status: "PENDING",
                    dueDate: m.dueDate,
                },
            });
        }
    }

    console.log("Seed complete.");
    console.log({
        admin: admin.email,
        client: client.email,
        contractor: contractor.email,
        project: project.id,
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

