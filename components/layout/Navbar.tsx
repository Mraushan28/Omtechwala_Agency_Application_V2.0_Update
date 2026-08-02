"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Menu,
    X,
    ChevronDown,
    UserCircle2,
    Briefcase,
    LogOut,
    LayoutDashboard,
    Shield,
    Building2,
    HardHat,
    Code2,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { marketingLinks, clientWorkspaceLinks, contractorWorkspaceLinks, adminWorkspaceLinks } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

export function Navbar() {
    const { data: session, status } = useSession();
    const { mobileMenu, toggleMobileMenu, closeMobileMenu } = useUIStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isAuthed = status === "authenticated";
    const role = session?.user?.role;
    const isAdmin = role === "ADMIN";
    const isClient = role === "CLIENT";
    const isContractor = role === "CONTRACTOR";

    const workspaceLinks = isAdmin
        ? adminWorkspaceLinks
        : isClient
            ? clientWorkspaceLinks
            : isContractor
                ? contractorWorkspaceLinks
                : [];

    const roleIcon = isAdmin ? Shield : isClient ? Building2 : isContractor ? HardHat : Code2;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                {/* Brand */}
                <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 shadow-glow-cyan">
                        <Code2 className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" size={18} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        Om<span className="text-cyan-400">Techwala</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {/* Marketing links for unauthenticated users */}
                    {!isAuthed &&
                        marketingLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}

                    {/* Workspace links for authenticated users */}
                    {isAuthed &&
                        workspaceLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            >
                                {link.label}
                            </Link>
                        ))}
                </nav>

                {/* Right side */}
                <div className="hidden items-center gap-3 md:flex">
                    <ThemeToggle />
                    {isAuthed ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
                            >
                                <Avatar name={session.user?.name} size="sm" />
                                <div className="hidden text-left lg:block">
                                    <p className="text-sm font-medium leading-tight text-slate-900 dark:text-white">
                                        {session.user?.name ?? "User"}
                                    </p>
                                    <p className="text-xs text-slate-500 capitalize">{role?.toLowerCase()}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                                        <div className="mb-2 border-b border-slate-200 pb-2 dark:border-slate-800">
                                            <p className="truncate px-2 text-xs text-slate-500">{session.user?.email}</p>
                                        </div>
                                        <Link
                                            href={`/${role?.toLowerCase()}`}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            <LayoutDashboard className="h-4 w-4 text-cyan-400" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={`/${role?.toLowerCase()}/settings`}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                        >
                                            <UserCircle2 className="h-4 w-4 text-cyan-400" />
                                            Settings
                                        </Link>
                                        <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/signin">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button variant="primary" size="sm">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={toggleMobileMenu}
                    className="flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileMenu === "open" ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileMenu === "open" && (
                <div className="animate-fade-in border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950">
                    <nav className="flex flex-col gap-1 px-5 pb-6 pt-4">
                        <div className="mb-2 flex items-center justify-between px-3 py-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Menu</span>
                            <ThemeToggle />
                        </div>
                        {!isAuthed &&
                            marketingLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        {isAuthed &&
                            workspaceLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMobileMenu}
                                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        {isAuthed && (
                            <Link
                                href="/api/auth/signout"
                                onClick={closeMobileMenu}
                                className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Link>
                        )}
                        {!isAuthed && (
                            <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                                <Link href="/signin" onClick={closeMobileMenu}>
                                    <Button variant="outline" fullWidth size="sm">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/signup" onClick={closeMobileMenu}>
                                    <Button variant="primary" fullWidth size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
