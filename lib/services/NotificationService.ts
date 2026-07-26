/**
 * @file NotificationService.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { addNotificationToQueue, NotificationJobData } from "@/lib/queue/notificationQueue";
import { NotificationType } from "@/features/settings/types/notifications";

export class NotificationService {
  /**
   * Dispatches a notification to the background queue for processing.
   * This is the recommended way to send notifications non-blockingly.
   */
  static async send(data: NotificationJobData) {
    try {
      await addNotificationToQueue(data);

    } catch (error) {
      console.error("[NotificationService] Dispatch error:", error);
    }
  }

  /**
   * Helper for sending security-related alerts (email change, password change, etc)
   */
  static async sendSecurityAlert(userId: string, title: string, message: string) {
    return this.send({
      userId,
      type: NotificationType.SECURITY_ALERT,
      title,
      message,
      link: "/account"
    });
  }

  /**
   * Helper for sending movie-related notifications
   */
  static async notifyNewMovie(userId: string, movieTitle: string, movieId: string) {
    return this.send({
      userId,
      type: NotificationType.NEW_MOVIE,
      title: "New Movie Alert!",
      message: `"${movieTitle}" is now streaming on MovieFlix. Watch it now!`,
      link: `/movie/${movieId}`,
      metadata: { movieId }
    });
  }

  /**
   * Helper for sending system-related alerts
   */
  static async sendSystemAlert(userId: string, title: string, message: string, link: string = "/browse") {
    return this.send({
      userId,
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      link
    });
  }
}
