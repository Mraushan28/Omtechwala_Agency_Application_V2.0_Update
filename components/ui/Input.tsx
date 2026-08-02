import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
};

type AsSelect = { as: "select" } & SelectHTMLAttributes<HTMLSelectElement> & BaseProps;
type AsTextarea = { as: "textarea" } & TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps;
type AsInput = { as?: "input" } & InputHTMLAttributes<HTMLInputElement> & BaseProps;

type InputProps = AsSelect | AsTextarea | AsInput;

const fieldBase =
    "w-full rounded-lg border bg-slate-900/80 px-3.5 text-sm text-white placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40";

function errorClass(error?: string) {
    return error ? "border-red-500/60 focus:border-red-500" : "border-slate-800 focus:border-cyan-500/60";
}

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id ?? ("name" in props ? (props as { name?: string }).name : undefined);

        const labelEl = label ? (
            <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
                {label}
            </label>
        ) : null;

        const iconWrapper = (field: ReactNode) => (
            <div className="relative">
                {leftIcon ? (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                        {leftIcon}
                    </span>
                ) : null}
                {field}
                {rightIcon ? (
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                        {rightIcon}
                    </span>
                ) : null}
            </div>
        );

        let field: ReactNode;

        if ("as" in props && props.as === "select") {
            const { as, ...rest } = props as AsSelect;
            field = (
                <select
                    ref={ref as React.Ref<HTMLSelectElement>}
                    id={inputId}
                    className={cn(fieldBase, "h-11 pr-10", leftIcon && "pl-10", errorClass(error), className)}
                    {...rest}
                >
                    {rest.children}
                </select>
            );
        } else if ("as" in props && props.as === "textarea") {
            const { as, ...rest } = props as AsTextarea;
            field = (
                <textarea
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    id={inputId}
                    className={cn(fieldBase, "min-h-[120px] py-3", leftIcon && "pl-10", errorClass(error), className)}
                    {...rest}
                />
            );
        } else {
            const { as: _as, ...rest } = props as AsInput;
            field = (
                <input
                    ref={ref as React.Ref<HTMLInputElement>}
                    id={inputId}
                    className={cn(fieldBase, "h-11", leftIcon && "pl-10", rightIcon && "pr-10", errorClass(error), className)}
                    {...rest}
                />
            );
        }

        return (
            <div className="flex flex-col gap-1.5">
                {labelEl}
                {iconWrapper(field)}
                {error ? <p className="text-xs text-red-400">{error}</p> : null}
            </div>
        );
    },
);

Input.displayName = "Input";

