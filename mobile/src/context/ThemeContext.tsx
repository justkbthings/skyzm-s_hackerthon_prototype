import React, { createContext, useContext, useMemo, useState } from "react";
import { colorSchemes, ColorSchemeName, AppColors } from "../theme/colors";

interface ThemeContextValue {
  scheme: ColorSchemeName;
  colors: AppColors;
  setScheme: (name: ColorSchemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [scheme, setScheme] = useState<ColorSchemeName>("default");

  const value = useMemo(
    () => ({
      scheme,
      colors: colorSchemes[scheme],
      setScheme,
    }),
    [scheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
