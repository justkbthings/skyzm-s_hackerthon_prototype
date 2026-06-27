import React from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { LanguagePicker } from "./LanguagePicker";
import { ThumelaWordmark } from "./ThumelaWordmark";
import { AppIcon } from "./AppIcon";
import { createStyles } from "../theme/styles";
import { goToHome } from "../navigation/goHome";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showHome?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  showHome = true,
}: ScreenHeaderProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        {showHome ? (
          <Pressable
            testID="home-button"
            style={styles.homeButton}
            onPress={() => goToHome(navigation)}
          >
            <AppIcon name="home" size={14} color={colors.primary} />
            <Text style={styles.homeButtonText}> {t("common.home")}</Text>
          </Pressable>
        ) : (
          <ThumelaWordmark size="sm" showDots={false} />
        )}
        <LanguagePicker variant="light" />
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
