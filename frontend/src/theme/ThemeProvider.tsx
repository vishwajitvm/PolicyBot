import { PropsWithChildren, useEffect } from "react";

import { useThemeStore } from "../stores/themeStore";
import { palettes } from "./theme.constants";
import { applyPalette, hexToRgbTriplet } from "./theme.utils";

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme, customPrimary, gradient } = useThemeStore();

  useEffect(() => {
    const palette = { ...palettes[theme] };
    if (theme === "custom") {
      palette.primary = hexToRgbTriplet(customPrimary);
    }
    applyPalette(palette);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.gradient = gradient ? "true" : "false";
  }, [theme, customPrimary, gradient]);

  return <>{children}</>;
}
