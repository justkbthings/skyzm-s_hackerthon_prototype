import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PaymentScreen } from "../screens/PaymentScreen";
import { DepositScreen } from "../screens/DepositScreen";
import { WithdrawScreen } from "../screens/WithdrawScreen";
import { RequestScreen } from "../screens/RequestScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { PaymentStatusScreen } from "../screens/HistoryScreen";
import { PaymentsScreen } from "../screens/PaymentsScreen";
import { ActivityScreen } from "../screens/ActivityScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MainTabParamList, RootStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<{ Login: undefined }>();
const MainStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function tabIcon(icon: string, focused: boolean, colors: ReturnType<typeof useTheme>["colors"]) {
  return (
    <View
      style={{
        width: 40,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.secondary : "transparent",
      }}
    >
      <Text style={{ fontSize: 18, color: focused ? colors.accent : colors.textMuted }}>{icon}</Text>
    </View>
  );
}

function MainTabsNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#0D1F4E",
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        children={(props) => <HomeScreen {...(props as any)} />}
        options={{ tabBarIcon: ({ focused }) => tabIcon("⌂", focused, colors) }}
      />
      <Tab.Screen
        name="Payments"
        children={(props) => <PaymentsScreen {...(props as any)} />}
        options={{ tabBarIcon: ({ focused }) => tabIcon("↗", focused, colors) }}
      />
      <Tab.Screen
        name="Community"
        children={(props) => <CommunityScreen {...(props as any)} />}
        options={{ tabBarIcon: ({ focused }) => tabIcon("◌", focused, colors) }}
      />
      <Tab.Screen
        name="Activity"
        children={(props) => <ActivityScreen {...(props as any)} />}
        options={{ tabBarIcon: ({ focused }) => tabIcon("◷", focused, colors) }}
      />
      <Tab.Screen
        name="Profile"
        children={(props) => <ProfileScreen {...(props as any)} />}
        options={{ tabBarIcon: ({ focused }) => tabIcon("◍", focused, colors) }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F4F6FA" },
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <MainStack.Screen name="Payment" component={PaymentScreen} options={{ presentation: "modal" }} />
      <MainStack.Screen name="Deposit" component={DepositScreen} />
      <MainStack.Screen name="Withdraw" component={WithdrawScreen} />
      <MainStack.Screen name="Request" component={RequestScreen} />
      <MainStack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
