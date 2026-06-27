import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { brand, brandGradient } from "../theme/brand";
import { ThumelaCard } from "./ThumelaCard";
import { BrandDots } from "./BrandDots";

interface ThumelaPathCardProps {
  fromCity: string;
  fromFlag: string;
  toCity: string;
  toFlag: string;
  currency: string;
  feeMinor: string;
  traditionalMinor: string;
  savingsPercent?: string;
}

export function ThumelaPathCard({
  fromCity,
  fromFlag,
  toCity,
  toFlag,
  currency,
  feeMinor,
  traditionalMinor,
  savingsPercent = "85%",
}: ThumelaPathCardProps) {
  const { colors } = useTheme();

  const format = (minor: string) => {
    const num = Number(minor) / 100;
    return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ThumelaCard accent="purple" style={styles.card}>
      <View style={styles.badge}>
        <LinearGradient
          colors={brandGradient.colors}
          start={brandGradient.start}
          end={brandGradient.end}
          style={styles.badgeGradient}
        >
          <Text style={styles.badgeText}>THUMELA PATH™</Text>
        </LinearGradient>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Best path found</Text>

      <View style={styles.route}>
        <View style={styles.routeNode}>
          <Text style={styles.routeCity}>{fromCity}</Text>
          <Text style={styles.routeFlag}>{fromFlag}</Text>
        </View>

        <View style={styles.routeLine}>
          <View style={[styles.dotLine, { borderColor: colors.border }]} />
          <View style={styles.midNode}>
            <BrandDots size={5} gap={4} pulse />
            <Text style={[styles.connectorLabel, { color: colors.textMuted }]}>
              Best connector
            </Text>
          </View>
          <Text style={[styles.arrow, { color: colors.accent }]}>↓</Text>
        </View>

        <View style={styles.routeNode}>
          <Text style={styles.routeCity}>{toCity}</Text>
          <Text style={styles.routeFlag}>{toFlag}</Text>
        </View>
      </View>

      <Text style={[styles.meta, { color: colors.textMuted }]}>
        Compared 3 Interledger connectors
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        Fee: {format(feeMinor)}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        Traditional estimate: {format(traditionalMinor)}
      </Text>
      <Text style={[styles.savings, { color: colors.success }]}>
        You save about {savingsPercent}
      </Text>
    </ThumelaCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  badgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },
  route: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingVertical: 8,
  },
  routeNode: {
    alignItems: "center",
    minWidth: 72,
  },
  routeCity: {
    fontSize: 13,
    fontWeight: "700",
    color: brand.textPrimary,
    textAlign: "center",
  },
  routeFlag: {
    fontSize: 18,
    marginTop: 4,
  },
  routeLine: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  dotLine: {
    width: "80%",
    borderTopWidth: 1,
    borderStyle: "dashed",
    marginBottom: 6,
  },
  midNode: {
    alignItems: "center",
    gap: 4,
  },
  connectorLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: "700",
  },
  meta: {
    fontSize: 13,
    lineHeight: 20,
  },
  savings: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
});
