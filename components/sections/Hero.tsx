"use client";

import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-slate-800/60 bg-slate-950">
            {/* Background grid */}
            <div className="absolute inset-0 bg-grid-slate [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_0%,transparent_100%)]" />

            {/* Radial glow */}
            <div className="absolute inset-0 bg-radial-fade" />

            <Container className="relative pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-32">
                {/* Eyebrow */}
                <div className="mb-6 flex animate-fade-in-up items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        Trusted by 200+ global enterprises
                    </span>
                </div>

                {/* Headline */}
                <h1 className="animate-fade-in-up max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem] [animation-delay:0.1s]">
                    Enterprise-Grade Tech Talent{" "}
                    <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                        On Demand
                    </span>
                </h1>

                <p className="animate-fade-in-up mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg [animation-delay:0.2s]">
                    Om Techwala connects your business with the top 1% of pre-vetted engineers, AI/ML
                    specialists, and designers. Full-cycle outsourcing with escrow-backed milestones, NDA
                    protection, and zero overhead.
                </p>

                {/* CTA buttons */}
                <div className="animate-fade-in-up mt-10 flex flex-wrap gap-4 [animation-delay:0.3s]">
                    <Link href="/signup?role=client">
                        <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                            Hire Top Talent
                        </Button>
                    </Link>
                    <Link href="/signup?role=contractor">
                        <Button variant="outline" size="lg" leftIcon={<PlayCircle className="h-5 w-5" />}>
                            Apply as Contractor
                        </Button>
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="animate-fade-in-up mt-14 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 [animation-delay:0.4s]">
                    {[
                        { label: "Pre-vetted talent", sub: "Top 1% acceptance rate" },
                        { label: "Escrow protection", sub: "Milestone-based payouts" },
                        { label: "NDA-ready", sub: "Standard & custom agreements" },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-500" />
                            <div>
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
