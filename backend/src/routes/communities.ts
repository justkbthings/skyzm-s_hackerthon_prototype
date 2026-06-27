import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { store } from "../store";
import { createNotification } from "../services/notifications";

export const communitiesRouter = Router();

communitiesRouter.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const communities = await store.communities.byMember(req.user!.id);
    res.json(communities);
  } catch (err) {
    next(err);
  }
});

communitiesRouter.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { name, memberIds } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const now = new Date().toISOString();
    const community = {
      id: uuidv4(),
      name,
      creatorId: req.user!.id,
      memberIds: [req.user!.id, ...(memberIds ?? [])],
      pendingMemberIds: [] as string[],
      createdAt: now,
      updatedAt: now,
    };

    await store.communities.create(community);
    res.status(201).json(community);
  } catch (err) {
    next(err);
  }
});

communitiesRouter.post("/:id/join", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const community = await store.communities.get(req.params.id);
    if (!community) return res.status(404).json({ error: "Community not found" });

    if (community.memberIds.includes(req.user!.id)) {
      return res.json(community);
    }

    const pending = [...community.pendingMemberIds, req.user!.id];
    const updated = await store.communities.update(community.id, {
      pendingMemberIds: pending,
      updatedAt: new Date().toISOString(),
    });

    await createNotification({
      userId: community.creatorId,
      title: "Community join request",
      body: `${req.user!.displayName} wants to join ${community.name}`,
      type: "community",
      referenceId: community.id,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

communitiesRouter.post(
  "/:id/members/:userId/approve",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const community = await store.communities.get(req.params.id);
      if (!community || community.creatorId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const userId = req.params.userId;
      const memberIds = [...community.memberIds, userId];
      const pendingMemberIds = community.pendingMemberIds.filter(
        (id) => id !== userId
      );

      const updated = await store.communities.update(community.id, {
        memberIds: [...new Set(memberIds)],
        pendingMemberIds,
        updatedAt: new Date().toISOString(),
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

communitiesRouter.post(
  "/:id/members/:userId/deny",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const community = await store.communities.get(req.params.id);
      if (!community || community.creatorId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const pendingMemberIds = community.pendingMemberIds.filter(
        (id) => id !== req.params.userId
      );

      const updated = await store.communities.update(community.id, {
        pendingMemberIds,
        updatedAt: new Date().toISOString(),
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

communitiesRouter.get(
  "/:id/members",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const community = await store.communities.get(req.params.id);
      if (!community) return res.status(404).json({ error: "Community not found" });

      const members = await Promise.all(
        community.memberIds.map((id) => store.users.get(id))
      );

      res.json(
        members
          .filter((m): m is NonNullable<typeof m> => m != null)
          .map(({ passwordHash: _, ...u }) => u)
      );
    } catch (err) {
      next(err);
    }
  }
);

communitiesRouter.post(
  "/:id/requests",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const community = await store.communities.get(req.params.id);
      if (!community || !community.memberIds.includes(req.user!.id)) {
        return res.status(403).json({ error: "Not a community member" });
      }

      const { title, targetAmount, currency, expiryDate } = req.body;
      const amount = Number(targetAmount);
      const requestCurrency = currency ?? req.user!.accountCurrency ?? req.user!.currency ?? "ZAR";

      if (!title || !amount || amount <= 0 || !expiryDate) {
        return res.status(400).json({
          error: "title, targetAmount, expiryDate required",
        });
      }

      const now = new Date().toISOString();
      const request = {
        id: uuidv4(),
        communityId: community.id,
        creatorId: req.user!.id,
        title,
        targetAmount: amount,
        currency: requestCurrency,
        raisedAmount: 0,
        expiryDate,
        status: "OPEN" as const,
        contributions: [],
        createdAt: now,
        updatedAt: now,
      };

      await store.communityRequests.create(request);

      for (const memberId of community.memberIds) {
        if (memberId === req.user!.id) continue;
        await createNotification({
          userId: memberId,
          title: "New community request",
          body: `${req.user!.displayName} needs ${requestCurrency} ${amount} for ${title}`,
          type: "community",
          referenceId: request.id,
        });
      }

      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }
);

communitiesRouter.get(
  "/:id/requests",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const requests = await store.communityRequests.byCommunity(req.params.id);
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }
);

communitiesRouter.get(
  "/users/related",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const txs = await store.transactions.byUser(req.user!.id);
      const relatedIds = new Set<string>();

      for (const tx of txs) {
        const allUsers = await store.users.all();
        const counterparty = allUsers.find(
          (u) =>
            u.walletAddress === tx.receiverWalletAddress ||
            u.walletAddress === tx.senderWalletAddress
        );
        if (counterparty && counterparty.id !== req.user!.id) {
          relatedIds.add(counterparty.id);
        }
      }

      const users = await Promise.all(
        [...relatedIds].map((id) => store.users.get(id))
      );

      res.json(
        users
          .filter((u): u is NonNullable<typeof u> => u != null)
          .map(({ passwordHash: _, ...safe }) => safe)
      );
    } catch (err) {
      next(err);
    }
  }
);
