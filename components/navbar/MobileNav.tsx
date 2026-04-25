"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Smartphone, 
  Star, 
  User 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const mobileItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "search", label: "Search", icon: Search, href: "/search" },
  { id: "reactions", label: "Reactions", icon: Smartphone, href: "/fan-reactions" },
  { id: "mylist", label: "My List", icon: Star, href: "/my-list" },
  { id: "profile", label: "Profile", icon: User, href: "/account" },
];

const MobileNav = () => {
  const pathname = usePathname();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "authenticated") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-[1200] lg:hidden flex items-center justify-around px-2">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full relative transition-colors duration-300",
              isActive ? "text-red-500" : "text-white/40"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute top-0 w-8 h-1 bg-red-600 rounded-b-full shadow-[0_0_10px_rgba(229,9,20,0.6)]"
              />
            )}
            <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
