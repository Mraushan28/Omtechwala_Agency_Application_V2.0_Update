import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./providers/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
        "./stores/**/*.{ts,tsx}",
        "./constants/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                accent: {
                    DEFAULT: "#06b6d4",
                    soft: "#22d3ee",
                    deep: "#0e7490",
                },
            },
            boxShadow: {
                "glow-cyan": "0 0 40px -8px rgba(6, 182, 212, 0.35)",
                card: "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
            },
            backgroundImage: {
                "grid-slate":
                    "linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px)",
                "radial-fade": "radial-gradient(ellipse at top, rgba(6, 182, 212, 0.12), transparent 55%)",
            },
            keyframes: {
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
            },
            animation: {
                "fade-in-up": "fade-in-up 0.6s ease-out both",
                "fade-in": "fade-in 0.5s ease-out both",
            },
        },
    },
    plugins: [],
};

export default config;

