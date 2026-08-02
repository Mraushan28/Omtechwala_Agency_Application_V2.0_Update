export type NavLink = {
    label: string;
    href: string;
};

export const marketingLinks: NavLink[] = [
    { label: "Services", href: "#services" },
    { label: "For Clients", href: "#for-clients" },
    { label: "For Talent", href: "#for-talent" },
    { label: "How It Works", href: "#how-it-works" },
];

export const clientWorkspaceLinks: NavLink[] = [
    { label: "Overview", href: "/client" },
    { label: "Workspace", href: "/client/dashboard" },
    { label: "My Projects", href: "/client/projects" },
    { label: "Applications", href: "/client/applications" },
    { label: "Contracts", href: "/client/contracts" },
];

export const contractorWorkspaceLinks: NavLink[] = [
    { label: "Overview", href: "/contractor" },
    { label: "Workspace", href: "/contractor/dashboard" },
    { label: "Find Work", href: "/contractor/find-work" },
    { label: "My Applications", href: "/contractor/applications" },
    { label: "Earnings", href: "/contractor/earnings" },
];

export const adminWorkspaceLinks: NavLink[] = [
    { label: "Overview", href: "/admin" },
    { label: "Control Panel", href: "/admin/dashboard" },
    { label: "Users", href: "/admin/users" },
    { label: "Verifications", href: "/admin/verifications" },
    { label: "Projects", href: "/admin/projects" },
];

export const footerColumns = [
    {
        title: "Services",
        links: [
            { label: "Web Development", href: "#services" },
            { label: "AI & ML Engineering", href: "#services" },
            { label: "AI Data Labeling & Training", href: "#services" },
            { label: "UI/UX & Graphic Design", href: "#services" },
        ],
    },
    {
        title: "Platform",
        links: [
            { label: "For Clients", href: "#for-clients" },
            { label: "For Talent", href: "#for-talent" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "Sign In", href: "/signin" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Trust & Security", href: "#" },
            { label: "Contact", href: "#" },
        ],
    },
] as const;

