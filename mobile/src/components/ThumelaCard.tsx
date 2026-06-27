import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { brand } from "../theme/brand";
import { BrandDots } from "./BrandDots";

interface ThumelaCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: "purple" | "blue" | "none";
  showDots?: boolean;
}

export function ThumelaCard({
  children,
  style,
  accent = "none",
  showDots = false,
}: ThumelaCardProps) {
  const { colors } = useTheme();
  const accentColor =
    accent === "purple"
      ? colors.primary
      : accent === "blue"
        ? colors.accent
        : undefined;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {accentColor ? (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      ) : null}
      {showDots ? (
        <View style={styles.dotsCorner}>
          <BrandDots size={5} gap={4} />
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: brand.cardRadius,
    borderWidth: 1,
    padding: 18,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  dotsCorner: {
    position: "absolute",
    top: 14,
    right: 16,
  },
});
