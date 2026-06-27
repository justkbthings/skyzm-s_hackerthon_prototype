import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { CurrencyBadge } from "../components/CurrencyBadge";
import { createStyles } from "../theme/styles";
import { api, formatMoney } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const [currency, setCurrency] = useState(user?.currency ?? "ZAR");
  const [recent, setRecent] = useState<Awaited<ReturnType<typeof api.history>>>([]);

  const parentNavigation = navigation.getParent();

  const openModal = (route: "Payment" | "Deposit" | "Withdraw" | "Request") => {
    parentNavigation?.navigate(route as never);
  };

  useEffect(() => {
    api.balance().then((b) => {
      setBalance(b.balance);
      setCurrency(b.currency);
    });
    api.history().then((items) => setRecent(items.slice(0, 3))).catch(() => setRecent([]));
    refreshUser();
  }, [refreshUser]);

  const actions = [
    { key: "Deposit", label: t("home.deposit"), icon: "↓", onPress: () => openModal("Deposit") },
    { key: "Payment", label: t("home.pay"), icon: "→", onPress: () => openModal("Payment") },
    { key: "Request", label: t("home.request"), icon: "?", onPress: () => openModal("Request") },
    { key: "Community", label: t("home.community"), icon: "◎", onPress: () => navigation.navigate("Community" as never) },
    { key: "Withdraw", label: t("home.withdraw"), icon: "↑", onPress: () => openModal("Withdraw") },
    { key: "History", label: t("home.history"), icon: "≡", onPress: () => navigation.navigate("Activity" as never) },
  ];

  return (
    <ScrollView testID="home-screen" style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {user ? (
            <CurrencyBadge user={user} onPress={() => navigation.navigate("Profile" as never)} />
          ) : null}
          <LanguagePicker />
        </View>
        <View style={styles.headerStack}>
          <Text testID="home-greeting" style={styles.headerTitle}>
            {t("home.greeting", { name: user?.displayName ?? "" })}
          </Text>
          <Text style={styles.headerSubtitle}>{t("home.subtitle")}</Text>
        </View>
        <Pressable testID="logout-button" onPress={logout} style={{ alignSelf: "flex-end", marginTop: 8 }}>
          <Text style={{ color: "#fff" }}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.balanceLabel}>{t("common.balance")}</Text>
          <Text testID="home-balance" style={styles.balanceAmount}>
            {formatMoney(balance, currency)}
          </Text>
          <Text style={styles.listItemSubtitle}>
            {user?.displayName} · {currency}
          </Text>
        </View>

        <View style={styles.actionGrid}>
          {actions.map((action) => (
            <Pressable
              key={action.key}
              testID={`home-action-${action.key.toLowerCase()}`}
              style={styles.actionButton}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>{t("history.title")}</Text>
        {recent.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.listItemSubtitle}>{t("history.empty")}</Text>
          </View>
        ) : (
          recent.map((tx) => (
            <View key={tx.id} style={styles.card}>
              <Text style={styles.listItemTitle}>
                {tx.direction} · {tx.status}
              </Text>
              <Text style={styles.listItemSubtitle}>
                {tx.assetCode} {tx.debitAmount ?? tx.receiveAmount} · {new Date(tx.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
