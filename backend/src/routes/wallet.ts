import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { DEPOSIT_PROVIDERS, COUNTRY_CURRENCIES } from "../types";

export const walletRouter = Router();

walletRouter.get("/balance", requireAuth, (req: AuthRequest, res) => {
  res.json({
    balance: req.user!.balance,
    currency: req.user!.currency,
    walletAddress: req.user!.walletAddress,
  });
});

walletRouter.get("/providers", requireAuth, (req: AuthRequest, res) => {
  const country = (req.query.country as string) || req.user!.country;
  const providers = DEPOSIT_PROVIDERS.filter((p) => p.country === country);
  res.json({
    country,
    currency: COUNTRY_CURRENCIES[country] ?? req.user!.currency,
    providers,
  });
});

walletRouter.post("/deposit", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { amount, providerId, country } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: "amount must be greater than 0" });
    }

    const provider = DEPOSIT_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) {
      return res.status(400).json({ error: "Invalid provider" });
    }

    const userCountry = country || req.user!.country;
    if (provider.country !== userCountry) {
      return res.status(400).json({ error: "Provider not available in selected country" });
    }

    const newBalance = req.user!.balance + numAmount;
    await store.users.update(req.user!.id, {
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const tx = {
      id: uuidv4(),
      userId: req.user!.id,
      status: "COMPLETED" as const,
      paymentType: "ONE_TIME" as const,
      direction: "deposit" as const,
      debitAmount: String(numAmount),
      receiveAmount: String(numAmount),
      assetCode: req.user!.currency,
      assetScale: 2,
      description: `Deposit via ${provider.name} (POC)`,
      createdAt: now,
      updatedAt: now,
    };

    await store.transactions.create(tx);

    res.json({
      success: true,
      message: `Deposit of ${req.user!.currency} ${numAmount} via ${provider.name} completed (simulated)`,
      balance: newBalance,
      transaction: tx,
    });
  } catch (err) {
    next(err);
  }
});

walletRouter.post("/withdraw", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { amount, providerId, accountLabel } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ error: "amount must be greater than 0" });
    }

    if (numAmount > req.user!.balance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const provider = DEPOSIT_PROVIDERS.find((p) => p.id === providerId);
    const providerName = provider?.name ?? accountLabel ?? "Bank";

    const newBalance = req.user!.balance - numAmount;
    await store.users.update(req.user!.id, {
      balance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const now = new Date().toISOString();
    const tx = {
      id: uuidv4(),
      userId: req.user!.id,
      status: "COMPLETED" as const,
      paymentType: "ONE_TIME" as const,
      direction: "withdrawal" as const,
      debitAmount: String(numAmount),
      receiveAmount: String(numAmount),
      assetCode: req.user!.currency,
      assetScale: 2,
      description: `Withdrawal to ${providerName} (POC)`,
      createdAt: now,
      updatedAt: now,
    };

    await store.transactions.create(tx);

    res.json({
      success: true,
      message: `Withdrawal of ${req.user!.currency} ${numAmount} to ${providerName} completed (simulated)`,
      balance: newBalance,
      transaction: tx,
    });
  } catch (err) {
    next(err);
  }
});
