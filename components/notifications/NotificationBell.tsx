"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { socket } from "@/lib/socket/client";
import NotificationDropdown from "./NotificationDropdown";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // 1. Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!session?.user,
  });

  // 2. Real-time socket listener
  useEffect(() => {
    if (!session?.user) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Authenticate with socket server
    socket.emit("authenticate", { token: "session-token" }); // The socket server handles getServerSession internally

    // Listen for new notifications
    const handleNewNotification = (notification: any) => {
      console.log("🔔 New real-time notification receiver:", notification);
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "latest"] });

      // Show toast
      toast(notification.title, {
        description: notification.message,
        icon: <Bell className="w-4 h-4 text-red-600" />,
        action: {
          label: "View",
          onClick: () => (window.location.href = notification.link),
        },
      });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [session, queryClient]);

  // 3. Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors group"
      >
        <Bell className={`w-5 h-5 transition-colors ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-[#141414] text-[10px] font-black text-white items-center justify-center animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
