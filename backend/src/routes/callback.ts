import { Router } from "express";
import { store } from "../store";
import { getClient, isFinalizedGrant } from "../lib/openPayments";
import { config } from "../config";

export const callbackRouter = Router();

// GNAP callback — adapted from OpenRemit
callbackRouter.get("/", async (req, res) => {
  const { interact_ref, transactionId, result } = req.query as Record<string, string>;

  if (!transactionId) {
    return res.status(400).send("Missing transactionId");
  }

  const tx = await store.transactions.get(transactionId);
  const redirectBase = `${config.mobileDeepLink}?id=${transactionId}`;

  if (!tx || tx.status !== "AWAITING_GRANT") {
    return res.redirect(`${redirectBase}&status=failed&reason=invalid_state`);
  }

  if (!interact_ref || result === "grant_rejected") {
    await store.transactions.update(transactionId, {
      status: "FAILED",
      errorMessage:
        result === "grant_rejected"
          ? "Payment declined at wallet"
          : "Authorisation incomplete",
      updatedAt: new Date().toISOString(),
    });
    return res.redirect(`${redirectBase}&status=failed`);
  }

  try {
    const client = await getClient();

    const finalizedGrant = await client.grant.continue(
      {
        url: tx.grantContinueUri!,
        accessToken: tx.grantContinueToken!,
      },
      { interact_ref }
    );

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error("Grant continuation failed");
    }

    const sendingWallet = await client.walletAddress.get({
      url: tx.senderWalletAddress!,
    });

    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: finalizedGrant.access_token.value,
      },
      {
        walletAddress: sendingWallet.id,
        quoteId: tx.quoteUrl!,
        metadata: { description: tx.description ?? "Community Remit payment" },
      }
    );

    await store.transactions.update(transactionId, {
      status: "COMPLETED",
      outgoingPaymentUrl: outgoingPayment.id,
      updatedAt: new Date().toISOString(),
    });

    if (tx.paymentRequestId) {
      await store.paymentRequests.update(tx.paymentRequestId, {
        status: "COMPLETED",
        transactionId,
        updatedAt: new Date().toISOString(),
      });
    }

    if (tx.communityRequestId) {
      const cr = await store.communityRequests.get(tx.communityRequestId);
      if (cr) {
        const contribution = {
          id: transactionId,
          userId: tx.userId,
          amount: Number(tx.debitAmount) / 100,
          currency: tx.assetCode,
          transactionId,
          createdAt: new Date().toISOString(),
        };
        const raisedAmount = cr.raisedAmount + contribution.amount;
        await store.communityRequests.update(cr.id, {
          raisedAmount,
          contributions: [...cr.contributions, contribution],
          status: raisedAmount >= cr.targetAmount ? "FULFILLED" : cr.status,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.redirect(`${redirectBase}&status=completed`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await store.transactions.update(transactionId, {
      status: "FAILED",
      errorMessage: message,
      updatedAt: new Date().toISOString(),
    });
    res.redirect(`${redirectBase}&status=failed`);
  }
});
