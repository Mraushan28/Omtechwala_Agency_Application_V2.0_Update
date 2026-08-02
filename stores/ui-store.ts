import { create } from "zustand";

type MobileMenuState = "closed" | "open";

type UIState = {
    mobileMenu: MobileMenuState;
    workspaceView: "client" | "talent";
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;
    setWorkspaceView: (view: "client" | "talent") => void;
};

export const useUIStore = create<UIState>((set) => ({
    mobileMenu: "closed",
    workspaceView: "client",
    openMobileMenu: () => set({ mobileMenu: "open" }),
    closeMobileMenu: () => set({ mobileMenu: "closed" }),
    toggleMobileMenu: () => set((state) => ({ mobileMenu: state.mobileMenu === "open" ? "closed" : "open" })),
    setWorkspaceView: (workspaceView) => set({ workspaceView }),
}));

