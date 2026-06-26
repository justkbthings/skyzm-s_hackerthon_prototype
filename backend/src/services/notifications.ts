import { v4 as uuidv4 } from "uuid";
import { store } from "../store";
import type { AppNotification } from "../types";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  type: AppNotification["type"];
  referenceId?: string;
}): Promise<AppNotification> {
  const notification: AppNotification = {
    id: uuidv4(),
    userId: input.userId,
    title: input.title,
    body: input.body,
    type: input.type,
    referenceId: input.referenceId,
    read: false,
    createdAt: new Date().toISOString(),
  };

  await store.notifications.create(notification);
  return notification;
}
