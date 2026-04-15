import { addNotificationToQueue, NotificationJobData } from "@/lib/queue/notificationQueue";
import { NotificationType } from "@/types/notifications";

export class NotificationService {
  /**
   * Dispatches a notification to the background queue for processing.
   * This is the recommended way to send notifications non-blockingly.
   */
  static async send(data: NotificationJobData) {
    try {
      await addNotificationToQueue(data);
      console.log(`[NotificationService] Dispatched ${data.type} for user ${data.userId}`);
    } catch (error) {
      console.error("[NotificationService] Dispatch error:", error);
    }
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
