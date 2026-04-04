"use client";

import Header from "@/components/navbar/Header";
import Footer from "@/components/footer/Footer";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useState } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isWatchPartyPage = pathname?.startsWith('/watch-party');
  const isWatchPage = pathname?.startsWith('/watch/');
  const isMoviePage = pathname?.startsWith('/movie/');
  const isSeriesPage = pathname?.startsWith('/series/');
  const isCastInfoPage = pathname?.includes('/info');
  const isForYouPage = pathname?.startsWith('/for-you');
  const isAccountPage = pathname?.startsWith('/account');
  const isDownloadsPage = pathname?.startsWith('/downloads');
  const { isSearching, searchQuery } = useSearch();
  const [mounted, setMounted] = useState(false);
  
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
        {!isWatchPartyPage && !isWatchPage && !isMoviePage && !isSeriesPage && !isCastInfoPage && !isForYouPage && !isAccountPage && !isDownloadsPage && <Header />}
        <main className={cn(
          "transition-all duration-700",
          mounted && showDeepOverlay ? "blur-xl scale-[0.97] opacity-20 pointer-events-none" : "blur-0 scale-100 opacity-100"
        )}>
          {children}
        </main>
        {!isWatchPartyPage && !isWatchPage && !isMoviePage && !isSeriesPage && !isCastInfoPage && !isForYouPage && !isAccountPage && !isDownloadsPage && <Footer />}
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
}
