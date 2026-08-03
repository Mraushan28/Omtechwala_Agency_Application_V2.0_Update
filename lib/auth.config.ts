import { type NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

import { getRouteRule, hasAccess, type Role } from "@/lib/rbac";

/**
 * Edge-safe NextAuth configuration.
 *
 * This module is imported by `middleware.ts` and therefore runs on the Edge
 * Runtime. It MUST NOT import Prisma, bcrypt, or any Node.js-only database
 * client. Authorization is performed purely from JWT session claims
 * (`role` / `id`) that are embedded in the session cookie at sign-in.
 *
 * The full, Node.js-backed configuration lives in `lib/auth.ts`, which spreads
 * this config and adds the Credentials / OAuth providers plus the database
 * lookups that can only run in a Node.js environment.
 */
export const authConfig = {
    // Filled in `lib/auth.ts` (Node.js only). Keeping this empty keeps the
    // Edge bundle lightweight and free of any database provider.
    providers: [],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    callbacks: {
        /**
         * Route-level Role-Based Access Control.
         *
         * Runs in Edge Middleware for `/client`, `/contractor` and `/admin`.
         * - Unauthenticated users are redirected to the sign-in page.
         * - Authenticated users whose role is not permitted for the requested
         *   workspace are redirected to their own workspace.
         * - Everything else passes through.
         */
        async authorized({ request, auth }) {
            const { pathname } = request.nextUrl;
            const role = auth?.user?.role as Role | undefined;
            const rule = getRouteRule(pathname);

            // No explicit rule configured — any authenticated session may proceed.
            if (!rule) {
                return !!auth?.user;
            }

            if (!role || !hasAccess(role, rule)) {
                if (!auth?.user) {
                    // Not signed in → sign-in page (callbackUrl is preserved).
                    return false;
                }
                // Signed in but not permitted in this workspace → own dashboard.
                const fallback =
                    role === "ADMIN" ? "/admin" : role === "CLIENT" ? "/client" : "/contractor";
                const url = request.nextUrl.clone();
                url.pathname = fallback;
                url.search = "";
                return NextResponse.redirect(url);
            }

            return true;
        },
        /**
         * Pure mapping of JWT claims into the session object. This is what makes
         * `role` and `id` available to the Edge middleware `authorized` callback
         * without any database access.
         */
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id ?? session.user.id ?? "";
                session.user.role = token.role ?? "CLIENT";
            }
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
} satisfies NextAuthConfig;

