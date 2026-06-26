const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

const TEST_USERS = [
  {
    uid: "test-user-001",
    name: "Amara Dlamini",
    email: "amara@openremit.dev",
    password: "Test@1234",
    phone: "+27821234567",
    country: "South Africa",
    currency: "ZAR",
    language: "en",
    walletAddress: "https://ilp.openremit.dev/amara",
    walletBalance: 2500.0,
    profileInitials: "AD",
    avatarColor: "#1A73E8",
    community: ["test-user-002", "test-user-003"],
    bankAccounts: [{ bank: "FNB", accountNumber: "62123456789", accountType: "Cheque" }],
  },
  {
    uid: "test-user-002",
    name: "Wanjiru Kamau",
    email: "wanjiru@openremit.dev",
    password: "Test@1234",
    phone: "+254712345678",
    country: "Kenya",
    currency: "KES",
    language: "sw",
    walletAddress: "https://ilp.openremit.dev/wanjiru",
    walletBalance: 15000.0,
    profileInitials: "WK",
    avatarColor: "#34A853",
    community: ["test-user-001", "test-user-004"],
    bankAccounts: [{ bank: "M-Pesa", accountNumber: "+254712345678", accountType: "Mobile Money" }],
  },
  {
    uid: "test-user-003",
    name: "Sipho Ndlovu",
    email: "sipho@openremit.dev",
    password: "Test@1234",
    phone: "+27831234567",
    country: "South Africa",
    currency: "ZAR",
    language: "xh",
    walletAddress: "https://ilp.openremit.dev/sipho",
    walletBalance: 850.0,
    profileInitials: "SN",
    avatarColor: "#EA4335",
    community: ["test-user-001", "test-user-005"],
    bankAccounts: [{ bank: "Standard Bank", accountNumber: "001234567890", accountType: "Savings" }],
  },
  {
    uid: "test-user-004",
    name: "Grace Okonkwo",
    email: "grace@openremit.dev",
    password: "Test@1234",
    phone: "+447700123456",
    country: "England",
    currency: "GBP",
    language: "en",
    walletAddress: "https://ilp.openremit.dev/grace",
    walletBalance: 320.0,
    profileInitials: "GO",
    avatarColor: "#FBBC04",
    community: ["test-user-002", "test-user-005"],
    bankAccounts: [{ bank: "Barclays", accountNumber: "20-30-40 12345678", accountType: "Current" }],
  },
  {
    uid: "test-user-005",
    name: "Marcus Webb",
    email: "marcus@openremit.dev",
    password: "Test@1234",
    phone: "+12025551234",
    country: "USA",
    currency: "USD",
    language: "en",
    walletAddress: "https://ilp.openremit.dev/marcus",
    walletBalance: 1200.0,
    profileInitials: "MW",
    avatarColor: "#9C27B0",
    community: ["test-user-003", "test-user-004"],
    bankAccounts: [{ bank: "Bank of America", accountNumber: "000123456789", accountType: "Checking" }],
  },
];

function makeId(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.log("Firebase env missing. Seed script is ready, but no writes were performed.");
    process.exit(0);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  const firestore = admin.firestore();
  const auth = admin.auth();
  const now = new Date().toISOString();
  const hashedPassword = await bcrypt.hash("Test@1234", 10);

  for (const user of TEST_USERS) {
    const userDoc = {
      id: user.uid,
      email: user.email,
      passwordHash: hashedPassword,
      displayName: user.name,
      phone: user.phone,
      country: user.country,
      currency: user.currency,
      walletAddress: user.walletAddress,
      balance: user.walletBalance,
      profileInitials: user.profileInitials,
      avatarColor: user.avatarColor,
      language: user.language,
      bankAccounts: user.bankAccounts,
      community: user.community,
      createdAt: now,
      updatedAt: now,
    };

    await firestore.collection("users").doc(user.uid).set(userDoc, { merge: true });

    try {
      await auth.getUserByEmail(user.email);
    } catch (err) {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: user.password,
        displayName: user.name,
        phoneNumber: user.phone,
      });
    }

    const otherUsers = TEST_USERS.filter((candidate) => candidate.uid !== user.uid);

    for (let index = 0; index < 3; index += 1) {
      const counterparty = otherUsers[(index + TEST_USERS.indexOf(user)) % otherUsers.length];
      const direction = index === 0 ? "deposit" : index === 1 ? "sent" : "received";
      const amount = 100 + index * 25 + TEST_USERS.indexOf(user) * 10;

      await firestore.collection("transactions").doc(`${user.uid}-tx-${index + 1}`).set(
        {
          id: `${user.uid}-tx-${index + 1}`,
          userId: user.uid,
          status: "COMPLETED",
          paymentType: "ONE_TIME",
          direction,
          senderWalletAddress: direction === "sent" ? user.walletAddress : counterparty.walletAddress,
          receiverWalletAddress: direction === "received" ? user.walletAddress : counterparty.walletAddress,
          beneficiaryId: counterparty.uid,
          beneficiaryName: counterparty.name,
          debitAmount: String(amount),
          receiveAmount: String(amount),
          assetCode: user.currency,
          assetScale: 2,
          description: `${direction} sample ${index + 1}`,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    await firestore.collection("paymentRequests").doc(`${user.uid}-request`).set(
      {
        id: `${user.uid}-request`,
        requesterId: user.uid,
        payerId: TEST_USERS[(TEST_USERS.indexOf(user) + 1) % TEST_USERS.length].uid,
        amount: 200,
        currency: user.currency,
        reason: `Sample request for ${user.name}`,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await firestore.collection("paymentRequests").doc("test-user-001-recurring").set(
    {
      id: "test-user-001-recurring",
      requesterId: "test-user-001",
      payerId: "test-user-002",
      amount: 200,
      currency: "ZAR",
      reason: "Recurring support payment",
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      recurring: {
        interval: "P1M",
        startDate: now.slice(0, 10),
        expiryDate: "2026-12-31",
        amount: "20000",
      },
    },
    { merge: true }
  );

  const communityId = "test-community-001";
  await firestore.collection("communities").doc(communityId).set(
    {
      id: communityId,
      name: "OpenRemit Demo Community",
      creatorId: "test-user-001",
      memberIds: ["test-user-001", "test-user-002", "test-user-003", "test-user-004", "test-user-005"],
      pendingMemberIds: [],
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await firestore.collection("communityRequests").doc("test-community-request-001").set(
    {
      id: "test-community-request-001",
      communityId,
      creatorId: "test-user-004",
      title: "Need GBP 80 for work uniform",
      targetAmount: 80,
      currency: "GBP",
      raisedAmount: 20,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "OPEN",
      contributions: [
        {
          id: makeId("contribution", 0),
          userId: "test-user-005",
          amount: 20,
          currency: "GBP",
          transactionId: "test-user-005-tx-1",
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  console.log("Seeded test users, transactions, requests, and community data.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
