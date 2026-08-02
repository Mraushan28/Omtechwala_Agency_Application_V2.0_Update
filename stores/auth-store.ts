import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "ADMIN" | "CLIENT" | "CONTRACTOR" | null;

type AuthState = {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: Role;
    } | null;
    setUser: (user: AuthState["user"]) => void;
    clearUser: () => void;
};

/**
 * Lightweight client-side auth mirror used by UI components.
 * Server-side truth lives in the session (NextAuth).
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: "om-techwala-auth",
        },
    ),
);

