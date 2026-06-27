import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";
import { api, Provider } from "../services/api";
import { RootStackParamList } from "../navigation/types";

const COUNTRIES = ["ZA", "KE", "GB", "US"] as const;

type Props = NativeStackScreenProps<RootStackParamList, "Deposit">;

export function DepositScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [country, setCountry] = useState(user?.country ?? "ZA");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    api.providers(country).then((res) => {
      setProviders(res.providers);
      setSelectedProvider(null);
    });
  }, [country]);

  const complete = async () => {
    if (!selectedProvider || !amount) return;
    const res = await api.deposit(Number(amount), selectedProvider, country);
    setMessage(res.message);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate("MainTabs" as never);
    }, 900);
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Text style={styles.headerTitle}>{t("deposit.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("deposit.subtitle")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{t("common.selectCountry")}</Text>
        {COUNTRIES.map((c) => (
          <Pressable key={c} style={styles.listItem} onPress={() => setCountry(c)}>
            <Text style={styles.listItemTitle}>
              {country === c ? "● " : "○ "}
              {t(`countries.${c}`)}
            </Text>
          </Pressable>
        ))}

        <Text style={[styles.label, { marginTop: 12 }]}>
          {t("common.selectProvider")}
        </Text>
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
          <Text style={styles.primaryButtonText}>{t("deposit.complete")}</Text>
        </Pressable>

        {message ? <Text style={{ marginTop: 12, color: colors.success }}>{message}</Text> : null}
      </View>
    </ScrollView>
  );
}
