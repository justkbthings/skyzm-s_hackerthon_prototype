import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ScreenHeader } from "../components/ScreenHeader";
import { CurrencyPicker, ILP_SUPPORTED_CURRENCIES } from "../components/CurrencyPicker";
import { createStyles } from "../theme/styles";
import { api, Beneficiary, formatMoney } from "../services/api";
import { RootStackParamList } from "../navigation/types";
import { openAuthorizationUrl } from "../utils/openAuthorizationUrl";

type CurrencyCode = (typeof ILP_SUPPORTED_CURRENCIES)[number]["code"];

type Props = NativeStackScreenProps<RootStackParamList, "Payment">;

export function PaymentScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [step, setStep] = useState<"select" | "type" | "quote" | "send">("select");
  const [paymentMode, setPaymentMode] = useState<"ONE_TIME" | "RECURRING">("ONE_TIME");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [expiryDate, setExpiryDate] = useState("2026-12-31");
  const [interval, setInterval] = useState("P1M");
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof api.payments.quote>> | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [newCurrency, setNewCurrency] = useState<CurrencyCode>("ZAR");
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!route.params) return;
    if (route.params.amount != null) {
      setAmount(String(route.params.amount));
    }
  }, [route.params]);

  React.useEffect(() => {
    api.beneficiaries.list().then(setBeneficiaries).catch(() => setBeneficiaries([]));
  }, []);

  useEffect(() => {
    if (!route.params?.beneficiaryId) return;
    const match = beneficiaries.find((item) => item.id === route.params?.beneficiaryId || item.name === route.params?.beneficiaryName);
    if (match) {
      setSelected(match);
      setStep("type");
    }
  }, [beneficiaries, route.params]);

  const addBeneficiary = async () => {
    try {
      const b = await api.beneficiaries.create(newName, newWallet, undefined, newCurrency);
      setBeneficiaries((prev) => [...prev, b]);
      setNewName("");
      setNewWallet("");
      setNewCurrency((user?.accountCurrency ?? user?.currency ?? "ZAR") as CurrencyCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  };

  const generateQuote = async () => {
    if (!selected || !amount) return;
    try {
      setError("");
      const result = await api.payments.quote({
        receiverWalletAddress: selected.walletAddress,
        amount: String(Math.round(Number(amount) * 100)),
        beneficiaryId: selected.id,
        beneficiaryName: selected.name,
        paymentMode,
        recurring:
          paymentMode === "RECURRING"
            ? { interval, startDate, expiryDate, amount: String(Math.round(Number(amount) * 100)) }
            : undefined,
      });
      setQuote(result);
      setTransactionId(result.transactionId);
      setStep("quote");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  };

  const authorize = async () => {
    if (!transactionId) return;

    let authWindow: Window | null = null;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      authWindow = window.open("about:blank", "_blank");
    }

    try {
      setError("");
      const { interactUrl } = await api.payments.consent(
        transactionId,
        Platform.OS === "web" ? "web" : "native"
      );
      await openAuthorizationUrl(interactUrl, authWindow);
      navigation.navigate("PaymentStatus", { transactionId });
    } catch (e) {
      authWindow?.close();
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  };

  const sendWhatsApp = async () => {
    if (!selected || !amount) return;
    try {
      await api.payments.whatsapp({
        phone: "+27821234567",
        beneficiaryName: selected.name,
        amount,
        transactionId,
      });
      Alert.alert(t("common.success"), t("payment.whatsapp"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <ScreenHeader
        title={t("payment.title")}
        subtitle={`You are sending from your ${user?.accountCurrency ?? user?.currency ?? "ZAR"} wallet.`}
      />

      <View style={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {step === "select" && (
          <>
            <Text style={styles.label}>{t("payment.beneficiaries")}</Text>
            {beneficiaries.map((b) => (
              <Pressable
                key={b.id}
                style={styles.listItem}
                onPress={() => {
                  setSelected(b);
                  setStep("type");
                }}
              >
                <View>
                  <Text style={styles.listItemTitle}>{b.name}</Text>
                  <Text style={styles.listItemSubtitle}>{b.walletAddress}</Text>
                </View>
              </Pressable>
            ))}

            <Text style={[styles.label, { marginTop: 16 }]}>
              {t("payment.addBeneficiary")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("payment.name")}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder={t("payment.walletAddress")}
              value={newWallet}
              onChangeText={setNewWallet}
              autoCapitalize="none"
            />
            <Pressable style={styles.listItem} onPress={() => setCurrencyPickerOpen(true)}>
              <View>
                <Text style={styles.listItemTitle}>Beneficiary currency</Text>
                <Text style={styles.listItemSubtitle}>{newCurrency}</Text>
              </View>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={addBeneficiary}>
              <Text style={styles.secondaryButtonText}>{t("payment.addBeneficiary")}</Text>
            </Pressable>
          </>
        )}

        {step === "type" && selected && (
          <>
            <Text style={styles.listItemTitle}>{selected.name}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("common.amount")}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Pressable
              style={styles.listItem}
              onPress={() => setPaymentMode("ONE_TIME")}
            >
              <Text style={styles.listItemTitle}>
                {paymentMode === "ONE_TIME" ? "● " : "○ "}
                {t("payment.oneTime")}
              </Text>
            </Pressable>
            <Pressable
              style={styles.listItem}
              onPress={() => setPaymentMode("RECURRING")}
            >
              <Text style={styles.listItemTitle}>
                {paymentMode === "RECURRING" ? "● " : "○ "}
                {t("payment.recurring")}
              </Text>
            </Pressable>
            {paymentMode === "RECURRING" && (
              <>
                <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder={t("payment.startDate")} />
                <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder={t("payment.expiryDate")} />
                <TextInput style={styles.input} value={interval} onChangeText={setInterval} placeholder={t("payment.interval")} />
              </>
            )}
            <Pressable style={styles.primaryButton} onPress={generateQuote}>
              <Text style={styles.primaryButtonText}>{t("payment.quote")}</Text>
            </Pressable>
          </>
        )}

        {step === "quote" && quote && (
          <View style={styles.card}>
            <Text style={styles.label}>{t("payment.quote")}</Text>
            <Text style={styles.listItemTitle}>
              {t("payment.youSend")}:{" "}
              {formatMoney(
                quote.quote.debitAmount.value,
                quote.quote.debitAmount.assetCode,
                quote.quote.debitAmount.assetScale
              )}
            </Text>
            <Text style={styles.listItemSubtitle}>
              {t("payment.theyReceive")}:{" "}
              {formatMoney(
                quote.quote.receiveAmount.value,
                quote.quote.receiveAmount.assetCode,
                quote.quote.receiveAmount.assetScale
              )}
            </Text>
            <Pressable style={styles.primaryButton} onPress={authorize}>
              <Text style={styles.primaryButtonText}>{t("payment.authorize")}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={sendWhatsApp}>
              <Text style={styles.secondaryButtonText}>{t("payment.whatsapp")}</Text>
            </Pressable>
          </View>
        )}
      </View>

      <CurrencyPicker
        visible={currencyPickerOpen}
        value={newCurrency}
        onSelect={(currency) => setNewCurrency(currency)}
        onClose={() => setCurrencyPickerOpen(false)}
        title="Choose beneficiary currency"
      />
    </ScrollView>
  );
}
