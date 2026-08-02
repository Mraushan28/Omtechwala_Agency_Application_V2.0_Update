import Link from "next/link";
import { Code2, Mail, MapPin } from "lucide-react";
import { footerColumns } from "@/constants/navigation";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand column */}
                    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 shadow-glow-cyan">
                                <Code2 className="h-4.5 w-4.5 text-slate-950 stroke-[2.5]" size={18} />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white">
                                Om<span className="text-cyan-400">Techwala</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Bridging global enterprises with the top 1% of pre-vetted tech talent across Web, AI/ML,
                            Design, and AI Training.
                        </p>
                        <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                                Global — Remote-first
                            </span>
                            <span className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-cyan-500" />
                                hello@omtechwala.com
                            </span>
                        </div>
                    </div>

                    {/* Link columns */}
                    {footerColumns.map((col) => (
                        <div key={col.title} className="flex flex-col gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                                {col.title}
                            </h3>
                            <ul className="flex flex-col gap-2">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row dark:border-slate-800/60">
                    <p className="text-xs text-slate-500">
                        &copy; {year} Om Techwala. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <Link href="#" className="transition-colors hover:text-slate-900 dark:hover:text-slate-300">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="transition-colors hover:text-slate-900 dark:hover:text-slate-300">
                            Terms of Service
                        </Link>
                        <Link href="#" className="transition-colors hover:text-slate-900 dark:hover:text-slate-300">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
