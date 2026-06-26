import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";
import { api, PaymentRequest, UserPublic } from "../services/api";

export function RequestScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [users, setUsers] = useState<UserPublic[]>([]);
  const [incoming, setIncoming] = useState<PaymentRequest[]>([]);
  const [payerId, setPayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    api.users().then(setUsers);
    api.requests.list().then((r) => setIncoming(r.incoming));
  }, []);

  const sendRequest = async () => {
    if (!payerId || !amount) return;
    await api.requests.create({
      payerId,
      amount: Number(amount),
      currency: "ZAR",
      reason,
    });
    Alert.alert(t("common.success"), t("request.sendRequest"));
    setAmount("");
    setReason("");
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <LanguagePicker />
        <Text style={styles.headerTitle}>{t("request.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("request.subtitle")}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{t("request.selectPayer")}</Text>
        {users.map((u) => (
          <Pressable key={u.id} style={styles.listItem} onPress={() => setPayerId(u.id)}>
            <Text style={styles.listItemTitle}>
              {payerId === u.id ? "● " : "○ "}
              {u.displayName}
            </Text>
          </Pressable>
        ))}

        <TextInput style={styles.input} placeholder={t("common.amount")} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <TextInput style={styles.input} placeholder={t("common.reason")} value={reason} onChangeText={setReason} />

        <Pressable style={styles.primaryButton} onPress={sendRequest}>
          <Text style={styles.primaryButtonText}>{t("request.sendRequest")}</Text>
        </Pressable>

        <Text style={[styles.label, { marginTop: 24 }]}>Incoming requests</Text>
        {incoming.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.listItemTitle}>
              {r.currency} {r.amount} — {r.status}
            </Text>
            {r.reason ? <Text style={styles.listItemSubtitle}>{r.reason}</Text> : null}
            {r.status === "PENDING" && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <Pressable style={styles.primaryButton} onPress={() => api.requests.approve(r.id)}>
                  <Text style={styles.primaryButtonText}>Approve</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => api.requests.decline(r.id)}>
                  <Text style={styles.secondaryButtonText}>Decline</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
