import React, { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { createStyles } from "../theme/styles";

export const ILP_SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  { code: "EUR", symbol: "€", flag: "🇪🇺", name: "Euro" },
  { code: "GBP", symbol: "£", flag: "🇬🇧", name: "British Pound" },
  { code: "ZAR", symbol: "R", flag: "🇿🇦", name: "South African Rand" },
  { code: "KES", symbol: "KSh", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "MXN", symbol: "$", flag: "🇲🇽", name: "Mexican Peso" },
  { code: "CAD", symbol: "CA$", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "SEK", symbol: "kr", flag: "🇸🇪", name: "Swedish Krona" },
  { code: "NGN", symbol: "₦", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "XOF", symbol: "Fr", flag: "🌍", name: "West African Franc" },
] as const;

type CurrencyCode = (typeof ILP_SUPPORTED_CURRENCIES)[number]["code"];

interface Props {
  visible: boolean;
  value: CurrencyCode;
  onSelect: (currency: CurrencyCode) => void;
  onClose: () => void;
  title?: string;
}

export function CurrencyPicker({ visible, value, onSelect, onClose, title = "Select currency" }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ILP_SUPPORTED_CURRENCIES;
    return ILP_SUPPORTED_CURRENCIES.filter((item) =>
      `${item.code} ${item.name} ${item.symbol}`.toLowerCase().includes(needle)
    );
  }, [query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(5,14,36,0.45)" }} onPress={onClose}>
        <Pressable style={[styles.card, { margin: 16, maxHeight: 420 }]} onPress={() => undefined}>
          <Text style={styles.label}>{title}</Text>
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Search currencies"
            value={query}
            onChangeText={setQuery}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => {
              const selected = item.code === value;
              return (
                <Pressable
                  style={[
                    styles.listItem,
                    { marginTop: 10, backgroundColor: selected ? colors.secondary : colors.surface },
                  ]}
                  onPress={() => {
                    onSelect(item.code);
                    onClose();
                  }}
                >
                  <Text style={styles.listItemTitle}>
                    {item.flag} {item.code}
                  </Text>
                  <Text style={styles.listItemSubtitle}>{item.name}</Text>
                  <Text style={styles.listItemSubtitle}>{selected ? "Selected" : item.symbol}</Text>
                </Pressable>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}