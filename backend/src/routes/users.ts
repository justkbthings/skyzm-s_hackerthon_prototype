import { Router } from "express";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const all = await store.users.all();
    const users = all
      .filter((u) => u.id !== req.user!.id)
      .map(({ passwordHash: _, ...safe }) => safe);
    res.json(users);
  } catch (err) {
    next(err);
  }
});
