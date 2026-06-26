import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";
import { api } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const [currency, setCurrency] = useState(user?.currency ?? "ZAR");

  useEffect(() => {
    api.balance().then((b) => {
      setBalance(b.balance);
      setCurrency(b.currency);
    });
    refreshUser();
  }, [refreshUser]);

  const actions = [
    { key: "Deposit", label: t("home.deposit"), icon: "↓", screen: "Deposit" as const },
    { key: "Payment", label: t("home.pay"), icon: "→", screen: "Payment" as const },
    { key: "Request", label: t("home.request"), icon: "?", screen: "Request" as const },
    { key: "Community", label: t("home.community"), icon: "◎", screen: "Community" as const },
    { key: "Withdraw", label: t("home.withdraw"), icon: "↑", screen: "Withdraw" as const },
    { key: "History", label: t("home.history"), icon: "≡", screen: "History" as const },
  ];

  return (
    <ScrollView testID="home-screen" style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Pressable testID="logout-button" onPress={logout} style={{ alignSelf: "flex-end" }}>
          <Text style={{ color: "#fff", marginBottom: 8 }}>Logout</Text>
        </Pressable>
        <Text testID="home-greeting" style={styles.headerTitle}>
          {t("home.greeting", { name: user?.displayName ?? "" })}
        </Text>
        <Text style={styles.headerSubtitle}>{t("home.subtitle")}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.balanceLabel}>{t("common.balance")}</Text>
          <Text testID="home-balance" style={styles.balanceAmount}>
            {currency} {balance.toLocaleString()}
          </Text>
        </View>

        <View style={styles.actionGrid}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              testID={`home-action-${action.key.toLowerCase()}`}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
