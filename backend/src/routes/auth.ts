import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";

export const authRouter = Router();

function accountMetadata(country?: string, currency?: string) {
  const normalizedCountry = country ?? "South Africa";
  const normalizedCurrency = currency ?? (normalizedCountry === "Kenya" ? "KES" : "ZAR");
  const flag =
    normalizedCountry === "Kenya"
      ? "🇰🇪"
      : normalizedCountry === "England"
        ? "🇬🇧"
        : normalizedCountry === "USA"
          ? "🇺🇸"
          : "🇿🇦";

  return {
    accountCurrency: normalizedCurrency,
    accountCountry: normalizedCountry,
    accountFlag: flag,
  };
}

function safeUser(user: Record<string, any>) {
  const { passwordHash: _, ...rest } = user;
  return {
    ...rest,
    ...accountMetadata(user.accountCountry ?? user.country, user.accountCurrency ?? user.currency),
  };
}

async function registerUser(req: any, res: any, next: any) {
  try {
    const { email, password, displayName, country, currency, phone, walletAddress } =
      req.body;

    if (!email || !password || !displayName || !country) {
      return res.status(400).json({ error: "email, password, displayName, country required" });
    }

    const existing = await store.users.getByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const now = new Date().toISOString();
    const user = {
      id: uuidv4(),
      email,
      passwordHash: await bcrypt.hash(password, 10),
      displayName,
      phone,
      country,
      currency: currency ?? "ZAR",
      ...accountMetadata(country, currency),
      walletAddress,
      balance: 0,
      createdAt: now,
      updatedAt: now,
    };

    await store.users.create(user);

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

authRouter.post("/signup", registerUser);

authRouter.post("/register", registerUser);

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await store.users.getByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: "7d",
    });

    res.json({ token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json(safeUser(req.user!));
});

authRouter.patch("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { displayName, phone, walletAddress, fcmToken, latitude, longitude } =
      req.body;

    const updated = await store.users.update(req.user!.id, {
      displayName: displayName ?? req.user!.displayName,
      phone: phone ?? req.user!.phone,
      walletAddress: walletAddress ?? req.user!.walletAddress,
      fcmToken: fcmToken ?? req.user!.fcmToken,
      latitude: latitude ?? req.user!.latitude,
      longitude: longitude ?? req.user!.longitude,
      accountCurrency: req.user!.accountCurrency ?? req.user!.currency ?? "ZAR",
      accountCountry: req.user!.accountCountry ?? req.user!.country,
      accountFlag: req.user!.accountFlag ?? accountMetadata(req.user!.country, req.user!.currency).accountFlag,
      updatedAt: new Date().toISOString(),
    });

    const { passwordHash: _, ...safe } = updated!;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});
