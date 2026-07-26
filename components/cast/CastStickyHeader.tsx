"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TMDBPerson } from '@/features/shared/types';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface CastStickyHeaderProps {
  person: TMDBPerson;
}

export function CastStickyHeader({ person }: CastStickyHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header after scrolling past a certain point (e.g. 50vh)
      const scrollPosition = window.scrollY;
      const threshold = window.innerHeight * 0.5;
      
      setIsVisible(scrollPosition > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const profileUrl = person.profile_path 
    ? `https://image.tmdb.org/t/p/w154${person.profile_path}`
    : null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between pt-14 md:pt-0"> 
        {/* Note: In NextJS with a global navbar, we might need to adjust top spacing or z-index */}
        <div className="flex items-center gap-4">
            <div className="w-12 h-16 md:w-16 md:h-24 relative rounded-md overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] text-zinc-600 font-medium">No Img</span>
              )}
            </div>
          <h2 className="text-lg md:text-xl font-bold text-white truncate max-w-[200px] md:max-w-[300px]">
            {person.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all px-4 md:px-6"
          >
            <Play className="w-4 h-4 mr-2 fill-current hidden sm:block" />
            <span className="hidden sm:block">Play Latest</span>
            <span className="sm:hidden">Play</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
