"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, HardHat, CheckCircle2, Zap, Shield, DollarSign } from "lucide-react";
import Link from "next/link";

type View = "client" | "talent";

const clientFeatures = [
    { icon: CheckCircle2, text: "Pre-vetted senior talent, matched in 48 hours" },
    { icon: Shield, text: "NDA-backed engagement with IP protection" },
    { icon: DollarSign, text: "Escrow milestone payments — pay for delivery" },
    { icon: Zap, text: "Dedicated account manager & reporting" },
];

const talentFeatures = [
    { icon: CheckCircle2, text: "Access to premium global projects" },
    { icon: Shield, text: "Guaranteed bi-weekly payouts via escrow" },
    { icon: DollarSign, text: "Competitive rates with zero platform fees" },
    { icon: Zap, text: "Flexible contracts — full-time, part-time, or hourly" },
];

export function WorkspaceSelector() {
    const [view, setView] = useState<View>("client");

    const features = view === "client" ? clientFeatures : talentFeatures;
    const ctaLabel = view === "client" ? "Outsource Your Project" : "Apply as Contractor";
    const ctaHref = view === "client" ? "/signup?role=client" : "/signup?role=contractor";

    return (
        <section id="for-clients" className="border-b border-slate-800/60 bg-slate-950 py-20 sm:py-28">
            <Container>
                <SectionHeading
                    eyebrow="Dual Workspace"
                    title="One Platform, Two Experiences"
                    description="Whether you are hiring talent or offering your skills, Om Techwala provides a dedicated workspace tailored to your role."
                />

                {/* Toggle */}
                <div className="mx-auto mt-10 flex w-fit overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-1">
                    <button
                        onClick={() => setView("client")}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200",
                            view === "client"
                                ? "bg-cyan-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white",
                        )}
                    >
                        <Building2 className="h-4 w-4" />
                        For Clients
                    </button>
                    <button
                        onClick={() => setView("talent")}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200",
                            view === "talent"
                                ? "bg-cyan-500 text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white",
                        )}
                    >
                        <HardHat className="h-4 w-4" />
                        For Talent
                    </button>
                </div>

                {/* Content */}
                <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Left: Feature list */}
                    <div className="flex flex-col justify-center gap-6">
                        <h3 className="text-2xl font-bold text-white">
                            {view === "client" ? "Outsource with Confidence" : "Build Your Career"}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            {view === "client"
                                ? "Stop managing freelancers across platforms. Get a dedicated team of senior engineers, ML specialists, or designers who work as an extension of your organization."
                                : "Join a curated network of top-tier tech talent. Work on impactful projects with enterprises that value quality, timely delivery, and transparent communication."}
                        </p>
                        <ul className="flex flex-col gap-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <li key={feature.text} className="flex items-start gap-3">
                                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                                        <span className="text-sm text-slate-300">{feature.text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="mt-2">
                            <Link href={ctaHref}>
                                <Button variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                    {ctaLabel}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Visual card */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-full rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-card">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                    {view === "client" ? (
                                        <Building2 className="h-5 w-5 text-cyan-400" />
                                    ) : (
                                        <HardHat className="h-5 w-5 text-cyan-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {view === "client" ? "Client Workspace" : "Contractor Workspace"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {view === "client" ? "Manage projects & team" : "Track applications & earnings"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                {[
                                    { label: "Active Projects", value: "4" },
                                    { label: "Team Members", value: "3" },
                                    { label: "Next Milestone", value: "Due in 12 days" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-lg bg-slate-900/80 px-4 py-2.5"
                                    >
                                        <span className="text-xs text-slate-500">{item.label}</span>
                                        <span className="text-sm font-medium text-white">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
