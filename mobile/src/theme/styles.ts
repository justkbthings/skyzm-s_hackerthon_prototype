import { StyleSheet } from "react-native";
import type { AppColors } from "./colors";

export function createStyles(colors: AppColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTitle: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "700",
    },
    headerSubtitle: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 16,
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    balanceLabel: {
      color: colors.textMuted,
      fontSize: 14,
      marginBottom: 4,
    },
    balanceAmount: {
      color: colors.primary,
      fontSize: 36,
      fontWeight: "800",
    },
    actionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      width: "47%",
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.secondary,
    },
    actionIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    actionLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      textAlign: "center",
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "700",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 6,
    },
    listItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    listItemSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    languageRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
      marginBottom: 8,
    },
    langChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    langChipActive: {
      backgroundColor: "#FFFFFF",
    },
    langChipText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },
    langChipTextActive: {
      color: colors.primary,
    },
    errorText: {
      color: colors.danger,
      marginBottom: 8,
    },
  });
}
