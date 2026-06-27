import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { CurrencyBadge } from "../components/CurrencyBadge";
import { createStyles } from "../theme/styles";
import { api } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Payments">;

export function PaymentsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [beneficiaries, setBeneficiaries] = useState<Awaited<ReturnType<typeof api.beneficiaries.list>>>([]);

  useEffect(() => {
    api.beneficiaries.list().then(setBeneficiaries).catch(() => setBeneficiaries([]));
  }, []);

  const openPayment = () => navigation.getParent()?.navigate("Payment" as never);
  const openRequest = () => navigation.getParent()?.navigate("Request" as never);
  const openDeposit = () => navigation.getParent()?.navigate("Deposit" as never);
  const openWithdraw = () => navigation.getParent()?.navigate("Withdraw" as never);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.tabContent}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {user ? (
            <CurrencyBadge user={user} onPress={() => navigation.navigate("Profile" as never)} />
          ) : null}
          <LanguagePicker />
        </View>
        <View style={styles.headerStack}>
          <Text style={styles.headerTitle}>{t("payment.title")}</Text>
          <Text style={styles.headerSubtitle}>Manage sends, deposits, and requests from one place.</Text>
        </View>
      </View>

      <View style={styles.tabCard}>
        <Text style={styles.label}>{user?.accountCurrency ?? user?.currency ?? "ZAR"} wallet</Text>
        <Text style={styles.listItemTitle}>You are sending from your {(user?.accountCurrency ?? user?.currency ?? "ZAR")} wallet.</Text>
        <Text style={styles.listItemSubtitle}>Your base currency is locked to your profile.</Text>
      </View>

      <View style={styles.sectionToggleRow}>
        <Pressable style={styles.sectionToggle} onPress={openPayment}>
          <Text style={styles.sectionToggleText}>Send</Text>
        </Pressable>
        <Pressable style={styles.sectionToggle} onPress={openRequest}>
          <Text style={styles.sectionToggleText}>Request</Text>
        </Pressable>
      </View>

      <View style={styles.sectionToggleRow}>
        <Pressable style={styles.sectionToggle} onPress={openDeposit}>
          <Text style={styles.sectionToggleText}>Deposit</Text>
        </Pressable>
        <Pressable style={styles.sectionToggle} onPress={openWithdraw}>
          <Text style={styles.sectionToggleText}>Withdraw</Text>
        </Pressable>
      </View>

      <View style={styles.tabCard}>
        <Text style={styles.label}>Recent beneficiaries</Text>
        {beneficiaries.length === 0 ? (
          <Text style={styles.listItemSubtitle}>No beneficiaries yet. Add one from the send flow.</Text>
        ) : (
          beneficiaries.map((beneficiary) => (
            <View key={beneficiary.id} style={styles.listItem}>
              <View>
                <Text style={styles.listItemTitle}>{beneficiary.name}</Text>
                <Text style={styles.listItemSubtitle}>{beneficiary.walletAddress}</Text>
              </View>
              <Text style={styles.tabPillText}>{beneficiary.country ?? "ILP"}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
