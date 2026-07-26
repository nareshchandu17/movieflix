"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TMDBPerson, TMDBPersonImages, TMDBPersonCombinedCredits } from '@/features/shared/types';
import { extractAverageColorFromImage, generateDeterministicPalette } from '@/lib/color-utils';
import { Play, Plus, Share2, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CastHeroProps {
  person: TMDBPerson;
  credits?: TMDBPersonCombinedCredits;
  images?: TMDBPersonImages;
}

export function CastHero({ person, credits, images }: CastHeroProps) {
  const [colors, setColors] = useState(generateDeterministicPalette(person.id));
  
  const topCredits = React.useMemo(() => {
    if (!credits) return [];
    return [...credits.cast]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);
  }, [credits]);
  
  // Use the first profile image as the fallback backdrop if they don't have tagged images
  const primaryImage = person.profile_path;
  
  useEffect(() => {
    async function loadColors() {
      if (primaryImage) {
        const extracted = await extractAverageColorFromImage(primaryImage, person.id);
        setColors(extracted);
      }
    }
    loadColors();
  }, [primaryImage, person.id]);

  return (
    <div className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end pb-12 overflow-hidden bg-black pt-24 md:pt-32">
      {/* Background with dynamic gradient or backdrop */}
      <div className="absolute inset-0 z-0">
        {person.profile_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/original${person.profile_path}`}
            alt="Backdrop"
            fill
            className="object-cover object-top opacity-30 blur-3xl scale-125"
            priority
          />
        ) : (
          <div 
            className="absolute inset-0 opacity-40 transition-colors duration-1000 ease-in-out"
            style={{ background: colors.gradient }}
          />
        )}
      </div>
      
      {/* Subtle overlay gradient to merge with the background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10 hidden md:block" />

      <div className="container mx-auto px-4 md:px-8 relative z-20">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
          
          {/* Profile Image (Poster style) */}
          <div className="w-48 md:w-64 lg:w-72 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10 bg-zinc-900 flex flex-col items-center justify-center text-center p-4"
               style={{ boxShadow: `0 25px 50px -12px ${colors.background}` }}>
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w780${person.profile_path}`}
                alt={person.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-zinc-500 font-medium text-sm md:text-base" data-testid="fallback-profile">
                {person.name}<br/>(No Image)
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col flex-grow text-center md:text-left pt-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 tracking-tight drop-shadow-md flex items-center justify-center md:justify-start gap-3">
              {person.name}
              <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-500 fill-blue-500/20" />
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4 drop-shadow">
              {person.known_for_department}
            </p>
            
            {topCredits.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                {topCredits.map(credit => (
                  <Link
                    key={credit.credit_id}
                    href={`/${credit.media_type}/${credit.id}`}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-white transition-colors backdrop-blur-md"
                  >
                    {credit.title || credit.name}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 text-white font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play Latest
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Follow
              </Button>

              <Button 
                size="icon" 
                variant="ghost" 
                className="rounded-full w-12 h-12 bg-white/5 hover:bg-white/20 border-white/10 backdrop-blur-md text-white transition-all"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
