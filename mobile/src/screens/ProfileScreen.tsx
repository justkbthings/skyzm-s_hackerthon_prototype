import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { CurrencyBadge } from "../components/CurrencyBadge";
import { createStyles } from "../theme/styles";

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.tabContent}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {user ? <CurrencyBadge user={user} /> : null}
          <LanguagePicker />
        </View>
        <Text style={styles.headerTitle}>{user?.displayName ?? t("common.appName")}</Text>
        <Text style={styles.headerSubtitle}>Profile and wallet settings</Text>
      </View>

      <View style={styles.tabCard}>
        <Text style={styles.label}>Wallet</Text>
        <Text style={styles.listItemTitle}>{user?.walletAddress ?? user?.ilpWalletAddress ?? "Not linked"}</Text>
        <Text style={styles.listItemSubtitle}>Base currency: {user?.accountCurrency ?? user?.currency ?? "ZAR"}</Text>
      </View>

      <View style={styles.tabCard}>
        <Text style={styles.label}>Identity</Text>
        <Text style={styles.listItemTitle}>{user?.displayName}</Text>
        <Text style={styles.listItemSubtitle}>{user?.accountCountry ?? user?.country}</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={logout}>
        <Text style={styles.primaryButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}
