import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

type AvatarProps = {
    name?: string | null;
    src?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name ?? "User avatar"}
                className={cn("rounded-full object-cover ring-1 ring-slate-700", sizeClasses[size], className)}
            />
        );
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full bg-slate-800 font-semibold text-cyan-300 ring-1 ring-slate-700",
                sizeClasses[size],
                className,
            )}
        >
            {initials(name)}
        </div>
    );
}

