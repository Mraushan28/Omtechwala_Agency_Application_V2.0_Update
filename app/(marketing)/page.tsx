import { Hero } from "@/components/sections/Hero";
import { ServicesMatrix } from "@/components/sections/ServicesMatrix";
import { WorkspaceSelector } from "@/components/sections/WorkspaceSelector";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Stats } from "@/components/sections/Stats";
import { CTA } from "@/components/sections/CTA";

export default function MarketingHomePage() {
    return (
        <>
            <Hero />
            <ServicesMatrix />
            <WorkspaceSelector />
            <HowItWorks />
            <Stats />
            <CTA />
        </>
    );
}

