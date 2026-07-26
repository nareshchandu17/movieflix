"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import ProfileSwitcher from "./ProfileSwitcher";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleNavbar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Hamburger Button */}
      <div className="md:hidden ml-2">
        <button
          onClick={toggleNavbar}
          type="button"
          className="inline-flex items-center justify-center p-2 text-white hover:text-primary hover:bg-gray-800/50 rounded-lg transition-all duration-200 focus:outline-none"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {!isOpen ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-md border-t border-gray-800/50 md:hidden shadow-2xl">
          {/* Profile Section for Mobile */}
          <div className="pt-4 pb-2 border-b border-gray-800/50">
            <div className="px-8 flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Profiles</span>
              <ProfileSwitcher />
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            {[
              { href: "/", label: "Home" },
              { href: "/movie", label: "Movies" },
              { href: "/series", label: "Series" },
              { href: "/new-popular", label: "New & Popular" },
              { href: "/my-list", label: "My List" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-4 px-6 text-base font-medium text-white hover:text-primary hover:bg-white/5 rounded-xl transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
export default MobileMenu;
