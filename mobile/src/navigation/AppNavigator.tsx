import React, { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { usePaymentReturnHandler } from "../hooks/usePaymentReturnHandler";
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
import { ThumelaTabBar } from "./ThumelaTabBar";
import { MainTabParamList, RootStackParamList } from "./types";

const AuthStack = createNativeStackNavigator<{ Login: undefined }>();
const MainStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function LoadingScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
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

function SendTabPlaceholder() {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <ThumelaTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen
        name="Payments"
        component={SendTabPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate("Payment" as never);
          },
        })}
      />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();

  return (
    <MainStack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <MainStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ presentation: "modal" }}
      />
      <MainStack.Screen name="Deposit" component={DepositScreen} />
      <MainStack.Screen name="Withdraw" component={WithdrawScreen} />
      <MainStack.Screen name="Request" component={RequestScreen} />
      <MainStack.Screen name="PaymentStatus" component={PaymentStatusScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  usePaymentReturnHandler(navigationRef, Boolean(user));

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
