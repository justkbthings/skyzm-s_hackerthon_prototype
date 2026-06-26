import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "../context/ThemeContext";
import { createStyles } from "../theme/styles";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "xh", label: "XH" },
  { code: "sw", label: "SW" },
] as const;

export function LanguagePicker() {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    SecureStore.getItemAsync("openremit-language")
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
            style={[styles.langChip, active && styles.langChipActive]}
            onPress={async () => {
              await i18n.changeLanguage(lang.code);
              await SecureStore.setItemAsync("openremit-language", lang.code);
            }}
          >
            <Text
              style={[styles.langChipText, active && styles.langChipTextActive]}
            >
              {lang.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
