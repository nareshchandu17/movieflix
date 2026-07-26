"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { BellRing } from "@/features/shared/components/navbar/BellRing";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleAlert = () => {
      setIsRinging(true);
      // Reset ringing state after 1.5 seconds (the duration of 3 reverse shakes)
      timer = setTimeout(() => {
        setIsRinging(false);
      }, 1500);
    };

    window.addEventListener("new-notification-received", handleAlert);
    return () => {
      window.removeEventListener("new-notification-received", handleAlert);
      if (timer) clearTimeout(timer);
    };
  }, []);

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
        <BellRing
          className={`transition-colors ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-white"}`}
          width={22}
          height={22}
          isAnimating={isRinging}
        />

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

