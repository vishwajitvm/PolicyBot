import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "dark" | "light" | "blue" | "red" | "gradient" | "custom";

type ThemeState = {
  theme: ThemeName;
  customPrimary: string;
  customText: string;
  gradient: boolean;
  gradientStart: string;
  gradientEnd: string;
  setTheme: (theme: ThemeName) => void;
  setCustomPrimary: (color: string) => void;
  setCustomText: (color: string) => void;
  setGradient: (enabled: boolean) => void;
  setGradientStart: (color: string) => void;
  setGradientEnd: (color: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      customPrimary: "#27c5a5",
      customText: "#edf2f7", // Default light text color for dark theme
      gradient: false,
      gradientStart: "#8b5cf6", // Violet - default gradient start
      gradientEnd: "#06b6d4",   // Cyan - default gradient end
      setTheme: (theme) => set({ theme }),
      setCustomPrimary: (customPrimary) => set({ customPrimary }),
      setCustomText: (customText) => set({ customText }),
      setGradient: (gradient) => set({ gradient }),
      setGradientStart: (gradientStart) => set({ gradientStart }),
      setGradientEnd: (gradientEnd) => set({ gradientEnd })
    }),
    { name: "policybot-theme" }
  )
);