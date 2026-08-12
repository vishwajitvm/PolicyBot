import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "dark" | "light" | "blue";

type ThemeState = {
  theme: ThemeName;
  gradient: boolean;
  setTheme: (theme: ThemeName) => void;
  setGradient: (gradient: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      gradient: false,
      setTheme: (theme) => set({ theme }),
      setGradient: (gradient) => set({ gradient }),
    }),
    { name: "policybot-theme" }
  )
);