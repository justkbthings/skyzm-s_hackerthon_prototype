import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "../components/LanguagePicker";
import { ThumelaWordmark } from "../components/ThumelaWordmark";
import { ThumelaButton } from "../components/ThumelaButton";
import { ThumelaCard } from "../components/ThumelaCard";
import { BrandDots } from "../components/BrandDots";
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
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, maxWidth: 480, alignSelf: "center", width: "100%" }}
      style={styles.screen}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <ThumelaWordmark size="lg" />
        <LanguagePicker variant="light" />
      </View>

      <ThumelaCard accent="purple" showDots>
        <BrandDots size={5} gap={4} style={{ marginBottom: 12 }} />
        <Text style={{ color: colors.textMuted, marginBottom: 20, fontSize: 14 }}>
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

        <ThumelaButton testID="login-submit" label={t("auth.login")} onPress={onLogin} />
      </ThumelaCard>

      <Text style={{ color: colors.textMuted, marginTop: 16, textAlign: "center", fontSize: 13 }}>
        Demo login: nomzamo@example.com / password123
      </Text>
    </ScrollView>
  );
}
