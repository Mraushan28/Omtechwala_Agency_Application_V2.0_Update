"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps, ReactNode } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider> & {
    children: ReactNode;
};

/**
 * Wraps the application in next-themes so Tailwind's `dark:` variants react to
 * the `class` attribute on <html>. Defaults to dark to match the existing
 * enterprise slate/cyan design.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange {...props}>
            {children}
        </NextThemesProvider>
    );
}

