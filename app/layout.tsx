import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Om Techwala — Enterprise Tech Talent On Demand",
        template: "%s | Om Techwala",
    },
    description:
        "Om Techwala connects global enterprises with the top 1% of pre-vetted tech talent across Web Development, AI/ML, AI Training, and UI/UX Design. Escrow-backed milestones, NDA protection, and zero overhead.",
    keywords: [
        "tech talent",
        "IT outsourcing",
        "AI ML engineering",
        "web development",
        "UI UX design",
        "freelance developers",
        "enterprise software",
    ],
    openGraph: {
        title: "Om Techwala — Enterprise Tech Talent On Demand",
        description:
            "Hire the top 1% of pre-vetted engineers, AI/ML specialists, and designers. Escrow-backed milestones with zero overhead.",
        type: "website",
        locale: "en_US",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
            <body className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-300">
                <ThemeProvider>
                    <QueryProvider>
                        <NextAuthProvider>{children}</NextAuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

