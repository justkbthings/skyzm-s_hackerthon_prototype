import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";
import { api, PaymentRequest, Transaction, User } from "../services/api";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Activity">;

function statusLabel(status: string): string {
  return status.toLowerCase();
}

export function ActivityScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [segment, setSegment] = useState<"transactions" | "requests">("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<{ incoming: PaymentRequest[]; outgoing: PaymentRequest[] }>({ incoming: [], outgoing: [] });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.history().then(setTransactions).catch(() => setTransactions([]));
    api.requests.list().then(setRequests).catch(() => setRequests({ incoming: [], outgoing: [] }));
    api.users().then((list) => setUsers(list as User[])).catch(() => setUsers([]));
  }, []);

  const requestById = (id: string) => users.find((entry) => entry.id === id);

  const payNow = (request: PaymentRequest) => {
    const beneficiary = requestById(request.requesterId);
    const parentNavigation = navigation.getParent() as any;
    parentNavigation?.navigate("Payment", {
      beneficiaryId: beneficiary?.id,
      beneficiaryName: beneficiary?.displayName,
      amount: request.amount,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.tabContent}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t("history.title")}</Text>
          <LanguagePicker />
        </View>
        <Text style={styles.headerSubtitle}>Transactions and requests in one timeline.</Text>
      </View>

      <View style={styles.sectionToggleRow}>
        <Pressable
          style={[styles.sectionToggle, segment === "transactions" && styles.sectionToggleActive]}
          onPress={() => setSegment("transactions")}
        >
          <Text style={[styles.sectionToggleText, segment === "transactions" && styles.sectionToggleTextActive]}>Transactions</Text>
        </Pressable>
        <Pressable
          style={[styles.sectionToggle, segment === "requests" && styles.sectionToggleActive]}
          onPress={() => setSegment("requests")}
        >
          <Text style={[styles.sectionToggleText, segment === "requests" && styles.sectionToggleTextActive]}>Requests</Text>
        </Pressable>
      </View>

      {segment === "transactions" ? (
        <View>
          {transactions.length === 0 ? (
            <View style={styles.tabCard}>
              <Text style={styles.listItemSubtitle}>{t("history.empty")}</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.tabCard}>
                <View style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemTitle}>{tx.direction}</Text>
                    <Text style={styles.listItemSubtitle}>{new Date(tx.createdAt).toLocaleString()}</Text>
                  </View>
                  <View style={styles.tabPill}>
                    <Text style={styles.tabPillText}>{statusLabel(tx.status)}</Text>
                  </View>
                </View>
                <Text style={styles.listItemTitle}>
                  {tx.assetCode} {tx.debitAmount ?? tx.receiveAmount}
                </Text>
                {tx.description ? <Text style={styles.listItemSubtitle}>{tx.description}</Text> : null}
              </View>
            ))
          )}
        </View>
      ) : (
        <View>
          <Text style={[styles.label, { marginBottom: 10 }]}>Incoming requests</Text>
          {requests.incoming.length === 0 ? (
            <View style={styles.tabCard}>
              <Text style={styles.listItemSubtitle}>No incoming requests.</Text>
            </View>
          ) : (
            requests.incoming.map((request) => {
              const requester = requestById(request.requesterId);
              return (
                <View key={request.id} style={styles.tabCard}>
                  <View style={styles.listItem}>
                    <View>
                      <Text style={styles.listItemTitle}>{requester?.displayName ?? "Unknown requester"}</Text>
                      <Text style={styles.listItemSubtitle}>{request.reason ?? "Payment request"}</Text>
                    </View>
                    <View style={styles.tabPill}>
                      <Text style={styles.tabPillText}>{request.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.listItemTitle}>{request.currency} {request.amount.toFixed(2)}</Text>
                  <Text style={styles.listItemSubtitle}>Requested from you</Text>
                  {request.status === "PENDING" ? (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                      <Pressable style={[styles.sectionToggle, { flex: 1 }]} onPress={() => api.requests.decline(request.id).then(() => setRequests((current) => ({
                        incoming: current.incoming.filter((item) => item.id !== request.id),
                        outgoing: current.outgoing,
                      })))}>
                        <Text style={styles.sectionToggleText}>Decline</Text>
                      </Pressable>
                      <Pressable style={[styles.sectionToggle, { flex: 1, backgroundColor: colors.secondary, borderColor: colors.accent }]} onPress={() => payNow(request)}>
                        <Text style={[styles.sectionToggleText, styles.sectionToggleTextActive]}>Pay Now</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}

          <Text style={[styles.label, { marginTop: 8, marginBottom: 10 }]}>Outgoing requests</Text>
          {requests.outgoing.length === 0 ? (
            <View style={styles.tabCard}>
              <Text style={styles.listItemSubtitle}>No outgoing requests.</Text>
            </View>
          ) : (
            requests.outgoing.map((request) => (
              <View key={request.id} style={styles.tabCard}>
                <View style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemTitle}>{request.reason ?? "Outgoing request"}</Text>
                    <Text style={styles.listItemSubtitle}>{request.reason ?? "Outgoing request"}</Text>
                  </View>
                  <View style={styles.tabPill}>
                    <Text style={styles.tabPillText}>{request.status}</Text>
                  </View>
                </View>
                <Text style={styles.listItemTitle}>{request.currency} {request.amount.toFixed(2)}</Text>
                {request.status === "PENDING" ? (
                  <Pressable style={[styles.secondaryButton, { marginTop: 12 }]} onPress={() => api.requests.cancel(request.id).then(() => setRequests((current) => ({
                    incoming: current.incoming,
                    outgoing: current.outgoing.filter((item) => item.id !== request.id),
                  })))}>
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}
