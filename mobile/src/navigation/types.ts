import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Payments: undefined;
  Community: undefined;
  Activity: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Payment:
    | {
        beneficiaryId?: string;
        beneficiaryName?: string;
        amount?: number;
      }
    | undefined;
  Deposit: undefined;
  Withdraw: undefined;
  Request: undefined;
  PaymentStatus: { transactionId: string };
};
