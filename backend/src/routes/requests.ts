import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { createNotification } from "../services/notifications";

export const requestsRouter = Router();

requestsRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { payerId, amount, currency, reason } = req.body;
    const numAmount = Number(amount);

    if (!payerId || !numAmount || numAmount <= 0 || !currency) {
      return res.status(400).json({
        error: "payerId, amount (>0), and currency required",
      });
    }

    const payer = await store.users.get(payerId);
    if (!payer) return res.status(404).json({ error: "Payer not found" });

    const now = new Date().toISOString();
    const request = {
      id: uuidv4(),
      requesterId: req.user!.id,
      payerId,
      amount: numAmount,
      currency,
      reason,
      status: "PENDING" as const,
      createdAt: now,
      updatedAt: now,
    };

    await store.paymentRequests.create(request);

    await createNotification({
      userId: payerId,
      title: "Payment request",
      body: `${req.user!.displayName} requested ${currency} ${numAmount}${reason ? `: ${reason}` : ""}`,
      type: "payment_request",
      referenceId: request.id,
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

requestsRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const all = await store.paymentRequests.byUser(req.user!.id);
    const incoming = all.filter((r) => r.payerId === req.user!.id);
    const outgoing = all.filter((r) => r.requesterId === req.user!.id);
    res.json({ incoming, outgoing });
  } catch (err) {
    next(err);
  }
});

requestsRouter.patch("/:id/approve", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const request = await store.paymentRequests.get(req.params.id);
    if (!request || request.payerId !== req.user!.id) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updated = await store.paymentRequests.update(request.id, {
      status: "APPROVED",
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

requestsRouter.patch("/:id/decline", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const request = await store.paymentRequests.get(req.params.id);
    if (!request || request.payerId !== req.user!.id) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updated = await store.paymentRequests.update(request.id, {
      status: "DECLINED",
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

requestsRouter.patch("/:id/cancel", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const request = await store.paymentRequests.get(req.params.id);
    if (!request || request.requesterId !== req.user!.id) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updated = await store.paymentRequests.update(request.id, {
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});
