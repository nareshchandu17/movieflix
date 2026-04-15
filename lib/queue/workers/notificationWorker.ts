import { Worker, Job } from "bullmq";
import { redisConfig } from "@/lib/redis";
import connectDB from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { NotificationType } from "@/types/notifications";
import Redis from "ioredis";
import { NOTIFICATION_QUEUE_NAME, NotificationJobData } from "../notificationQueue";

// Pre-shared Redis client for publishing socket events
const pubClient = new Redis(redisConfig);

const worker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job: Job<NotificationJobData>) => {
    const { userId, type, title, message, link, metadata } = job.data;

    console.log(`[Worker] Processing notification for user: ${userId}`);

    try {
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

      // 2. Invalidate Unread Count Cache in Redis
      const unreadCountKey = `notifications:unread:${userId}`;
      await pubClient.del(unreadCountKey);

      // 3. Publish to Redis for Socket Server to pick up
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

      await pubClient.publish("NOTIFICATIONS_CHANNEL", JSON.stringify(socketPayload));

      console.log(`[Worker] Notification processed and published for user: ${userId}`);
    } catch (error) {
      console.error(`[Worker] Failed to process notification for user ${userId}:`, error);
      throw error; // Let BullMQ handle retry
    }
  },
  {
    connection: {
      ...redisConfig,
      keyPrefix: "bull:",
    },
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

export default worker;
