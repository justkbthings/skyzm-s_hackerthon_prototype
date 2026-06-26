import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";
import { api, Transaction } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export function HistoryScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    api.history().then(setHistory);
  }, []);

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Text style={styles.headerTitle}>{t("history.title")}</Text>
      </View>

      <View style={styles.content}>
        {history.length === 0 ? (
          <Text style={styles.listItemSubtitle}>{t("history.empty")}</Text>
        ) : (
          history.map((tx) => (
            <View key={tx.id} style={styles.card}>
              <Text style={styles.listItemTitle}>
                {tx.direction} — {tx.status}
              </Text>
              <Text style={styles.listItemSubtitle}>
                {tx.assetCode} {tx.debitAmount ?? tx.receiveAmount} —{" "}
                {new Date(tx.createdAt).toLocaleString()}
              </Text>
              {tx.description ? (
                <Text style={styles.listItemSubtitle}>{tx.description}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

export function PaymentStatusScreen({ route }: NativeStackScreenProps<RootStackParamList, "PaymentStatus">) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const id = route.params.transactionId;
    const interval = setInterval(() => {
      api.payments.status(id).then(setTx);
    }, 2000);
    api.payments.status(id).then(setTx);
    return () => clearInterval(interval);
  }, [route.params.transactionId]);

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Text style={styles.headerTitle}>Payment status</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.listItemTitle}>{tx?.status ?? t("common.loading")}</Text>
      </View>
    </ScrollView>
  );
}
