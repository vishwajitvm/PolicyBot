import type { ThemePalette } from "./theme.types";

export function hexToRgbTriplet(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export function applyPalette(palette: ThemePalette) {
  const root = document.documentElement;
  Object.entries(palette).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
}
