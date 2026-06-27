import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { discoverWallet, normaliseWalletAddress } from "../lib/openPayments";
import { isOpenPaymentsConfigured } from "../config";

export const beneficiariesRouter = Router();

beneficiariesRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const list = await store.beneficiaries.byUser(req.user!.id);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

beneficiariesRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, walletAddress, country, currency } = req.body;

    if (!name || !walletAddress) {
      return res.status(400).json({ error: "name and walletAddress required" });
    }

    const beneficiary = {
      id: uuidv4(),
      userId: req.user!.id,
      name,
      walletAddress: normaliseWalletAddress(walletAddress),
      country,
      currency,
      createdAt: new Date().toISOString(),
    };

    await store.beneficiaries.create(beneficiary);
    res.status(201).json(beneficiary);
  } catch (err) {
    next(err);
  }
});

beneficiariesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const list = await store.beneficiaries.byUser(req.user!.id);
    const found = list.find((b) => b.id === req.params.id);
    if (!found) return res.status(404).json({ error: "Beneficiary not found" });
    await store.beneficiaries.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

beneficiariesRouter.get("/discover", requireAuth, async (req, res) => {
  const url = (req.query.url as string)?.trim();
  if (!url) return res.status(400).json({ error: "url query parameter required" });

  if (!isOpenPaymentsConfigured()) {
    return res.status(503).json({
      error: "Open Payments not configured",
      details: "Set OP_WALLET_ADDRESS, OP_KEY_ID, OP_PRIVATE_KEY_PATH",
    });
  }

  try {
    const metadata = await discoverWallet(url);
    res.json(metadata);
  } catch (err) {
    res.status(502).json({
      error: "Wallet discovery failed",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});
