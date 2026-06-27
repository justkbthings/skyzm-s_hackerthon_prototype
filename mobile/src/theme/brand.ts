export const brand = {
  primary: "#003DA5",
  secondary: "#0057D9",
  gradientStart: "#003DA5",
  gradientEnd: "#0057D9",
  background: "#F6F8FB",
  surface: "#FFFFFF",
  surfaceLight: "#EAF2FF",
  textPrimary: "#101828",
  textSecondary: "#667085",
  border: "#E4E7EC",
  success: "#12B76A",
  danger: "#D92D20",
  buttonRadius: 12,
  cardRadius: 24,
} as const;

export const brandGradient = {
  colors: [brand.gradientStart, brand.gradientEnd] as [string, string],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
