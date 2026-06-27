import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BrandDots } from "./BrandDots";

interface ThumelaWordmarkProps {
  size?: "sm" | "md" | "lg";
  showDots?: boolean;
}

export function ThumelaWordmark({ size = "md", showDots = true }: ThumelaWordmarkProps) {
  const { colors } = useTheme();
  const fontSize = size === "lg" ? 26 : size === "md" ? 20 : 16;

  return (
    <View style={styles.row}>
      <Text style={[styles.thum, { fontSize, color: colors.text }]}>THUM</Text>
      <Text style={[styles.ela, { fontSize, color: colors.primary }]}>ELA</Text>
      {showDots ? (
        <View style={styles.dotsWrap}>
          <BrandDots size={size === "lg" ? 7 : 5} gap={4} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  thum: {
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  ela: {
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  dotsWrap: {
    marginLeft: 8,
  },
});
