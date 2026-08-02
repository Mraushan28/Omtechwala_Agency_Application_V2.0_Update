import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Search, FileText, ShieldCheck, ArrowRight, MessageSquare, Wallet } from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Submit Requirements",
        description: "Share your project scope, budget, and timeline. Our team reviews and matches you with pre-vetted talent within 48 hours.",
        icon: FileText,
    },
    {
        number: "02",
        title: "Contract & Escrow",
        description: "Agree on milestones and payment terms. Funds are secured in escrow — released only upon milestone approval.",
        icon: ShieldCheck,
        iconAlt: ShieldCheck,
    },
    {
        number: "03",
        title: "Execution & Delivery",
        description: "Your contractor delivers work per milestones. You review, approve, and funds are released automatically. Repeat until completion.",
        icon: Wallet,
    },
];

const milestones = [
    { icon: MessageSquare, label: "Discovery & Scope", sub: "48h matching" },
    { icon: FileText, label: "NDA & Contract", sub: "Digital signing" },
    { icon: ShieldCheck, label: "Milestone 1", sub: "Review & release" },
    { icon: Wallet, label: "Final Delivery", sub: "Full payout" },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="border-b border-slate-800/60 bg-slate-900/50 py-20 sm:py-28">
            <Container>
                <SectionHeading
                    eyebrow="How It Works"
                    title="Contracting, Execution & Escrow Delivery"
                    description="A streamlined workflow from scoping to final delivery. Every step is transparent, secure, and built for remote collaboration."
                />

                {/* Steps */}
                <div className="mt-14 grid gap-8 sm:grid-cols-3">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.number} className="relative">
                                {idx < steps.length - 1 && (
                                    <div className="absolute right-0 top-12 hidden sm:block">
                                        <ArrowRight className="h-6 w-6 text-slate-700" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-4">
                                    <span className="text-5xl font-black text-slate-800">{step.number}</span>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Visual timeline */}
                <div className="mt-16 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-2">
                        {milestones.map((m, idx) => {
                            const Icon = m.icon;
                            return (
                                <div key={m.label} className="flex flex-1 flex-col items-center gap-2 text-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-500">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-medium text-white">{m.label}</p>
                                    <p className="text-[10px] text-slate-600">{m.sub}</p>
                                    {idx < milestones.length - 1 && (
                                        <div className="mt-1 h-px w-full bg-gradient-to-r from-cyan-500/40 to-transparent" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Container>
        </section>
    );
}
