import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { createStyles } from "../theme/styles";

export function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [email, setEmail] = useState("nomzamo@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const onLogin = async () => {
    try {
      setError("");
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  };

  return (
    <ScrollView
      testID="login-screen"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
      style={styles.screen}
    >
      <LanguagePicker />
      <View style={styles.card}>
        <Text style={[styles.headerTitle, { color: colors.primary, marginBottom: 8 }]}>
          {t("common.appName")}
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 20 }}>
          Cross-border remittance powered by Interledger
        </Text>

        {error ? (
          <Text testID="login-error" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <TextInput
          testID="login-email"
          style={styles.input}
          placeholder={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          testID="login-password"
          style={styles.input}
          placeholder={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable testID="login-submit" style={styles.primaryButton} onPress={onLogin}>
          <Text style={styles.primaryButtonText}>{t("auth.login")}</Text>
        </Pressable>
      </View>

      <Text style={{ color: colors.textMuted, marginTop: 12, textAlign: "center" }}>
        Demo login: nomzamo@example.com / password123
      </Text>
    </ScrollView>
  );
}
