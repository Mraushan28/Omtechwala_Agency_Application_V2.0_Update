import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = {
    children: ReactNode;
    className?: string;
    size?: "default" | "narrow";
};

export function Container({ children, className, size = "default" }: ContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full px-5 sm:px-6 lg:px-8",
                size === "default" ? "max-w-7xl" : "max-w-3xl",
                className,
            )}
        >
            {children}
        </div>
    );
}

