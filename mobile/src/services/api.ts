const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? process.env.API_BASE_URL ?? "http://localhost:3001";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Request failed");
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (body: {
    email: string;
    password: string;
    displayName: string;
    country: string;
    currency: string;
  }) =>
    request<{ token: string; user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<User>("/api/auth/me"),

  balance: () =>
    request<{ balance: number; currency: string; walletAddress?: string }>(
      "/api/wallet/balance"
    ),

  providers: (country: string) =>
    request<{ country: string; currency: string; providers: Provider[] }>(
      `/api/wallet/providers?country=${country}`
    ),

  deposit: (amount: number, providerId: string, country: string) =>
    request<{ message: string; balance: number }>("/api/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amount, providerId, country }),
    }),

  withdraw: (amount: number, providerId: string) =>
    request<{ message: string; balance: number }>("/api/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, providerId }),
    }),

  beneficiaries: {
    list: () => request<Beneficiary[]>("/api/beneficiaries"),
    create: (name: string, walletAddress: string, country?: string) =>
      request<Beneficiary>("/api/beneficiaries", {
        method: "POST",
        body: JSON.stringify({ name, walletAddress, country }),
      }),
    discover: (url: string) =>
      request(`/api/beneficiaries/discover?url=${encodeURIComponent(url)}`),
  },

  payments: {
    quote: (body: Record<string, unknown>) =>
      request<QuoteResponse>("/api/payments/quote", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    send: (body: Record<string, unknown>) =>
      request<QuoteResponse>("/api/payments/send", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    recurring: (body: Record<string, unknown>) =>
      request<QuoteResponse>("/api/payments/recurring", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    consent: (transactionId: string) =>
      request<{ interactUrl: string }>("/api/payments/consent", {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      }),
    status: (id: string) => request<Transaction>(`/api/payments/status/${id}`),
    whatsapp: (body: Record<string, unknown>) =>
      request("/api/payments/whatsapp-instruction", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  requests: {
    list: () =>
      request<{ incoming: PaymentRequest[]; outgoing: PaymentRequest[] }>(
        "/api/requests"
      ),
    create: (body: Record<string, unknown>) =>
      request<PaymentRequest>("/api/requests", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    approve: (id: string) =>
      request(`/api/requests/${id}/approve`, { method: "PATCH" }),
    decline: (id: string) =>
      request(`/api/requests/${id}/decline`, { method: "PATCH" }),
    cancel: (id: string) =>
      request(`/api/requests/${id}/cancel`, { method: "PATCH" }),
  },

  communities: {
    list: () => request<Community[]>("/api/communities"),
    create: (name: string, memberIds?: string[]) =>
      request<Community>("/api/communities", {
        method: "POST",
        body: JSON.stringify({ name, memberIds }),
      }),
    members: (id: string) => request<UserPublic[]>(`/api/communities/${id}/members`),
    requests: (id: string) =>
      request<CommunityRequest[]>(`/api/communities/${id}/requests`),
    createRequest: (id: string, body: Record<string, unknown>) =>
      request(`/api/communities/${id}/requests`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    relatedUsers: () => request<UserPublic[]>("/api/communities/users/related"),
    approveMember: (communityId: string, userId: string) =>
      request(`/api/communities/${communityId}/members/${userId}/approve`, {
        method: "POST",
      }),
  },

  users: () => request<UserPublic[]>("/api/users"),

  history: () => request<Transaction[]>("/api/transactions/history"),

  notifications: () => request<AppNotification[]>("/api/notifications"),
};

export interface User {
  id: string;
  email: string;
  displayName: string;
  country: string;
  currency: string;
  accountCurrency?: string;
  accountCountry?: string;
  accountFlag?: string;
  ilpWalletAddress?: string;
  walletAddress?: string;
  balance: number;
  latitude?: number;
  longitude?: number;
}

export type UserPublic = Omit<User, "email" | "balance">;

export interface Beneficiary {
  id: string;
  name: string;
  walletAddress: string;
  country?: string;
}

export interface Provider {
  id: string;
  name: string;
  country: string;
}

export interface QuoteResponse {
  transactionId: string;
  quote: {
    sendAmount?: { value: string; assetCode: string; assetScale: number };
    debitAmount: { value: string; assetCode: string; assetScale: number };
    receiveAmount: { value: string; assetCode: string; assetScale: number };
    fee?: { value: string; assetCode: string; assetScale: number };
    exchangeRate?: string;
    expiresAt?: string;
  };
}

export interface Transaction {
  id: string;
  status: string;
  direction: string;
  debitAmount?: string;
  receiveAmount?: string;
  assetCode: string;
  description?: string;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  requesterId: string;
  payerId: string;
  amount: number;
  currency: string;
  reason?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Community {
  id: string;
  name: string;
  memberIds: string[];
  pendingMemberIds: string[];
  creatorId: string;
}

export interface CommunityRequest {
  id: string;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  currency: string;
  expiryDate: string;
  status: string;
  creatorId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
}

export function formatMoney(
  value: string | number,
  currency: string,
  scale = 2
): string {
  const num = typeof value === "string" ? Number(value) / 10 ** scale : value;
  return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}
