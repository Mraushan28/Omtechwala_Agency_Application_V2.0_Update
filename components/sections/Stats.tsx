import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Users, Globe, Clock, Award } from "lucide-react";

const statistics = [
    {
        value: "200+",
        label: "Enterprise Clients",
        description: "Trusted by Fortune 500 companies and fast-growing startups",
        icon: Users,
    },
    {
        value: "2,500+",
        label: "Vetted Contractors",
        description: "Top 1% acceptance rate across all skill categories",
        icon: Globe,
    },
    {
        value: "48h",
        label: "Average Match Time",
        description: "From requirements to shortlisted candidates",
        icon: Clock,
    },
    {
        value: "98%",
        label: "Delivery Success",
        description: "Milestones completed on time and within budget",
        icon: Award,
    },
];

export function Stats() {
    return (
        <section className="border-b border-slate-800/60 bg-slate-950 py-20 sm:py-28">
            <Container>
                <SectionHeading
                    eyebrow="Trust & Performance"
                    title="Built for Reliability"
                    description="Every number behind Om Techwala reflects a commitment to quality, speed, and enterprise-grade delivery."
                />

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statistics.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="group rounded-xl border border-slate-800/80 bg-slate-900/50 p-6 transition-all duration-300 hover:border-cyan-500/30"
                            >
                                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                                    <Icon className="h-5.5 w-5.5" />
                                </div>
                                <p className="text-3xl font-bold tracking-tight text-white">{stat.value}</p>
                                <p className="mt-1 text-sm font-medium text-slate-300">{stat.label}</p>
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{stat.description}</p>
                            </div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
