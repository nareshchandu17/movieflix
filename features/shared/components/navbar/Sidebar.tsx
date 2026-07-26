"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Film, 
  Tv, 
  Brain, 
  Flame, 
  Star, 
  Clapperboard, 
  Smartphone, 
  User, 
  Settings, 
  LogOut,
  Search 
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "MAIN",
    items: [
      { id: "home", label: "Home", icon: Home, href: "/" },
      { id: "search", label: "Search", icon: Search, href: "/search" },
      { id: "movies", label: "Movies", icon: Film, href: "/movie" },
      { id: "series", label: "Series", icon: Tv, href: "/series" },
    ]
  },
  {
    title: "DISCOVERY",
    items: [
      { id: "mood", label: "AI Mood", icon: Brain, href: "/ai-mood" },
      { id: "popular", label: "New & Popular", icon: Flame, href: "/new-popular" },
      { id: "mylist", label: "My List", icon: Star, href: "/my-list" },
      { id: "scenes", label: "Scenes", icon: Clapperboard, href: "/scenes" },
      { id: "reactions", label: "Fan Reactions", icon: Smartphone, href: "/fan-reactions" },
    ]
  }
];



const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Cleanup closeTimeout on unmount to prevent memory leak
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isExpanded) {
      // Show labels after sidebar expansion starts
      const labelsTimeout = setTimeout(() => setShowLabels(true), 100);
      return () => clearTimeout(labelsTimeout);
    } else {
      // Fade labels during shrink, not before
      const labelsTimeout = setTimeout(() => setShowLabels(false), 50);
      return () => clearTimeout(labelsTimeout);
    }
  }, [isExpanded]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 150);
  };

  if (!mounted || status !== "authenticated") return null;

  return (
    <motion.aside
      initial={{ width: 72 }}
      animate={{ width: isExpanded ? 260 : 72 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      transition={{
        type: "tween",
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={cn(
        "fixed left-0 top-0 h-screen z-[1200] hidden md:flex flex-col",
        "bg-black/60 backdrop-blur-2xl border-r border-white/5"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6">
        <Link href="/" className="flex items-center group/logo">
          <div className="relative flex items-center">
            <motion.span
              animate={{ opacity: isExpanded ? 0 : 1, x: isExpanded ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-4xl font-black italic text-red-600 drop-shadow-[0_0_15px_rgba(229,9,20,0.8)] tracking-tighter"
            >
              M
            </motion.span>
            
            <motion.span
              animate={{ opacity: showLabels ? 1 : 0, x: showLabels ? 0 : -10 }}
              transition={{ duration: 0.2, delay: showLabels ? 0.05 : 0 }}
              className="text-2xl font-black italic text-red-600 drop-shadow-[0_0_15px_rgba(229,9,20,0.8)] tracking-tighter whitespace-nowrap"
            >
              MOVIEFLIX
            </motion.span>
          </div>
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-4 px-3 space-y-8">
            {sections.map((section, sectionIndex) => (
          <div key={section.title} className="space-y-2">
            <motion.h3
              animate={{ opacity: showLabels ? 0.5 : 0, x: showLabels ? 0 : -10 }}
              transition={{ duration: 0.2, delay: showLabels ? 0.08 + sectionIndex * 0.05 : 0 }}
              className="px-4 text-[10px] font-bold tracking-[0.2em] text-white/50"
            >
              — {section.title}
            </motion.h3>

            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <SidebarItem 
                  key={item.id} 
                  item={item} 
                  isExpanded={showLabels} 
                  pathname={pathname ?? ""}
                  delay={showLabels ? 0.12 + sectionIndex * 0.05 + itemIndex * 0.03 : 0}
                  isFullyCollapsed={!isExpanded}
                />
              ))}
            </div>
          </div>
        ))}
      </div>


    </motion.aside>
  );
};

const SidebarItem = ({ item, isExpanded, pathname, delay, isFullyCollapsed }: { item: any, isExpanded: boolean, pathname: string, delay?: number, isFullyCollapsed?: boolean }) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group/item",
        "hover:translate-x-1 hover:bg-white/5",
        isActive ? "text-red-500 bg-red-500/5" : "text-white/40 hover:text-white"
      )}
    >
      {/* Motion Indicator (Animated vertical line) */}
      {isActive && (
        <motion.div
          layoutId="sidebarIndicator"
          className="absolute left-0 w-1 h-6 bg-red-600 rounded-r-full shadow-[0_0_12px_rgba(229,9,20,0.8)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon with upgrade */}
      <div className="relative flex-shrink-0">
        <Icon className={cn(
          "w-6 h-6 transition-all duration-300",
          isActive ? "text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "opacity-60 group-hover/item:opacity-100 group-hover/item:scale-110"
        )} />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </div>

      {/* Label with animation */}
      <motion.span
        animate={{ 
          opacity: isExpanded ? 1 : 0, 
          x: isExpanded ? 0 : -10,
          maxWidth: isExpanded ? 200 : 0
        }}
        transition={{ duration: 0.2, delay: isExpanded ? delay : 0 }}
        className="text-sm font-medium whitespace-nowrap overflow-hidden"
      >
        {item.label}
      </motion.span>

      {/* Tooltip for Collapsed State - Only show when fully collapsed */}
      {isFullyCollapsed && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[1300] shadow-xl">
          {item.label}
        </div>
      )}
    </Link>
  );
};

export default Sidebar;
