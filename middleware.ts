import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getRouteRule, hasAccess, type Role } from "@/lib/rbac";

/**
 * Edge middleware that enforces Role-Based Access Control.
 * - Public routes: landing page, auth pages, static assets, API auth.
 * - Protected routes: requires a valid session.
 * - Role-scoped routes (/client, /contractor, /admin): requires matching role.
 */
const PUBLIC_PATHS = ["/", "/signin", "/signup", "/api/auth", "/api/register", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/#"];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectWithError(request: NextRequest, error: "unauthorized" | "forbidden") {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    url.searchParams.set("error", error);
    return NextResponse.redirect(url);
}

export default auth((request) => {
    const { pathname } = request.nextUrl;
    const session = request.auth;

    // Allow public routes through.
    if (isPublic(pathname)) {
        return NextResponse.next();
    }

    // Protect everything else (App Router pages + API routes under /api).
    if (!session?.user) {
        return redirectWithError(request, "unauthorized");
    }

    const userRole = session.user.role as Role | undefined;
    const rule = getRouteRule(pathname);

    // No explicit rule: any authenticated role may access.
    if (!rule) {
        return NextResponse.next();
    }

    if (!userRole || !hasAccess(userRole, rule)) {
        // Role mismatch — signed in, but not permitted for this workspace.
        const url = request.nextUrl.clone();
        const fallback = userRole === "ADMIN" ? "/admin" : userRole === "CLIENT" ? "/client" : "/contractor";
        url.pathname = fallback;
        url.search = "";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
});

export const config = {
    // Run middleware on all routes except Next.js internals and static assets.
    matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)"],
};

