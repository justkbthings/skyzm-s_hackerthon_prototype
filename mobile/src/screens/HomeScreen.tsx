import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { CurrencyBadge } from "../components/CurrencyBadge";
import { AppIcon } from "../components/AppIcon";
import { ThumelaWordmark } from "../components/ThumelaWordmark";
import { ThumelaButton } from "../components/ThumelaButton";
import { ThumelaCard } from "../components/ThumelaCard";
import { ThumelaPathCard } from "../components/ThumelaPathCard";
import { BrandDots } from "../components/BrandDots";
import { createStyles } from "../theme/styles";
import { api, formatMoney, Transaction } from "../services/api";
import { MainTabParamList } from "../navigation/types";

type Props = BottomTabScreenProps<MainTabParamList, "Home">;

const CITY_BY_COUNTRY: Record<string, string> = {
  ZA: "Cape Town",
  KE: "Nairobi",
  GB: "London",
  US: "New York",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activityLabel(tx: Transaction): string {
  const detail = tx.description?.trim();
  switch (tx.direction) {
    case "received":
      return detail ? `Received · ${detail}` : "Received";
    case "sent":
      return detail ? `Sent · ${detail}` : "Sent payment";
    case "deposit":
      return detail ?? "Deposit";
    case "withdrawal":
      return detail ?? "Withdrawal";
    default:
      return detail ?? tx.direction;
  }
}

function activityIcon(tx: Transaction): React.ComponentProps<typeof AppIcon>["name"] {
  switch (tx.direction) {
    case "received":
      return "arrow-down-left";
    case "sent":
      return "arrow-up-right";
    case "deposit":
      return "arrow-down";
    case "withdrawal":
      return "arrow-up";
    default:
      return "activity";
  }
}

function formatTxAmount(tx: Transaction): string {
  const raw = tx.debitAmount ?? tx.receiveAmount ?? "0";
  return formatMoney(raw, tx.assetCode);
}

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const [currency, setCurrency] = useState(user?.currency ?? "ZAR");
  const [recent, setRecent] = useState<Transaction[]>([]);
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(12)).current;

  const parentNavigation = navigation.getParent();

  const openModal = (route: "Payment" | "Deposit" | "Withdraw" | "Request") => {
    parentNavigation?.navigate(route as never);
  };

  useEffect(() => {
    api.balance().then((b) => {
      setBalance(b.balance);
      setCurrency(b.currency);
    });
    api.history()
      .then((items) => setRecent(items.slice(0, 3)))
      .catch(() => setRecent([]));
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(cardTranslate, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [cardOpacity, cardTranslate]);

  const fromCity = CITY_BY_COUNTRY[user?.country ?? "ZA"] ?? "Cape Town";
  const displayName = user?.displayName ?? "Nomzamo";

  const quickActions = [
    {
      key: "Payment",
      label: "Send money home",
      icon: "send" as const,
      wide: true,
      onPress: () => openModal("Payment"),
    },
    {
      key: "Request",
      label: "Request support",
      icon: "dollar-sign" as const,
      onPress: () => openModal("Request"),
    },
    {
      key: "Deposit",
      label: t("home.deposit"),
      icon: "arrow-down" as const,
      onPress: () => openModal("Deposit"),
    },
    {
      key: "Withdraw",
      label: t("home.withdraw"),
      icon: "arrow-up" as const,
      onPress: () => openModal("Withdraw"),
    },
    {
      key: "Community",
      label: t("home.community"),
      icon: "users" as const,
      onPress: () => navigation.navigate("Community"),
    },
    {
      key: "History",
      label: "Activity",
      icon: "clock" as const,
      onPress: () => navigation.navigate("Activity"),
    },
  ];

  return (
    <ScrollView
      testID="home-screen"
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.homeHeaderCompact}>
        <View style={styles.homeHeaderTop}>
          <ThumelaWordmark size="md" />
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <LanguagePicker variant="light" />
            <Pressable testID="logout-button" onPress={logout} style={styles.logoutLink}>
              <Text style={styles.logoutLinkText}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {user ? (
          <View style={{ marginTop: 12 }}>
            <CurrencyBadge user={user} onPress={() => navigation.navigate("Profile")} />
          </View>
        ) : null}

        <Text testID="home-greeting" style={[styles.homeGreeting, { marginTop: 14 }]}>
          {t("home.greeting", { name: user?.displayName ?? "" })}
        </Text>
        <Text style={styles.homeRouteLine}>
          {fromCity} 🇿🇦 → Bulawayo 🇿🇼
        </Text>
        <Text style={styles.homeTagline}>Money moves differently.</Text>
      </View>

      <View style={styles.contentShell}>
        <Animated.View
          style={{
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          }}
        >
          <ThumelaCard accent="purple" showDots style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>{t("common.balance")}</Text>
            <Text testID="home-balance" style={styles.balanceAmount}>
              {formatMoney(balance, currency)}
            </Text>
            <View style={styles.walletStatusRow}>
              <View style={styles.walletStatusDot} />
              <Text style={styles.walletStatusText}>Live test wallet</Text>
            </View>
            <Text style={styles.savingsStat}>Saved about R82 this month</Text>
          </ThumelaCard>
        </Animated.View>

        <ThumelaButton
          testID="home-action-payment"
          label="Send money"
          icon="send"
          onPress={() => openModal("Payment")}
        />

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.key}
              testID={`home-action-${action.key.toLowerCase()}`}
              style={({ pressed }) => [
                styles.quickActionTile,
                action.wide && styles.quickActionTileWide,
                pressed && { opacity: 0.88, backgroundColor: colors.surfacePurple },
              ]}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIconWrap}>
                <AppIcon name={action.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => navigation.navigate("Activity")}>
            <Text style={styles.sectionLink}>View all</Text>
          </Pressable>
        </View>

        <ThumelaCard>
          {recent.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <BrandDots size={6} gap={5} pulse />
              <Text style={[styles.listItemTitle, { marginTop: 12 }]}>
                No transfers yet
              </Text>
              <Text style={[styles.listItemSubtitle, { textAlign: "center", marginTop: 4 }]}>
                When {displayName} sends or receives money, it will appear here.
              </Text>
            </View>
          ) : (
            recent.map((tx, index) => {
              const isIncoming = tx.direction === "received" || tx.direction === "deposit";
              return (
                <View
                  key={tx.id}
                  style={[
                    styles.activityRow,
                    index === recent.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.quickActionIconWrap}>
                    <AppIcon name={activityIcon(tx)} size={16} color={colors.primary} />
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityTitle}>{activityLabel(tx)}</Text>
                    <Text style={styles.activityMeta}>
                      {formatRelativeDate(tx.createdAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.activityAmount,
                      isIncoming && styles.activityAmountPositive,
                    ]}
                  >
                    {isIncoming ? "+" : "−"}
                    {formatTxAmount(tx)}
                  </Text>
                </View>
              );
            })
          )}
        </ThumelaCard>

        <ThumelaPathCard
          fromCity={fromCity}
          fromFlag="🇿🇦"
          toCity="Bulawayo"
          toFlag="🇿🇼"
          currency={currency}
          feeMinor="1400"
          traditionalMinor="9600"
        />
      </View>
    </ScrollView>
  );
}
