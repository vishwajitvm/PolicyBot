import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "dark" | "light" | "blue" | "red" | "gradient" | "custom";

type ThemeState = {
  theme: ThemeName;
  customPrimary: string;
  gradient: boolean;
  setTheme: (theme: ThemeName) => void;
  setCustomPrimary: (color: string) => void;
  setGradient: (enabled: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      customPrimary: "#27c5a5",
      gradient: false,
      setTheme: (theme) => set({ theme }),
      setCustomPrimary: (customPrimary) => set({ customPrimary }),
      setGradient: (gradient) => set({ gradient })
    }),
    { name: "policybot-theme" }
  )
);
