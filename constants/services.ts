import {
    Code2,
    BrainCircuit,
    DatabaseZap,
    PenTool,
    type LucideIcon,
} from "lucide-react";

export type Service = {
    key: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tags: string[];
};

export const services: Service[] = [
    {
        key: "WEB_DEVELOPMENT",
        title: "Web Development",
        description:
            "Full-stack web platforms, SaaS products, and high-traffic portals engineered with modern frameworks and hardened security.",
        icon: Code2,
        tags: ["React", "Next.js", "Node.js", "APIs", "Cloud"],
    },
    {
        key: "AI_ML",
        title: "AI & ML Engineering",
        description:
            "Production machine-learning systems, LLM integrations, computer vision, and intelligent automation for scale.",
        icon: BrainCircuit,
        tags: ["MLOps", "LLMs", "NLP", "Computer Vision", "Data Pipelines"],
    },
    {
        key: "AI_TRAINING",
        title: "AI Data Labeling & Training",
        description:
            "High-quality annotation, RLHF, prompt engineering, and domain-specialized training data for model alignment.",
        icon: DatabaseZap,
        tags: ["Annotation", "RLHF", "Prompt Engineering", "QA", "Benchmarks"],
    },
    {
        key: "UI_UX_DESIGN",
        title: "Graphic & UI/UX Design",
        description:
            "Brand identity, product design systems, and conversion-focused interfaces crafted by senior design talent.",
        icon: PenTool,
        tags: ["Branding", "Design Systems", "Prototyping", "Web & Mobile", "Motion"],
    },
];

