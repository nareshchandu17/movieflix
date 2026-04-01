"use client";

import Link from "next/link";
import { LogOut, User, Settings, Sparkles, PlayCircle, Loader2 } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import SmartSearchNew from "@/components/search/SmartSearch";
import { useState, useEffect, useRef } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { useSession, signOut } from "next-auth/react";
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal";

const Header = () => {
  const { data: session, status } = useSession();
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

      // Add glass background after slight scroll
      setScrolled(currentScrollY > 40);

      // Hide on scroll down, show on scroll up (but stay visible if searching)
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
        ${hidden ? "-translate-y-full" : isSearching ? "translate-y-0" : "translate-y-0"}
        ${scrolled || isSearching
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-14"
          : "bg-transparent h-20"
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

          {/* Profile Section */}
          {isSignedIn ? (
            /* Profile Dropdown */
            <div className="relative group hidden sm:block">
              <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition duration-300 overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-semibold uppercase">
                    {session?.user?.name ? session.user.name.substring(0, 2) : "MF"}
                  </span>
                )}
              </div>

              <div className="absolute right-0 mt-3 w-52 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl">
                <div className="p-2 text-sm text-white/80">
                  <button
                    onClick={() => window.location.href = '/taste-dna'}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group w-full text-left"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">

                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      Your Taste DNA
                    </span>
                  </button>
                  <Link
                    href="/for-you"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
                      <Sparkles size={16} />
                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      For You
                    </span>
                  </Link>
                  <Link
                    href="/downloads"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      Downloads
                    </span>
                  </Link>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
                      <User size={16} />
                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      Account
                    </span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
                      <Settings size={16} />
                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      Settings
                    </span>
                  </Link>

                  {/* Separator line */}
                  <div className="my-2 border-t border-white/10"></div>

                  {/* Sign Out */}
                  <button
                    onClick={async () => {
                      setIsLoggingOut(true);
                      await signOut({ redirect: false });
                      setIsLoggingOut(false);
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group w-full text-left"
                  >
                    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
                      {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    </span>
                    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
                      {isLoggingOut ? "Signing Out..." : "Sign Out"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Start Watching Button */
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/25 group"
            >
              {/* Multi-color gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-pink-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-400 to-pink-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

              {/* Glowing effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 rounded-lg opacity-30 blur-sm group-hover:opacity-50 group-hover:blur-md transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-pink-400 rounded-lg opacity-0 group-hover:opacity-20 blur-lg group-hover:animate-pulse transition-all duration-300"></div>

              {/* Button content */}
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

const MenuItem = ({ href, icon, label }: any) => (
  <Link
    href={href}
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
  >
    <span className="text-white/80 group-hover:text-red-500 transition-colors duration-300">
      {icon}
    </span>
    <span className="text-white/80 group-hover:text-red-400 transition-colors duration-300">
      {label}
    </span>
  </Link>
);

export default Header;
