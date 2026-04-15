export enum NotificationType {
  NEW_MOVIE = "NEW_MOVIE",
  NEW_EPISODE = "NEW_EPISODE",
  CONTINUE_WATCHING = "CONTINUE_WATCHING",
  DOWNLOAD_READY = "DOWNLOAD_READY",
  RECOMMENDATION = "RECOMMENDATION",
  SYSTEM_ALERT = "SYSTEM_ALERT",
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  metadata?: any;
}
