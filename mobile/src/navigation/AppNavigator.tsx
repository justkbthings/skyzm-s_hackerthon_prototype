import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PaymentScreen } from "../screens/PaymentScreen";
import { DepositScreen } from "../screens/DepositScreen";
import { WithdrawScreen } from "../screens/WithdrawScreen";
import { RequestScreen } from "../screens/RequestScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { HistoryScreen, PaymentStatusScreen } from "../screens/HistoryScreen";
import { RootStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<{ Login: undefined }>();
const MainStack = createNativeStackNavigator<RootStackParamList>();

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

function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F4F6FA" },
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Payment" component={PaymentScreen} />
      <MainStack.Screen name="Deposit" component={DepositScreen} />
      <MainStack.Screen name="Withdraw" component={WithdrawScreen} />
      <MainStack.Screen name="Request" component={RequestScreen} />
      <MainStack.Screen name="Community" component={CommunityScreen} />
      <MainStack.Screen name="History" component={HistoryScreen} />
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
