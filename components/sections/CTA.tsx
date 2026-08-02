import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Code2 } from "lucide-react";
import Link from "next/link";

export function CTA() {
    return (
        <section className="border-b border-slate-800/60 bg-slate-950 py-20 sm:py-28">
            <Container>
                <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-14">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />

                    <div className="relative flex flex-col items-center gap-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 shadow-glow-cyan">
                            <Code2 className="h-7 w-7 text-cyan-400" />
                        </div>
                        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to Scale Your Engineering Capacity?
                        </h2>
                        <p className="max-w-lg text-base leading-relaxed text-slate-400">
                            Tell us about your project. We will match you with senior talent and have a proposal ready
                            within 48 hours — no commitment required.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/signup?role=client">
                                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                    Start Your Project
                                </Button>
                            </Link>
                            <Link href="#services">
                                <Button variant="outline" size="lg">
                                    Explore Services
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs text-slate-600">No commitment. Free consultation within 48 hours.</p>
                    </div>
                </div>
            </Container>
        </section>
    );
}
