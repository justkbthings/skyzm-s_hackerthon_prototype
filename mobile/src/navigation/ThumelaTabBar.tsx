import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "../context/ThemeContext";
import { BottomNavSendButton } from "../components/BottomNavSendButton";
import { brand } from "../theme/brand";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentProps<typeof Feather>["name"] }
> = {
  Home: { label: "Home", icon: "home" },
  Activity: { label: "Activity", icon: "clock" },
  Payments: { label: "Send", icon: "send" },
  Community: { label: "Community", icon: "users" },
  Profile: { label: "Profile", icon: "user" },
};

export function ThumelaTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: "circle" as const };

        if (route.name === "Payments") {
          return (
            <BottomNavSendButton
              key={route.key}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) {
                  navigation.getParent()?.navigate("Payment" as never);
                }
              }}
            />
          );
        }

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tab}
          >
            <Feather
              name={config.icon}
              size={20}
              color={focused ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: focused ? colors.primary : colors.textMuted },
                focused && styles.tabLabelFocused,
              ]}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    minHeight: 64,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tabLabelFocused: {
    fontWeight: "700",
  },
});
