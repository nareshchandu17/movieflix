"use client";

import Link from "next/link";
import { LogOut, PlayCircle, Loader2, Download, User } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SmartSearchNew from "@/components/search/SmartSearch";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { useSession, signOut } from "next-auth/react";
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal";
import ProfileSwitcher from "./ProfileSwitcher";
import { useProfile } from "@/contexts/ProfileContext";
import NotificationBell from "../notifications/NotificationBell";

const Header = () => {
  const { data: session, status } = useSession();
  const { activeProfile } = useProfile();
  const [isClient, setIsClient] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isSearching } = useSearch();
  const isSignedIn = status === "authenticated";

  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100 && !isSearching) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearching]);

  return (
    <nav
      className={`
        fixed top-0 w-full z-[1100]
        transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${hidden ? "-translate-y-full" : "translate-y-0"}
        ${scrolled || isSearching
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-14"
          : "bg-gradient-to-b from-black/95 via-black/60 to-transparent h-20"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
          {[
            { href: "/movie", label: "Movies" },
            { href: "/series", label: "Series" },
            { href: "/mood-engine", label: "AI Mood" },
            { href: "/new-popular", label: "New & Popular" },
            { href: "/my-list", label: "My List" },
            { href: "/scenes", label: "Scenes" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-white/50 hover:text-white transition duration-300 group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gradient-to-r from-white/60 to-white/20 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-8">
          {/* Search */}
          {isClient && <SmartSearchNew />}

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
              className="relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 group"
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

          <MobileMenu />
        </div>
      </div>
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Header;
