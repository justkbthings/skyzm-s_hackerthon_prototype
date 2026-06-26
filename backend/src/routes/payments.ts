import { Router } from "express";
import crypto from "node:crypto";
import { isPendingGrant } from "@interledger/open-payments";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { getClient, normaliseWalletAddress } from "../lib/openPayments";
import { createQuoteTransaction } from "../lib/quoteFlow";
import { config, isOpenPaymentsConfigured } from "../config";
import {
  buildPaymentInstructionMessage,
  sendWhatsAppText,
} from "../services/whatsapp";

export const paymentsRouter = Router();

paymentsRouter.get("/wallet-info", requireAuth, async (req, res, next) => {
  try {
    const url = ((req.query.url as string) ?? "").trim();
    if (!url) return res.status(400).json({ error: "Missing url parameter" });

    const client = await getClient();
    const wallet = await client.walletAddress.get({
      url: normaliseWalletAddress(url),
    });

    res.json({
      assetCode: wallet.assetCode,
      assetScale: wallet.assetScale,
      publicName: wallet.publicName,
    });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post("/quote", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!isOpenPaymentsConfigured()) {
      return res.status(503).json({ error: "Open Payments not configured" });
    }

    const {
      receiverWalletAddress,
      amount,
      beneficiaryId,
      beneficiaryName,
      paymentMode,
      recurring,
      description,
    } = req.body;

    const senderWallet =
      config.op.walletAddress || req.user!.walletAddress;
    if (!senderWallet) {
      return res.status(400).json({
        error: "Open Payments wallet not configured. Set OP_WALLET_ADDRESS in .env",
      });
    }

    if (!receiverWalletAddress || !amount) {
      return res.status(400).json({
        error: "receiverWalletAddress and amount required",
      });
    }

    const result = await createQuoteTransaction({
      senderWalletAddress: senderWallet,
      receiverWalletAddress,
      amount: String(amount),
      paymentType: "FIXED_SEND",
      userId: req.user!.id,
      beneficiaryId,
      beneficiaryName,
      description,
      paymentTypeLabel: paymentMode === "RECURRING" ? "RECURRING" : "ONE_TIME",
      recurring: paymentMode === "RECURRING" ? recurring : undefined,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post("/consent", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: "transactionId required" });
    }

    const tx = await store.transactions.get(transactionId);
    if (!tx || tx.userId !== req.user!.id) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (tx.status !== "PENDING") {
      return res.status(400).json({ error: `Transaction is ${tx.status}` });
    }

    const client = await getClient();
    const sendingWallet = await client.walletAddress.get({
      url: tx.senderWalletAddress!,
    });

    const nonce = crypto.randomUUID();
    const callbackUrl = `${config.backendUrl}/api/callback?transactionId=${transactionId}`;

    const limits: Record<string, unknown> = {
      debitAmount: {
        value: tx.debitAmount!,
        assetCode: tx.assetCode,
        assetScale: tx.assetScale,
      },
    };

    if (tx.recurring?.interval) {
      limits.interval = `R/${tx.recurring.startDate}/${tx.recurring.interval}`;
    }

    const outgoingGrant = await client.grant.request(
      { url: sendingWallet.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create", "read"],
              identifier: sendingWallet.id,
              limits,
            },
          ],
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: callbackUrl,
            nonce,
          },
        },
      }
    );

    if (!isPendingGrant(outgoingGrant) || !outgoingGrant.interact?.redirect) {
      throw new Error("Expected interactive outgoing-payment grant");
    }

    await store.transactions.update(transactionId, {
      status: "AWAITING_GRANT",
      grantContinueUri: outgoingGrant.continue.uri,
      grantContinueToken: outgoingGrant.continue.access_token.value,
      grantInteractNonce: nonce,
      updatedAt: new Date().toISOString(),
    });

    res.json({ interactUrl: outgoingGrant.interact.redirect });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get("/status/:id", async (req, res, next) => {
  try {
    const tx = await store.transactions.get(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    const {
      grantContinueUri: _a,
      grantContinueToken: _b,
      grantInteractNonce: _c,
      ...safe
    } = tx;

    res.json(safe);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post(
  "/whatsapp-instruction",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const { phone, beneficiaryName, amount, transactionId } = req.body;

      if (!phone || !beneficiaryName || !amount) {
        return res.status(400).json({ error: "phone, beneficiaryName, amount required" });
      }

      const deepLink = transactionId
        ? `${config.mobileDeepLink}?transactionId=${transactionId}`
        : config.mobileDeepLink;

      const message = buildPaymentInstructionMessage({
        senderName: req.user!.displayName,
        amount: String(amount),
        currency: req.user!.currency,
        beneficiaryName,
        deepLink,
      });

      const result = await sendWhatsAppText(phone, message);
      res.json({ message, ...result });
    } catch (err) {
      next(err);
    }
  }
);
