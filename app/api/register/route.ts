import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import type { Role } from "@/lib/status";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = signUpSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 },
            );
        }

        const { name, email, password, role } = parsed.data;

        // MongoDB has no unique constraint on email — enforce uniqueness in app code.
        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        const passwordHash = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role as Role,
                ...(role === "CLIENT"
                    ? {
                        clientProfile: {
                            create: {
                                companyName: name,
                                billingEmail: email,
                            },
                        },
                    }
                    : {
                        contractorProfile: {
                            create: {
                                headline: "New to Om Techwala",
                                languages: ["English"],
                            },
                        },
                    }),
            },
        });

        return NextResponse.json(
            { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
            { status: 201 },
        );
    } catch (error) {
        console.error("Registration failed:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

