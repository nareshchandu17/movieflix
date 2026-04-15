"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, BellOff, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import NotificationItem from "./NotificationItem";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const queryClient = useQueryClient();

  // 1. Fetch latest notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: async () => {
      const res = await fetch("/api/notifications?limit=5");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000, // Background poll as fallback to socket
  });

  // 2. Mark all as read mutation
  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const notifications = data?.notifications || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 mt-4 w-96 bg-[#141414] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[1200]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1 uppercase"
          >
            <CheckCircle2 className="w-3 h-3" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification: any) => (
            <NotificationItem 
              key={notification._id} 
              notification={notification} 
              onClick={onClose}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <BellOff className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 font-medium">No new notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Link
        href="/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all duration-300 border-t border-white/5 group"
      >
        View All Notifications
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
}
