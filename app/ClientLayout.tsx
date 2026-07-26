"use client";

import Header from "@/features/shared/components/navbar/Header";
import Footer from "@/features/shared/components/footer/Footer";
import Sidebar from "@/features/shared/components/navbar/Sidebar";
import MobileNav from "@/features/shared/components/navbar/MobileNav";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSearch } from "@/features/search/components/SearchContext";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import NotificationListener from "@/features/settings/components/notifications/NotificationListener";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const isWatchPartyPage = pathname?.startsWith('/watch-party');
  const isWatchPage = pathname?.startsWith('/watch/');
  const isMoviePage = pathname?.startsWith('/movie/');
  const isSeriesPage = pathname?.startsWith('/series/');
  const isCastInfoPage = pathname?.includes('/info');
  const isAccountPage = pathname?.startsWith('/account');
  const isDownloadsPage = pathname?.startsWith('/downloads');
  const isProfilesPage = pathname?.startsWith('/profiles');
  const { isSearching, searchQuery } = useSearch();
  const [mounted, setMounted] = useState(false);
  
  const isAuthenticated = status === "authenticated";
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const showDeepOverlay = mounted && isSearching && searchQuery.length > 0;
  
  return (
    <>
      {/* Background Overlay Layer */}
      <div 
        className={cn(
          "fixed inset-0 z-[80] transition-all duration-700 ease-in-out",
          mounted && showDeepOverlay 
            ? "bg-black/90 backdrop-blur-2xl opacity-100" 
            : mounted && isSearching
              ? "bg-black/40 backdrop-blur-sm opacity-100"
              : "bg-transparent opacity-0 pointer-events-none"
        )} 
      />

      <div className="min-h-screen relative z-[90]">
        {/* Sidebar for Desktop */}
        {!isWatchPartyPage && !isWatchPage && !isProfilesPage && <Sidebar />}

        <main className={cn(
          "transition-all duration-500",
          mounted && isAuthenticated && !isWatchPage && !isWatchPartyPage && !isProfilesPage && "md:pl-[72px]", // Only offset if not in a full-screen player
          mounted && showDeepOverlay 
            ? "blur-xl scale-[0.97] opacity-20 pointer-events-none" 
            : "opacity-100"
        )}>
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        {!isWatchPartyPage && !isWatchPage && <MobileNav />}

        {!isWatchPartyPage && !isWatchPage && !isMoviePage && !isSeriesPage && !isCastInfoPage && !isDownloadsPage && !isProfilesPage && <Footer />}
        
        {/* Header moved after main to guarantee highest stacking context priority */}
        {!isWatchPartyPage && !isWatchPage && !isMoviePage && !isSeriesPage && !isCastInfoPage && !isDownloadsPage && !isProfilesPage && <Header />}
        
        <NotificationListener />
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
}
