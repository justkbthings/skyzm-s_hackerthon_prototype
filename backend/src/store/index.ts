import admin from "firebase-admin";
import { config } from "../config";
import type {
  AppNotification,
  Beneficiary,
  Community,
  CommunityRequest,
  PaymentRequest,
  Transaction,
  User,
} from "../types";

type CollectionName =
  | "users"
  | "transactions"
  | "beneficiaries"
  | "paymentRequests"
  | "communities"
  | "communityRequests"
  | "notifications";

let firestore: admin.firestore.Firestore | null = null;
const memory = new Map<string, Map<string, unknown>>();

function memCollection(name: CollectionName): Map<string, unknown> {
  if (!memory.has(name)) memory.set(name, new Map());
  return memory.get(name)!;
}

function useFirebase(): boolean {
  return Boolean(
    config.firebase.projectId &&
      config.firebase.clientEmail &&
      config.firebase.privateKey
  );
}

export function initFirebase(): void {
  if (!useFirebase() || firestore) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId!,
      clientEmail: config.firebase.clientEmail!,
      privateKey: config.firebase.privateKey!,
    }),
  });

  firestore = admin.firestore();
  console.log("[store] Using Firebase Firestore");
}

async function getAll<T>(collection: CollectionName): Promise<T[]> {
  if (useFirebase() && firestore) {
    const snap = await firestore.collection(collection).get();
    return snap.docs.map((d) => d.data() as T);
  }
  return Array.from(memCollection(collection).values()) as T[];
}

async function getById<T>(
  collection: CollectionName,
  id: string
): Promise<T | null> {
  if (useFirebase() && firestore) {
    const doc = await firestore.collection(collection).doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }
  return (memCollection(collection).get(id) as T) ?? null;
}

async function setDoc<T extends { id: string }>(
  collection: CollectionName,
  data: T
): Promise<T> {
  if (useFirebase() && firestore) {
    await firestore.collection(collection).doc(data.id).set(data);
    return data;
  }
  memCollection(collection).set(data.id, data);
  return data;
}

async function updateDoc<T extends { id: string }>(
  collection: CollectionName,
  id: string,
  patch: Partial<T>
): Promise<T | null> {
  const existing = await getById<T>(collection, id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, id } as T;
  return setDoc(collection, updated);
}

async function queryWhere<T>(
  collection: CollectionName,
  field: string,
  value: unknown
): Promise<T[]> {
  const all = await getAll<T>(collection);
  return all.filter((item) => (item as Record<string, unknown>)[field] === value);
}

