import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { services } from "@/constants/services";

export function ServicesMatrix() {
    return (
        <section id="services" className="border-b border-slate-800/60 bg-slate-950 py-20 sm:py-28">
            <Container>
                <SectionHeading
                    eyebrow="Expertise"
                    title="Full-Spectrum Tech Outsourcing"
                    description="One partnership, four capability areas. Every engagement is staffed with senior-level talent and managed through a single delivery framework."
                />

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => {
                        const Icon = service.icon;
                        return (
                            <article
                                key={service.key}
                                className="group relative rounded-xl border border-slate-800/80 bg-slate-900/50 p-6 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-card hover:bg-slate-900/80"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Title */}
                                <h3 className="mb-2 text-lg font-semibold text-white">{service.title}</h3>

                                {/* Description */}
                                <p className="mb-5 text-sm leading-relaxed text-slate-400">{service.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                    {service.tags.map((tag) => (
                                        <Badge key={tag} tone="slate">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}
