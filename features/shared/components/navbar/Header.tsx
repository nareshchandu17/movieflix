"use client";

import Link from "next/link";
import { LogOut, PlayCircle, Loader2, Download, User } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SmartSearchNew from "@/features/search/components/search/SmartSearch";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/features/search/components/SearchContext";
import { useSession, signOut } from "next-auth/react";
import { GoogleAuthModal } from "@/features/authentication/components/auth/GoogleAuthModal";
import ProfileSwitcher from "./ProfileSwitcher";
import { useProfile } from "@/features/profile/components/ProfileContext";
import NotificationBell from "@/features/settings/components/notifications/NotificationBell";

const Header = () => {
  const { data: session, status } = useSession();
  const { activeProfile } = useProfile();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isSearching } = useSearch();
  const isSignedIn = status === "authenticated";
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      // Hide on scroll down, show on scroll up
      if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;

      // Also reveal header when user stops scrolling
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsHidden(false);
      }, 800);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [isSearching]);

  return (
    <nav
      className={`
        fixed top-0 z-[1100]
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isHidden ? "-translate-y-full" : "translate-y-0"}
        ${scrolled || isSearching
          ? "bg-black/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl h-20"
          : "bg-gradient-to-b from-black/95 via-black/50 to-transparent h-20"
        }
        ${isSignedIn && isClient ? "lg:left-[72px] lg:w-[calc(100%-72px)] w-full left-0" : "w-full left-0"}
      `}
    >
      <div className="w-full px-6 md:px-12 lg:px-16 flex items-center justify-between h-full">
        {/* Logo - Far Left */}
        {(!isClient || !isSignedIn) && (
          <div className="flex-1 flex justify-start">
            <Logo />
          </div>
        )}

        {/* Desktop Nav - Perfectly Centered */}
        {(!isClient || !isSignedIn) && (
          <div className="hidden lg:flex items-center justify-center gap-10">
            {[
              { href: "/movie", label: "Movies" },
              { href: "/series", label: "Series" },
              { href: "/ai-mood", label: "AI Mood" },
              { href: "/new-popular", label: "New & Popular" },
              { href: "/my-list", label: "My List" },
              { href: "/scenes", label: "Scenes" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-white/90 hover:text-white text-[15px] font-semibold tracking-wide transition-all duration-300 group py-2"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-white to-white/40 transition-all duration-300 group-hover:w-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
              </Link>
            ))}
          </div>
        )}

        {/* Right Section - Far Right */}
        <div className="flex-1 flex items-center justify-end gap-8">
          {/* Search removed from Header */}

          {/* Bell Icon */}
          {isSignedIn && isClient && <NotificationBell />}

          {/* Profile Section */}
          {isSignedIn && isClient ? (
            <div className="flex items-center">
              <ProfileSwitcher />
            </div>
          ) : isClient && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-pink-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 rounded-lg opacity-30 blur-sm group-hover:opacity-50 group-hover:blur-md transition-all duration-300"></div>
              <span className="relative z-10 text-white font-medium tracking-wide flex items-center gap-2">
                Start Watching
                <PlayCircle className="w-4 h-4" />
              </span>
            </button>
          )}

          {/* Mobile Menu Removed as requested */}
        </div>
      </div>
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Header;

