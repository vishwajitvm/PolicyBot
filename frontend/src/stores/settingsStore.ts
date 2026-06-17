import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  reranking: boolean;
  setReranking: (enabled: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reranking: true,
      setReranking: (reranking) => set({ reranking })
    }),
    { name: "policybot-settings" }
  )
);
