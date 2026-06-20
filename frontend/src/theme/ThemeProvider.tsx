import { PropsWithChildren, useEffect } from "react";

import { useThemeStore } from "../stores/themeStore";
import { palettes } from "./theme.constants";
import { applyPalette, hexToRgbTriplet } from "./theme.utils";

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme, customPrimary, customText, gradient, gradientStart, gradientEnd } = useThemeStore();

  useEffect(() => {
    const palette = { ...palettes[theme] };
    if (theme === "custom") {
      palette.primary = hexToRgbTriplet(customPrimary);
      palette.text = hexToRgbTriplet(customText);
    }
    applyPalette(palette);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.gradient = gradient ? "true" : "false";

    // Set gradient colors as CSS variables if gradient is enabled
    if (gradient) {
      document.documentElement.style.setProperty('--gradient-start', hexToRgbTriplet(gradientStart));
      document.documentElement.style.setProperty('--gradient-end', hexToRgbTriplet(gradientEnd));
    } else {
      document.documentElement.style.removeProperty('--gradient-start');
      document.documentElement.style.removeProperty('--gradient-end');
    }
  }, [theme, customPrimary, customText, gradient, gradientStart, gradientEnd]);

  return <>{children}</>;
}