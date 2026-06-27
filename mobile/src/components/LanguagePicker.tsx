import React, { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { createStyles } from "../theme/styles";

const browserStorage = globalThis as unknown as {
  localStorage?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
  };
};

const languageStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === "web") {
      return browserStorage.localStorage?.getItem(key) ?? null;
    }

    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") {
      browserStorage.localStorage?.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
};

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "xh", label: "XH" },
  { code: "sw", label: "SW" },
] as const;

interface LanguagePickerProps {
  variant?: "dark" | "light";
}

export function LanguagePicker({ variant = "dark" }: LanguagePickerProps) {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isLight = variant === "light";

  useEffect(() => {
    languageStorage
      .getItem("openremit-language")
      .then((stored) => {
        if (stored && stored !== i18n.language) {
          return i18n.changeLanguage(stored);
        }
      })
      .catch(() => undefined);
  }, [i18n]);

  return (
    <View style={styles.languageRow}>
      {LANGUAGES.map((lang) => {
        const active = i18n.language === lang.code;
        return (
          <Pressable
            key={lang.code}
            style={[
              styles.langChip,
              isLight && styles.langChipLight,
              active && (isLight ? styles.langChipActiveLight : styles.langChipActive),
            ]}
            onPress={async () => {
              await i18n.changeLanguage(lang.code);
              await languageStorage.setItem("openremit-language", lang.code);
            }}
          >
            <Text
              style={[
                styles.langChipText,
                isLight && styles.langChipTextLight,
                active && styles.langChipTextActive,
              ]}
            >
              {lang.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
