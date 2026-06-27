import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { createStyles } from "../theme/styles";
import { api, Provider } from "../services/api";

export function WithdrawScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const accountCountry = user?.accountCountry ?? user?.country ?? "South Africa";
  const accountCurrency = user?.accountCurrency ?? user?.currency ?? "ZAR";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.providers(user?.country ?? "ZA").then((res) => setProviders(res.providers));
  }, [user?.country]);

  const complete = async () => {
    if (!selectedProvider || !amount) return;
    const res = await api.withdraw(Number(amount), selectedProvider);
    setMessage(res.message);
  };

  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader title={t("withdraw.title")} subtitle={t("withdraw.subtitle")} />

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>{t("common.selectCountry")}</Text>
          <Text style={styles.listItemTitle}>{accountCountry}</Text>
          <Text style={styles.listItemSubtitle}>Wallet currency: {accountCurrency}</Text>
        </View>

        {providers.map((p) => (
          <Pressable
            key={p.id}
            style={styles.listItem}
            onPress={() => setSelectedProvider(p.id)}
          >
            <Text style={styles.listItemTitle}>
              {selectedProvider === p.id ? "● " : "○ "}
              {p.name}
            </Text>
          </Pressable>
        ))}

        <TextInput
          style={styles.input}
          placeholder={t("common.amount")}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Pressable style={styles.primaryButton} onPress={complete}>
          <Text style={styles.primaryButtonText}>{t("withdraw.complete")}</Text>
        </Pressable>

        {message ? <Text style={{ marginTop: 12, color: colors.success }}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}
