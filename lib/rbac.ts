export const Role = {
    ADMIN: "ADMIN",
    CLIENT: "CLIENT",
    CONTRACTOR: "CONTRACTOR",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * Route-access map for the App Router.
 * Keys are route prefixes; values are the roles permitted to access them.
 * An empty array ([]) means the route requires an authenticated session of any role.
 */
export const routeAccess: Record<string, Role[]> = {
    "/admin": [Role.ADMIN],
    "/client": [Role.CLIENT, Role.ADMIN],
    "/contractor": [Role.CONTRACTOR, Role.ADMIN],
    "/dashboard": [],
};

/** Returns the most specific role rule for a given pathname. */
export function getRouteRule(pathname: string): Role[] | undefined {
    const sortedKeys = Object.keys(routeAccess).sort((a, b) => b.length - a.length);
    const matched = sortedKeys.find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    return matched ? routeAccess[matched] : undefined;
}

export function hasAccess(role: Role, allowed: Role[]): boolean {
    return allowed.length === 0 || allowed.includes(role);
}

