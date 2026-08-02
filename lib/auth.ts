import NextAuth, { type NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { z } from "zod";

import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

// Social sign-ins default to the CLIENT role. A CONTRACTOR role can be
// requested by passing { role: "CONTRACTOR" } to the client-side signIn call —
// the value is carried through the token and persisted on first sync.
const DEFAULT_OAUTH_ROLE = "CLIENT";

type ResolveCtx = {
    token: JWT;
    user?: { id?: string; role?: string };
};

/**
 * Resolves the database-backed user for the JWT session.
 *
 * - Credentials sign-ins: `token.sub` (set to `user.id` by Auth.js) maps
 *   directly to the existing database user.
 * - OAuth sign-ins (Google/GitHub): users are matched by email so existing
 *   accounts are synced, and first-time social logins automatically create a
 *   User record (default role: CLIENT, unless a role was passed to signIn).
 */
async function resolveUserForJwt(ctx: ResolveCtx): Promise<{ id: string; role: string } | null> {
    const { token, user } = ctx;
    const tokenId = token.sub;
    const tokenEmail = token.email?.toLowerCase();

    // 1) Look up by existing database user id (Credentials or re-issued JWT).
    let dbUser: User | null = null;
    if (tokenId) {
        dbUser = await prisma.user.findFirst({ where: { id: tokenId } });
    }
    if (!dbUser && user?.id) {
        dbUser = await prisma.user.findFirst({ where: { id: user.id } });
    }

    // 2) Match by email so OAuth sign-ins sync to the existing account.
    if (!dbUser && tokenEmail) {
        dbUser = await prisma.user.findFirst({ where: { email: tokenEmail } });
    }

    if (dbUser) {
        return { id: dbUser.id, role: dbUser.role };
    }

    if (!tokenEmail) return null;

    // 3) First-time social sign-in: create + persist the user.
    const requestedRole = token.role ?? user?.role ?? DEFAULT_OAUTH_ROLE;
    const validRole = requestedRole === "CONTRACTOR" ? "CONTRACTOR" : "CLIENT";

    const created = await prisma.user.create({
        data: {
            email: tokenEmail,
            name: token.name ?? null,
            image: token.picture ?? null,
            emailVerified: new Date(),
            role: validRole,
            ...(validRole === "CLIENT"
                ? { clientProfiles: { create: { companyName: token.name ?? tokenEmail } } }
                : {
                    contractorProfiles: {
                        create: {
                            headline: "New to Om Techwala",
                            languages: ["English"],
                        },
                    },
                }),
        },
    });

    return { id: created.id, role: validRole };
}

export const authOptions: NextAuthConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;
                // MongoDB has no unique constraint on email; findFirst enforces
                // the lookup at the application layer.
                const user = await prisma.user.findFirst({ where: { email } });
                if (!user?.passwordHash) return null;

                const isValid = await compare(password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
        // OAuth providers are registered only when the environment variables
        // are present so the app keeps working without third-party credentials.
        ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
            ? [
                Google({
                    clientId: process.env.AUTH_GOOGLE_ID,
                    clientSecret: process.env.AUTH_GOOGLE_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
            ]
            : []),
        ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
            ? [
                GitHub({
                    clientId: process.env.AUTH_GITHUB_ID,
                    clientSecret: process.env.AUTH_GITHUB_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
            ]
            : []),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Run only on the initial sign-in (when `user` is present) so that
            // DB lookups are not repeated on every request.
            if (user) {
                const resolved = await resolveUserForJwt({ token, user });
                if (resolved) {
                    token.id = resolved.id;
                    token.role = resolved.role;
                }
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) ?? session.user.id;
                session.user.role = (token.role as string) ?? DEFAULT_OAUTH_ROLE;
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

