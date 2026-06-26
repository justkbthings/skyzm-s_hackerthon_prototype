import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PaymentScreen } from "../screens/PaymentScreen";
import { DepositScreen } from "../screens/DepositScreen";
import { WithdrawScreen } from "../screens/WithdrawScreen";
import { RequestScreen } from "../screens/RequestScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { HistoryScreen, PaymentStatusScreen } from "../screens/HistoryScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Deposit" component={DepositScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="Request" component={RequestScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
