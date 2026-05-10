import { redis } from "@/lib/redis";
import { NotificationType } from "@/types/notifications";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

export interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  metadata?: any;
}

/**
 * Adds a notification and processes it immediately using Upstash REST.
 * Replaced BullMQ with direct execution to eliminate ioredis dependency.
 */
export async function addNotificationToQueue(data: NotificationJobData) {
  try {
    const { userId, type, title, message, link, metadata } = data;
    
    console.log(`[Queue] Processing notification for user: ${userId}`);

    await connectDB();

    // 1. Persist to MongoDB
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata,
    });

    // 2. Invalidate Unread Count Cache in Redis (Upstash REST)
    if (redis) {
      const unreadCountKey = `notifications:unread:${userId}`;
      await redis.del(unreadCountKey);

      // 3. Publish to Upstash REST for Socket Server
      const socketPayload = {
        userId,
        notification: {
          id: notification._id,
          type,
          title,
          message,
          link,
          createdAt: notification.createdAt,
        },
      };

      await redis.publish("NOTIFICATIONS_CHANNEL", JSON.stringify(socketPayload));

      // 4. Set Sync Key for Polling-based Socket Servers (Bridge fallback)
      const syncKey = `sync:${userId}:notification`;
      await redis.set(syncKey, socketPayload, { ex: 60 }); // Expire in 60s
    }

    console.log(`[Queue] Notification processed and published for user: ${userId}`);
    return { success: true, notificationId: notification._id };
  } catch (error) {
    console.error("[Queue] Failed to process notification:", error);
    return { success: false, error };
  }
}
