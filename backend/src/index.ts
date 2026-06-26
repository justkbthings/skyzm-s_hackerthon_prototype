import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/auth";
import { initFirebase, seedDemoUsers } from "./store";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { walletRouter } from "./routes/wallet";
import { beneficiariesRouter } from "./routes/beneficiaries";
import { paymentsRouter } from "./routes/payments";
import { callbackRouter } from "./routes/callback";
import { requestsRouter } from "./routes/requests";
import { communitiesRouter } from "./routes/communities";
import {
  notificationsRouter,
  transactionsRouter,
  whatsappRouter,
} from "./routes/notifications";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "community-remit-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/beneficiaries", beneficiariesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/callback", callbackRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api/community", communitiesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/whatsapp", whatsappRouter);

app.use(errorHandler);

async function start() {
  initFirebase();
  await seedDemoUsers();

  app.listen(config.port, () => {
    console.log(`Community Remit API running on http://localhost:${config.port}`);
    console.log(`Store mode: ${require("./store").store.mode()}`);
  });
}

start();
