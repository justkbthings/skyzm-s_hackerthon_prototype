export const colorSchemes = {
  default: {
    primary: "#0D1F4E",
    secondary: "#E6FBF5",
    accent: "#00C896",
    background: "#F4F6FA",
    surface: "#FFFFFF",
    text: "#0D1F4E",
    textMuted: "#6B7A99",
    success: "#00C896",
    danger: "#E53E3E",
  },
  ocean: {
    primary: "#1A3380",
    secondary: "#E6FBF5",
    accent: "#00C896",
    background: "#F4F6FA",
    surface: "#FFFFFF",
    text: "#0D1F4E",
    textMuted: "#6B7A99",
    success: "#00C896",
    danger: "#E53E3E",
  },
} as const;

export type ColorSchemeName = keyof typeof colorSchemes;
export type AppColors = (typeof colorSchemes)[ColorSchemeName];
