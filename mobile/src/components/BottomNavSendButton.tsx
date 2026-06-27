import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "@expo/vector-icons/Feather";
import { brand, brandGradient } from "../theme/brand";

interface BottomNavSendButtonProps {
  onPress?: () => void;
  accessibilityState?: { selected?: boolean };
}

export function BottomNavSendButton({
  onPress,
  accessibilityState,
}: BottomNavSendButtonProps) {
  const focused = accessibilityState?.selected;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
      accessibilityRole="button"
      accessibilityLabel="Send money"
    >
      <LinearGradient
        colors={brandGradient.colors}
        start={brandGradient.start}
        end={brandGradient.end}
        style={[styles.button, focused && styles.buttonFocused]}
      >
        <Feather name="send" size={22} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.label, focused && styles.labelFocused]}>Send</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    top: -14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  button: {
    width: 52,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonFocused: {
    shadowOpacity: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: brand.textSecondary,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: brand.primary,
    fontWeight: "700",
  },
});
