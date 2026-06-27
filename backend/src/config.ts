import "dotenv/config";

function optional(name: string): string | undefined {
  const val = process.env[name];
  return val && val.trim() ? val.trim() : undefined;
}

function requiredForOp(name: string): string {
  const val = optional(name);
  if (!val) {
    throw new Error(
      `Missing Open Payments env: ${name}. Copy backend/.env.example → backend/.env`
    );
  }
  return val;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:3001",
  mobileDeepLink: process.env.MOBILE_DEEP_LINK ?? "communityremit://payment",
  mobileWebUrl: process.env.MOBILE_WEB_URL ?? "http://localhost:8081",

  op: {
    walletAddress: process.env.OPEN_PAYMENTS_WALLET_ADDRESS ?? process.env.OP_WALLET_ADDRESS ?? "",
    keyId: process.env.OPEN_PAYMENTS_KEY_ID ?? process.env.OP_KEY_ID ?? "",
    privateKeyPath:
      process.env.OPEN_PAYMENTS_PRIVATE_KEY_PATH ?? process.env.OP_PRIVATE_KEY_PATH ?? "",
  },

  jwtSecret: process.env.JWT_SECRET ?? "hackathon-dev-secret",

  firebase: {
    projectId: optional("FIREBASE_PROJECT_ID"),
    clientEmail: optional("FIREBASE_CLIENT_EMAIL"),
    privateKey: optional("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  },

  whatsapp: {
    token: optional("WHATSAPP_ACCESS_TOKEN") ?? optional("WHATSAPP_TOKEN"),
    phoneNumberId: optional("WHATSAPP_PHONE_NUMBER_ID"),
    verifyToken: optional("WHATSAPP_VERIFY_TOKEN") ?? "community-remit-verify",
  },
};

export function isOpenPaymentsConfigured(): boolean {
  return Boolean(
    config.op.walletAddress && config.op.keyId && config.op.privateKeyPath
  );
}

export function assertOpenPaymentsConfigured(): void {
  requiredForOp("OP_WALLET_ADDRESS");
  requiredForOp("OP_KEY_ID");
  requiredForOp("OP_PRIVATE_KEY_PATH");
}
