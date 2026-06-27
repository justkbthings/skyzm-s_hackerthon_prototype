import React, { useEffect, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Animated, View, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface BrandDotsProps {
  size?: number;
  gap?: number;
  pulse?: boolean;
  style?: ViewStyle;
}

export function BrandDots({ size = 6, gap = 5, pulse = false, style }: BrandDotsProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, opacity]);

  const dots = (
    <View style={[styles.row, { gap }, style]}>
      {[colors.primary, colors.accent, colors.primary].map((color, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i === 1 ? colors.accent : colors.primary,
            opacity: i === 0 ? 1 : i === 1 ? 0.85 : 0.65,
          }}
        />
      ))}
    </View>
  );

  if (pulse) {
    return <Animated.View style={{ opacity }}>{dots}</Animated.View>;
  }

  return dots;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
