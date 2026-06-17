import { create } from "zustand";

type AppState = {
  lastTraceId?: string;
  setLastTraceId: (traceId?: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  lastTraceId: undefined,
  setLastTraceId: (lastTraceId) => set({ lastTraceId })
}));