export const store = {
  mode: () => (useFirebase() ? "firebase" : "memory"),

  users: {
    all: () => getAll<User>("users"),
    get: (id: string) => getById<User>("users", id),
    getByEmail: async (email: string) => {
      const users = await getAll<User>("users");
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    create: (user: User) => setDoc("users", user),
    update: (id: string, patch: Partial<User>) => updateDoc("users", id, patch),
  },

  transactions: {
    all: () => getAll<Transaction>("transactions"),
    get: (id: string) => getById<Transaction>("transactions", id),
    byUser: async (userId: string) => {
      const all = await getAll<Transaction>("transactions");
      return all.filter((t) => t.userId === userId);
    },
    create: (tx: Transaction) => setDoc("transactions", tx),
    update: (id: string, patch: Partial<Transaction>) =>
      updateDoc("transactions", id, patch),
  },

  beneficiaries: {
    byUser: (userId: string) => queryWhere<Beneficiary>("beneficiaries", "userId", userId),
    create: (b: Beneficiary) => setDoc("beneficiaries", b),
    delete: async (id: string) => {
      if (useFirebase() && firestore) {
        await firestore.collection("beneficiaries").doc(id).delete();
      } else {
        memCollection("beneficiaries").delete(id);
      }
    },
  },

  paymentRequests: {
    all: () => getAll<PaymentRequest>("paymentRequests"),
    get: (id: string) => getById<PaymentRequest>("paymentRequests", id),
    byUser: async (userId: string) => {
      const all = await getAll<PaymentRequest>("paymentRequests");
      return all.filter(
        (r) => r.requesterId === userId || r.payerId === userId
      );
    },
    create: (r: PaymentRequest) => setDoc("paymentRequests", r),
    update: (id: string, patch: Partial<PaymentRequest>) =>
      updateDoc("paymentRequests", id, patch),
  },

  communities: {
    all: () => getAll<Community>("communities"),
    get: (id: string) => getById<Community>("communities", id),
    byMember: async (userId: string) => {
      const all = await getAll<Community>("communities");
      return all.filter(
        (c) =>
          c.memberIds.includes(userId) ||
          c.pendingMemberIds.includes(userId) ||
          c.creatorId === userId
      );
    },
    create: (c: Community) => setDoc("communities", c),
    update: (id: string, patch: Partial<Community>) =>
      updateDoc("communities", id, patch),
  },

  communityRequests: {
    byCommunity: (communityId: string) =>
      queryWhere<CommunityRequest>("communityRequests", "communityId", communityId),
    get: (id: string) => getById<CommunityRequest>("communityRequests", id),
    create: (r: CommunityRequest) => setDoc("communityRequests", r),
    update: (id: string, patch: Partial<CommunityRequest>) =>
      updateDoc("communityRequests", id, patch),
  },

  notifications: {
    byUser: (userId: string) =>
      queryWhere<AppNotification>("notifications", "userId", userId),
    create: (n: AppNotification) => setDoc("notifications", n),
    update: (id: string, patch: Partial<AppNotification>) =>
      updateDoc("notifications", id, patch),
  },
};

export async function seedDemoUsers(): Promise<void> {
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash("password123", 10);
  const now = new Date().toISOString();

  const demoUsers: User[] = [
    {
      id: "user-nomzamo",
      email: "nomzamo@example.com",
      passwordHash: hash,
      displayName: "Nomzamo",
      phone: "+27821234567",
      country: "ZA",
      currency: "ZAR",
      walletAddress: "https://ilp.interledger-test.dev/nomzamo",
      latitude: -33.9249,
      longitude: 18.4241,
      balance: 2500,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-mother",
      email: "mother@example.com",
      passwordHash: hash,
      displayName: "Mother",
      phone: "+27829876543",
      country: "ZA",
      currency: "ZAR",
      walletAddress: "https://ilp.interledger-test.dev/mother",
      latitude: -26.2041,
      longitude: 28.0473,
      balance: 15000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-jane",
      email: "jane@example.com",
      passwordHash: hash,
      displayName: "Jane",
      phone: "+447700900123",
      country: "GB",
      currency: "GBP",
      walletAddress: "https://ilp.interledger-test.dev/jane",
      latitude: 51.5074,
      longitude: -0.1278,
      balance: 500,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-kamau",
      email: "kamau@example.com",
      passwordHash: hash,
      displayName: "Kamau",
      phone: "+254712345678",
      country: "KE",
      currency: "KES",
      walletAddress: "https://ilp.interledger-test.dev/kamau",
      latitude: -1.2921,
      longitude: 36.8219,
      balance: 12000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user-thabo",
      email: "thabo@example.com",
      passwordHash: hash,
      displayName: "Thabo",
      phone: "+27831112233",
      country: "ZA",
      currency: "ZAR",
      walletAddress: "https://ilp.interledger-test.dev/thabo",
      latitude: -25.7479,
      longitude: 28.2293,
      balance: 3200,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of demoUsers) {
    const existing = await store.users.get(user.id);
    if (!existing) {
      await store.users.create(user);
    }
  }

  if (config.op.walletAddress) {
    const nomzamo = await store.users.get("user-nomzamo");
    if (nomzamo) {
      await store.users.update("user-nomzamo", {
        walletAddress: config.op.walletAddress,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  console.log("[store] Demo users ready (password: password123)");
}
