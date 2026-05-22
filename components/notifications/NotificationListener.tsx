"use client";

import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { usePusherChannel, usePusherEvent } from "@/hooks/usePusher";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import Script from "next/script";

export default function NotificationListener() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const channelName = session?.user?.id ? `private-user-${session.user.id}` : "";
  const channel = usePusherChannel(channelName);

  usePusherEvent<any>(channel, "new-notification", (notification) => {
    // Invalidate React Query caches for notifications
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] });

    // Trigger local ringing animation on the header bell icon
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("new-notification-received"));
    }

    // Show premium OTT-style notification toast
    toast.custom((t) => (
      <div className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-[#141414]/95 p-4 text-white shadow-2xl backdrop-blur-xl transition-all duration-300">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{notification.title}</p>
          <p className="mt-0.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{notification.message}</p>
        </div>
        {notification.link && (
          <button
            onClick={() => {
              toast.dismiss(t);
              window.location.href = notification.link;
            }}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            View
          </button>
        )}
      </div>
    ), {
      duration: 6000,
    });
  });

  const initializeBeams = () => {
    if (typeof window !== "undefined" && (window as any).PusherPushNotifications) {
      try {
        const beamsClient = new (window as any).PusherPushNotifications.Client({
          instanceId: '4f152dfe-ceda-4b30-b44f-57051121ba07',
        });

        beamsClient.start()
          .then(() => beamsClient.addDeviceInterest('hello'))
          .then(() => console.log('Successfully registered and subscribed!'))
          .catch(console.error);
      } catch (err) {
        console.error("❌ Failed to start Pusher Beams client:", err);
      }
    }
  };

  return (
    <Script
      src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"
      onLoad={initializeBeams}
      strategy="lazyOnload"
    />
  );
}

