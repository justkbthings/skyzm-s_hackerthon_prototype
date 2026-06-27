import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { AppIcon } from "../components/AppIcon";
import { createStyles } from "../theme/styles";
import { api, formatMoney, Transaction } from "../services/api";
import { RootStackParamList } from "../navigation/types";
import { goToHome } from "../navigation/goHome";

function ReceiptRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text
        style={[styles.receiptValue, muted && { color: colors.textMuted }]}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

function formatTxAmount(
  amount: string | undefined,
  assetCode: string,
  assetScale = 2
): string | null {
  if (amount == null || amount === "") return null;
  return formatMoney(amount, assetCode, assetScale);
}

function formatStatus(status: string | undefined): string {
  if (!status) return "Not available";
  return status.replace(/_/g, " ");
}

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
      <ScreenHeader title={t("history.title")} />

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

export function PaymentStatusScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "PaymentStatus">) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const id = route.params.transactionId;
    let interval: ReturnType<typeof setInterval> | undefined;

    const refresh = () => {
      api.payments.status(id).then((next) => {
        setTx(next);
        if (next.status === "COMPLETED" || next.status === "FAILED") {
          if (interval) clearInterval(interval);
        }
      });
    };

    refresh();
    interval = setInterval(refresh, 2000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [route.params.transactionId]);

  const isComplete = tx?.status === "COMPLETED";
  const isFailed = tx?.status === "FAILED";
  const scale = tx?.assetScale ?? 2;
  const receiveScale = tx?.receiveAssetScale ?? scale;
  const amountSent = formatTxAmount(tx?.debitAmount, tx?.assetCode ?? "", scale);
  const amountReceived = tx?.receiveAssetCode
    ? formatTxAmount(tx?.receiveAmount, tx.receiveAssetCode, receiveScale)
    : formatTxAmount(tx?.receiveAmount, tx?.assetCode ?? "", scale);
  const senderWallet =
    tx?.senderWalletAddress ?? user?.ilpWalletAddress ?? user?.walletAddress;
  const receiverWallet = tx?.receiverWalletAddress;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader title={t("payment.statusTitle")} />
      <View style={styles.contentShell}>
        {isComplete ? (
          <>
            <View style={styles.successHeader}>
              <View style={styles.successIconWrap}>
                <AppIcon name="check-circle" size={28} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Payment successful</Text>
              <Text style={styles.successSubtitle}>Your money has been sent.</Text>
            </View>

            <View style={styles.receiptCard}>
              <Text style={styles.receiptHeading}>Transaction summary</Text>

              {amountSent ? (
                <ReceiptRow label="Amount sent" value={amountSent} />
              ) : null}
              {tx?.assetCode ? (
                <ReceiptRow label="Currency" value={tx.assetCode} />
              ) : null}
              {amountReceived && amountReceived !== amountSent ? (
                <ReceiptRow label="Amount received" value={amountReceived} />
              ) : null}
              {tx?.beneficiaryName ? (
                <ReceiptRow label="Receiver name" value={tx.beneficiaryName} />
              ) : null}
              <ReceiptRow
                label="Receiver wallet address"
                value={receiverWallet ?? "Not available"}
                muted={!receiverWallet}
              />
              <ReceiptRow
                label="Sender wallet address"
                value={senderWallet ?? "Not available"}
                muted={!senderWallet}
              />
              <ReceiptRow label="Transaction ID" value={tx?.id ?? route.params.transactionId} />
              <ReceiptRow
                label="Date / time"
                value={
                  tx?.createdAt
                    ? new Date(tx.createdAt).toLocaleString()
                    : "Not available"
                }
                muted={!tx?.createdAt}
              />
              <ReceiptRow label="Status" value={formatStatus(tx?.status)} />
              {tx?.description ? (
                <ReceiptRow label="Description / reference" value={tx.description} />
              ) : null}
            </View>

            <Pressable style={styles.primaryButton} onPress={() => goToHome(navigation)}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </>
        ) : isFailed ? (
          <>
            <View style={styles.successHeader}>
              <View style={[styles.successIconWrap, { backgroundColor: "#FEE4E2" }]}>
                <AppIcon name="x-circle" size={28} color={colors.danger} />
              </View>
              <Text style={styles.successTitle}>{t("payment.statusFailed")}</Text>
              {tx?.errorMessage ? (
                <Text style={styles.successSubtitle}>{tx.errorMessage}</Text>
              ) : null}
            </View>

            {tx ? (
              <View style={styles.receiptCard}>
                <Text style={styles.receiptHeading}>Transaction summary</Text>
                <ReceiptRow label="Transaction ID" value={tx.id} />
                <ReceiptRow label="Status" value={formatStatus(tx.status)} />
                {tx.beneficiaryName ? (
                  <ReceiptRow label="Receiver name" value={tx.beneficiaryName} />
                ) : null}
              </View>
            ) : null}

            <Pressable style={styles.primaryButton} onPress={() => goToHome(navigation)}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.receiptCard}>
            <Text style={styles.listItemTitle}>
              {tx?.status ?? t("common.loading")}
            </Text>
            <Text style={styles.listItemSubtitle}>Confirming your payment…</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
