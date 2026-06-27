import React from "react";
import Feather from "@expo/vector-icons/Feather";
import type { AppColors } from "../theme/colors";

export type AppIconName = React.ComponentProps<typeof Feather>["name"];

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 20, color = "#101828" }: AppIconProps) {
  return <Feather name={name} size={size} color={color} />;
}

export function iconColors(colors: AppColors) {
  return {
    primary: colors.primary,
    accent: colors.accent,
    muted: colors.textMuted,
    onPrimary: "#FFFFFF",
    onAccent: "#FFFFFF",
    surface: colors.surface,
  };
}
