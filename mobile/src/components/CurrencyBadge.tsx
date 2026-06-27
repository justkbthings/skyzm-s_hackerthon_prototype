import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { createStyles } from "../theme/styles";
import type { User } from "../services/api";

interface Props {
  user: Pick<User, "accountCurrency" | "accountCountry" | "accountFlag" | "currency" | "country">;
  onPress?: () => void;
}

function countryFlag(country?: string): string {
  const mapping: Record<string, string> = {
    "South Africa": "🇿🇦",
    Kenya: "🇰🇪",
    England: "🇬🇧",
    USA: "🇺🇸",
    GB: "🇬🇧",
    KE: "🇰🇪",
    ZA: "🇿🇦",
    US: "🇺🇸",
  };

  return (country && mapping[country]) || "🌍";
}

export function CurrencyBadge({ user, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const flag = user.accountFlag ?? countryFlag(user.accountCountry ?? user.country);
  const currency = user.accountCurrency ?? user.currency;

  return (
    <Pressable onPress={onPress} style={styles.currencyBadge}>
      <View>
        <Text style={styles.flagText}>{flag}</Text>
      </View>
      <Text style={styles.currencyCode}>{currency}</Text>
    </Pressable>
  );
}
