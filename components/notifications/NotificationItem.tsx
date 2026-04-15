"use client";

import { formatDistanceToNow } from "date-fns";
import { 
  Film, 
  Tv, 
  Download, 
  Bell, 
  Sparkles, 
  AlertCircle,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { NotificationType } from "@/types/notifications";

interface NotificationItemProps {
  notification: {
    _id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: string | Date;
  };
  onClick?: () => void;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  [NotificationType.NEW_MOVIE]: { icon: Film, color: "text-red-500" },
  [NotificationType.NEW_EPISODE]: { icon: Tv, color: "text-blue-500" },
  [NotificationType.DOWNLOAD_READY]: { icon: Download, color: "text-green-500" },
  [NotificationType.RECOMMENDATION]: { icon: Sparkles, color: "text-yellow-500" },
  [NotificationType.SYSTEM_ALERT]: { icon: AlertCircle, color: "text-orange-500" },
  [NotificationType.CONTINUE_WATCHING]: { icon: PlayCircle, color: "text-red-600" },
};

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const config = typeConfig[notification.type] || { icon: Bell, color: "text-zinc-400" };
  const Icon = config.icon;

  return (
    <Link
      href={notification.link}
      onClick={onClick}
      className={`
        flex items-start gap-4 p-4 transition-all duration-300
        ${notification.read ? "opacity-60 grayscale-[0.5]" : "bg-white/5"}
        hover:bg-white/10 border-b border-white/5 group
      `}
    >
      <div className={`p-2 rounded-xl bg-zinc-900 border border-white/10 ${config.color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className={`text-sm font-bold truncate ${notification.read ? "text-zinc-300" : "text-white"}`}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(229,9,20,0.6)] shrink-0" />
          )}
        </div>
        
        <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
          {notification.message}
        </p>

        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
