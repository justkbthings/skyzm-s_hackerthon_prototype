export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  phone?: string;
  country: string;
  currency: string;
  walletAddress?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  fcmToken?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | "PENDING"
  | "AWAITING_GRANT"
  | "COMPLETED"
  | "FAILED";

export type PaymentType = "ONE_TIME" | "RECURRING" | "COMMUNITY_CONTRIBUTION";

export interface Transaction {
  id: string;
  userId: string;
  status: TransactionStatus;
  paymentType: PaymentType;
  direction: "sent" | "received" | "deposit" | "withdrawal";
  senderWalletAddress?: string;
  receiverWalletAddress?: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  debitAmount?: string;
  receiveAmount?: string;
  assetCode: string;
  assetScale: number;
  receiveAssetCode?: string;
  receiveAssetScale?: number;
  incomingPaymentUrl?: string;
  quoteUrl?: string;
  quoteExpiresAt?: string;
  outgoingPaymentUrl?: string;
  grantContinueUri?: string;
  grantContinueToken?: string;
  grantInteractNonce?: string;
  recurring?: RecurringConfig;
  communityRequestId?: string;
  paymentRequestId?: string;
  description?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringConfig {
  interval: string;
  startDate: string;
  expiryDate: string;
  amount: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  walletAddress: string;
  country?: string;
  createdAt: string;
}

export type PaymentRequestStatus = "PENDING" | "APPROVED" | "DECLINED" | "CANCELLED" | "COMPLETED";

export interface PaymentRequest {
  id: string;
  requesterId: string;
  payerId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: PaymentRequestStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CommunityMemberStatus = "PENDING" | "APPROVED" | "DENIED";

export interface Community {
  id: string;
  name: string;
  creatorId: string;
  memberIds: string[];
  pendingMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CommunityRequestStatus = "OPEN" | "CLOSED" | "FULFILLED";

export interface CommunityRequest {
  id: string;
  communityId: string;
  creatorId: string;
  title: string;
  targetAmount: number;
  currency: string;
  raisedAmount: number;
  expiryDate: string;
  status: CommunityRequestStatus;
  contributions: CommunityContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityContribution {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  transactionId?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "payment_request" | "community" | "payment" | "general";
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface DepositProvider {
  id: string;
  name: string;
  country: string;
}

export const DEPOSIT_PROVIDERS: DepositProvider[] = [
  { id: "fnb", name: "FNB", country: "ZA" },
  { id: "standard-za", name: "Standard Bank", country: "ZA" },
  { id: "capitec", name: "Capitec", country: "ZA" },
  { id: "mpesa", name: "M-Pesa", country: "KE" },
  { id: "kcb", name: "KCB", country: "KE" },
  { id: "standard-ke", name: "Standard Chartered", country: "KE" },
  { id: "hsbc", name: "HSBC", country: "GB" },
  { id: "barclays", name: "Barclays", country: "GB" },
  { id: "natwest", name: "NatWest", country: "GB" },
  { id: "boa", name: "Bank of America", country: "US" },
  { id: "wells-fargo", name: "Wells Fargo", country: "US" },
  { id: "citi", name: "Citi", country: "US" },
];

export const COUNTRY_CURRENCIES: Record<string, string> = {
  ZA: "ZAR",
  KE: "KES",
  GB: "GBP",
  US: "USD",
};
