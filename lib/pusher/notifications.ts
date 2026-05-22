import { triggerUserEvent } from "./server";

interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  [key: string]: any;
}

/**
 * Sends a real-time notification to a user using their private user channel.
 */
export async function pushNotificationToUser(
  userId: string,
  notification: NotificationPayload
): Promise<void> {
  if (!userId) {
    console.warn("⚠️ Cannot push notification: userId is empty");
    return;
  }
  await triggerUserEvent(userId, "new-notification", notification);
}
