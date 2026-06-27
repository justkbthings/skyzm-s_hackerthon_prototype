export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  Home: undefined;
  Payments: undefined;
  Community: undefined;
  Activity: undefined;
  Profile: undefined;
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

export type MainTabParamList = {
  Home: undefined;
  Payments: undefined;
  Community: undefined;
  Activity: undefined;
  Profile: undefined;
};
