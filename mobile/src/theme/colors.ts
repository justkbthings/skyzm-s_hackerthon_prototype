import { brand } from "./brand";

export const colorSchemes = {
  default: {
    primary: brand.primary,
    primaryDark: "#002D7A",
    secondary: brand.surfaceLight,
    accent: brand.secondary,
    background: brand.background,
    surface: brand.surface,
    surfacePurple: brand.surfaceLight,
    surfaceBlue: brand.surfaceLight,
    text: brand.textPrimary,
    textMuted: brand.textSecondary,
    border: brand.border,
    success: brand.success,
    danger: brand.danger,
    savings: brand.success,
    gradientStart: brand.gradientStart,
    gradientEnd: brand.gradientEnd,
  },
  ocean: {
    primary: brand.primary,
    primaryDark: "#002D7A",
    secondary: brand.surfaceLight,
    accent: brand.secondary,
    background: brand.background,
    surface: brand.surface,
    surfacePurple: brand.surfaceLight,
    surfaceBlue: brand.surfaceLight,
    text: brand.textPrimary,
    textMuted: brand.textSecondary,
    border: brand.border,
    success: brand.success,
    danger: brand.danger,
    savings: brand.success,
    gradientStart: brand.gradientStart,
    gradientEnd: brand.gradientEnd,
  },
} as const;

export type ColorSchemeName = keyof typeof colorSchemes;
export type AppColors = (typeof colorSchemes)[ColorSchemeName];
