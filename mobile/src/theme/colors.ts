export const colorSchemes = {
  default: {
    primary: "#004B49",
    secondary: "#E8F5E9",
    accent: "#FF6B35",
    background: "#F7F9F8",
    surface: "#FFFFFF",
    text: "#1A1A1A",
    textMuted: "#6B7280",
    success: "#2E7D32",
    danger: "#C62828",
  },
  ocean: {
    primary: "#0D47A1",
    secondary: "#E3F2FD",
    accent: "#FF9800",
    background: "#F5F8FC",
    surface: "#FFFFFF",
    text: "#1A1A1A",
    textMuted: "#6B7280",
    success: "#2E7D32",
    danger: "#C62828",
  },
} as const;

export type ColorSchemeName = keyof typeof colorSchemes;
export type AppColors = (typeof colorSchemes)[ColorSchemeName];
