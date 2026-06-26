import crypto from "node:crypto";
import type { WalletAddress } from "@interledger/open-payments";
import {
  getClient,
  normaliseWalletAddress,
  isFinalizedGrant,
} from "./openPayments";
import { store } from "../store";

// Adapted from OpenRemit quoteFlow.ts — uses @interledger/open-payments SDK
export interface QuoteFlowInput {
  senderWalletAddress: string;
  receiverWalletAddress: string;
  amount: string;
  paymentType: "FIXED_SEND" | "FIXED_RECEIVE";
  userId: string;
  beneficiaryId?: string;
  beneficiaryName?: string;
  description?: string;
  paymentTypeLabel?: "ONE_TIME" | "RECURRING" | "COMMUNITY_CONTRIBUTION";
  recurring?: {
    interval: string;
    startDate: string;
    expiryDate: string;
    amount: string;
  };
  communityRequestId?: string;
  paymentRequestId?: string;
  validateWallets?: (
    sendingWallet: WalletAddress,
    receivingWallet: WalletAddress
  ) => void;
}

export interface QuoteFlowResult {
  transactionId: string;
  paymentType: "FIXED_SEND" | "FIXED_RECEIVE";
  quote: {
    debitAmount: { value: string; assetCode: string; assetScale: number };
    receiveAmount: { value: string; assetCode: string; assetScale: number };
    expiresAt?: string;
  };
}

export async function createQuoteTransaction(
  input: QuoteFlowInput
): Promise<QuoteFlowResult> {
  const senderUrl = normaliseWalletAddress(input.senderWalletAddress);
  const receiverUrl = normaliseWalletAddress(input.receiverWalletAddress);
  const client = await getClient();
  const fixedSend = input.paymentType === "FIXED_SEND";

  const [sendingWallet, receivingWallet] = await Promise.all([
    client.walletAddress.get({ url: senderUrl }),
    client.walletAddress.get({ url: receiverUrl }),
  ]);

  input.validateWallets?.(sendingWallet, receivingWallet);

  const incomingPaymentGrant = await client.grant.request(
    { url: receivingWallet.authServer },
    {
      access_token: {
        access: [
          { type: "incoming-payment", actions: ["create", "read", "complete"] },
        ],
      },
    }
  );

  if (!isFinalizedGrant(incomingPaymentGrant)) {
    throw new Error("Expected non-interactive incoming-payment grant");
  }

  const incomingPayment = fixedSend
    ? await client.incomingPayment.create(
        {
          url: receivingWallet.resourceServer,
          accessToken: incomingPaymentGrant.access_token.value,
        },
        { walletAddress: receivingWallet.id }
      )
    : await client.incomingPayment.create(
        {
          url: receivingWallet.resourceServer,
          accessToken: incomingPaymentGrant.access_token.value,
        },
        {
          walletAddress: receivingWallet.id,
          incomingAmount: {
            value: input.amount,
            assetCode: receivingWallet.assetCode,
            assetScale: receivingWallet.assetScale,
          },
        }
      );

  const quoteGrant = await client.grant.request(
    { url: sendingWallet.authServer },
    {
      access_token: {
        access: [{ type: "quote", actions: ["create", "read"] }],
      },
    }
  );

  if (!isFinalizedGrant(quoteGrant)) {
    throw new Error("Expected non-interactive quote grant");
  }

  const quote = fixedSend
    ? await client.quote.create(
        {
          url: sendingWallet.resourceServer,
          accessToken: quoteGrant.access_token.value,
        },
        {
          walletAddress: sendingWallet.id,
          receiver: incomingPayment.id,
          method: "ilp",
          debitAmount: {
            value: input.amount,
            assetCode: sendingWallet.assetCode,
            assetScale: sendingWallet.assetScale,
          },
        }
      )
    : await client.quote.create(
        {
          url: sendingWallet.resourceServer,
          accessToken: quoteGrant.access_token.value,
        },
        {
          walletAddress: sendingWallet.id,
          receiver: incomingPayment.id,
          method: "ilp",
        }
      );

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await store.transactions.create({
    id,
    userId: input.userId,
    status: "PENDING",
    paymentType: input.paymentTypeLabel ?? "ONE_TIME",
    direction: "sent",
    senderWalletAddress: senderUrl,
    receiverWalletAddress: receiverUrl,
    beneficiaryId: input.beneficiaryId,
    beneficiaryName: input.beneficiaryName,
    debitAmount: quote.debitAmount.value,
    receiveAmount: quote.receiveAmount.value,
    assetCode: quote.debitAmount.assetCode,
    assetScale: quote.debitAmount.assetScale,
    receiveAssetCode: quote.receiveAmount.assetCode,
    receiveAssetScale: quote.receiveAmount.assetScale,
    incomingPaymentUrl: incomingPayment.id,
    quoteUrl: quote.id,
    quoteExpiresAt: quote.expiresAt,
    recurring: input.recurring,
    communityRequestId: input.communityRequestId,
    paymentRequestId: input.paymentRequestId,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  });

  return {
    transactionId: id,
    paymentType: input.paymentType,
    quote: {
      debitAmount: quote.debitAmount,
      receiveAmount: quote.receiveAmount,
      expiresAt: quote.expiresAt,
    },
  };
}
