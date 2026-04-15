import { Queue } from "bullmq";
import { redisConfig } from "@/lib/redis";
import { NotificationType } from "@/types/notifications";

export const NOTIFICATION_QUEUE_NAME = "notification-queue";

// Create a new BullMQ Queue
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: {
    ...redisConfig,
    // KeyPrefix is handled by BullMQ internally for the queue structures
    keyPrefix: "bull:", 
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  metadata?: any;
}

/**
 * Adds a notification job to the queue
 */
export async function addNotificationToQueue(data: NotificationJobData) {
  try {
    await notificationQueue.add("send-notification", data);
    console.log(`[Queue] Notification job added for user: ${data.userId}`);
  } catch (error) {
    console.error("[Queue] Failed to add notification to queue:", error);
  }
}
