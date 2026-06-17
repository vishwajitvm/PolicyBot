import type { ThemePalette } from "./theme.types";

export const palettes: Record<string, ThemePalette> = {
  dark: { surface: "9 13 18", panel: "16 22 29", border: "39 50 61", text: "237 242 247", muted: "145 158 171", primary: "39 197 165" },
  light: { surface: "246 248 251", panel: "255 255 255", border: "219 226 234", text: "22 28 36", muted: "92 105 119", primary: "13 118 107" },
  blue: { surface: "8 20 33", panel: "14 31 49", border: "45 72 95", text: "235 246 255", muted: "148 172 196", primary: "65 178 255" },
  red: { surface: "30 11 15", panel: "45 18 22", border: "92 41 47", text: "255 242 243", muted: "213 151 156", primary: "245 92 92" },
  gradient: { surface: "12 16 22", panel: "20 27 35", border: "55 66 78", text: "245 247 250", muted: "154 166 180", primary: "98 218 168" },
  custom: { surface: "13 17 23", panel: "21 27 36", border: "50 61 74", text: "240 246 252", muted: "139 148 158", primary: "39 197 165" }
};
