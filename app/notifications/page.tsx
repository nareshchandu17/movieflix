"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useMemo } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Loader2, 
  Inbox,
  ArrowLeft
} from "lucide-react";
import { format, isToday, isYesterday, isAfter } from "date-fns";
import NotificationItem from "@/components/notifications/NotificationItem";
import { NotificationType } from "@/types/notifications";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  // 1. Fetching logic with Infinite Scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: async ({ pageParam = null }) => {
      const res = await fetch(`/api/notifications?limit=20${pageParam ? `&cursor=${pageParam}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });

  // 2. Mark all as read mutation
  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  // 3. Trigger next page load
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 4. Grouping logic
  const groupedNotifications = useMemo(() => {
    if (!data) return [];
    
    const all = data.pages.flatMap((page) => page.notifications);
    const groups: Record<string, any[]> = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    all.forEach((n) => {
      const date = new Date(n.createdAt);
      if (isToday(date)) groups.Today.push(n);
      else if (isYesterday(date)) groups.Yesterday.push(n);
      else groups.Older.push(n);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [data]);

  if (isError) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-black text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-zinc-400 mb-6">We couldn't load your notifications. Please try again.</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link 
            href="/browse" 
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Notifications
              <span className="text-zinc-600 font-medium">/ Hub</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Manage all your updates and reminders in one place</p>
          </div>
        </div>

        <button
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 disabled:opacity-50 group hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          {markAllRead.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          )}
          Mark all as read
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
            <p className="text-zinc-500 font-medium">Streaming your notifications...</p>
          </div>
        ) : groupedNotifications.length > 0 ? (
          groupedNotifications.map(([group, notifications]) => (
            <section key={group} className="space-y-4">
              <h2 className="text-lg font-black text-white/40 uppercase tracking-[0.2em] px-2">{group}</h2>
              <div className="grid grid-cols-1 gap-1">
                {notifications.map((n) => (
                  <NotificationItem key={n._id} notification={n} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 animate-pulse">
              <Inbox className="w-12 h-12 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your inbox is empty</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">
              You're all caught up! When you have new updates, they'll show up here.
            </p>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={ref} className="h-20 flex items-center justify-center">
          {isFetchingNextPage && <Loader2 className="w-6 h-6 text-red-600 animate-spin" />}
        </div>
      </div>
    </div>
  );
}
