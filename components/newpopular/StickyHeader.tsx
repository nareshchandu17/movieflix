"use client";

import { useState, useEffect } from "react";
import { Search, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const StickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled 
        ? 'bg-[#0B1020]/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
      }
    `}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E50914] to-[#ff2a2a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F9FAFB]">New & Popular</h1>
          </div>

          {/* Right: Search, Filter, Profile */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2236]"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1A2236]"
            >
              <Filter className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StickyHeader;
