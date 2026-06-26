import {
  createAuthenticatedClient,
  isPendingGrant,
  isFinalizedGrantWithAccessToken,
} from "@interledger/open-payments";
import type {
  Grant,
  GrantContinuation,
  GrantWithAccessToken,
  PendingGrant,
} from "@interledger/open-payments";
import { config, isOpenPaymentsConfigured } from "../config";

// Adapted from OpenRemit (https://github.com/marclevin/OpenRemit)
let _client: Awaited<ReturnType<typeof createAuthenticatedClient>> | null =
  null;

export async function getClient() {
  if (!isOpenPaymentsConfigured()) {
    throw new Error(
      "Open Payments not configured. Set OP_WALLET_ADDRESS, OP_KEY_ID, OP_PRIVATE_KEY_PATH in backend/.env"
    );
  }

  if (_client) return _client;

  _client = await createAuthenticatedClient({
    walletAddressUrl: config.op.walletAddress,
    keyId: config.op.keyId,
    privateKey: config.op.privateKeyPath,
  });

  return _client;
}

export function normaliseWalletAddress(addr: string): string {
  const trimmed = addr.trim();
  if (trimmed.startsWith("$")) return `https://${trimmed.slice(1)}`;
  if (!trimmed.startsWith("http")) return `https://${trimmed}`;
  return trimmed;
}

export function isFinalizedGrant(
  grant: PendingGrant | GrantContinuation | Grant
): grant is GrantWithAccessToken {
  return !isPendingGrant(grant) && isFinalizedGrantWithAccessToken(grant);
}

export async function discoverWallet(walletAddress: string) {
  const { default: axios } = await import("axios");
  const url = normaliseWalletAddress(walletAddress);
  const response = await axios.get(url, {
    headers: { Accept: "application/json" },
  });
  return response.data;
}
