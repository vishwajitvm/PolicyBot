import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "dark" | "light" | "blue";

type ThemeState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "policybot-theme" }
  )
);