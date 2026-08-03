import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Edge middleware for Om Techwala.
 *
 * Uses the lightweight, Edge-safe NextAuth config (`lib/auth.config.ts`) so
 * NO Prisma / bcrypt / database code is ever bundled into the Edge runtime.
 * All authorization logic lives in the `authorized` callback of `authConfig`
 * and relies purely on JWT session claims (`role` / `id`).
 */
export default NextAuth(authConfig).auth;

export const config = {
    // Intercept the protected workspace dashboards only.
    matcher: ["/client/:path*", "/contractor/:path*", "/admin/:path*"],
};

