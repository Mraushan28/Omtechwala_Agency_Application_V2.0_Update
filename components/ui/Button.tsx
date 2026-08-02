import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 shadow-glow-cyan focus-visible:outline-cyan-400",
    secondary:
        "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 hover:border-slate-600",
    outline:
        "bg-transparent text-slate-200 border border-slate-700 hover:border-cyan-500/60 hover:text-cyan-300",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-white",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3.5 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-12 px-7 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { className, variant = "primary", size = "md", leftIcon, rightIcon, fullWidth, children, ...props },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variantClasses[variant],
                    sizeClasses[size],
                    fullWidth && "w-full",
                    className,
                )}
                {...props}
            >
                {leftIcon}
                {children}
                {rightIcon}
            </button>
        );
    },
);

Button.displayName = "Button";

