import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { config } from "../config";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const notifications = await store.notifications.byUser(req.user!.id);
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch(
  "/:id/read",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const notification = await store.notifications.byUser(req.user!.id);
      const found = notification.find((n) => n.id === req.params.id);
      if (!found) return res.status(404).json({ error: "Not found" });

      const updated = await store.notifications.update(found.id, { read: true });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

export const transactionsRouter = Router();

transactionsRouter.get("/history", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const txs = await store.transactions.byUser(req.user!.id);
    txs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(txs);
  } catch (err) {
    next(err);
  }
});

export const whatsappRouter = Router();

whatsappRouter.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

whatsappRouter.post("/webhook", (req, res) => {
  console.log("[whatsapp] webhook:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});
