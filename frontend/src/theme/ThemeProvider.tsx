import { PropsWithChildren, useEffect } from "react";
import { useThemeStore } from "../stores/themeStore";

export function ThemeProvider({ children }: PropsWithChildren) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Simply set the data-theme attribute on the root HTML element
    // themes.css handles all the variable switching
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}