import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand, brandGradient } from "../theme/brand";
import { AppIcon, AppIconName } from "./AppIcon";

interface ThumelaButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  icon?: AppIconName;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function ThumelaButton({
  label,
  icon,
  variant = "primary",
  fullWidth = true,
  style,
  testID,
  ...pressableProps
}: ThumelaButtonProps) {
  if (variant === "primary") {
    return (
      <Pressable
        testID={testID}
        style={({ pressed }) => [
          fullWidth && styles.fullWidth,
          styles.shadow,
          pressed && styles.pressed,
          style,
        ]}
        {...pressableProps}
      >
        <LinearGradient
          colors={brandGradient.colors}
          start={brandGradient.start}
          end={brandGradient.end}
          style={[styles.primary, fullWidth && styles.fullWidth]}
        >
          {icon ? <AppIcon name={icon} size={18} color="#FFFFFF" /> : null}
          <Text style={styles.primaryText}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        testID={testID}
        style={({ pressed }) => [
          styles.secondary,
          fullWidth && styles.fullWidth,
          pressed && styles.pressed,
          style,
        ]}
        {...pressableProps}
      >
        {icon ? <AppIcon name={icon} size={18} color={brand.primary} /> : null}
        <Text style={styles.secondaryText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.7 }, style]}
      {...pressableProps}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  primary: {
    minHeight: 56,
    borderRadius: brand.buttonRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondary: {
    minHeight: 52,
    borderRadius: brand.buttonRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: brand.surfaceLight,
    borderWidth: 1,
    borderColor: brand.border,
  },
  secondaryText: {
    color: brand.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  ghost: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  ghostText: {
    color: brand.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  shadow: {
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
