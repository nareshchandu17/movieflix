"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBPersonCombinedCredits } from '@/features/shared/types';
import { isAfter } from 'date-fns';

interface CastUpcomingProps {
  credits?: TMDBPersonCombinedCredits;
}

export function CastUpcoming({ credits }: CastUpcomingProps) {
  const upcoming = useMemo(() => {
    if (!credits || credits.cast.length === 0) return [];

    const today = new Date();

    return credits.cast
      .filter(c => {
        const dateStr = c.release_date || c.first_air_date;
        if (!dateStr) return false;
        
        // Some TMDB dates are empty strings or invalid
        const releaseDate = new Date(dateStr);
        if (isNaN(releaseDate.getTime())) return false;
        
        return isAfter(releaseDate, today);
      })
      .sort((a, b) => {
        const dateA = new Date((a.release_date || a.first_air_date) as string).getTime();
        const dateB = new Date((b.release_date || b.first_air_date) as string).getTime();
        return dateA - dateB; // Sort ascending by release date
      });
  }, [credits]);

  if (upcoming.length === 0) return null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Upcoming Releases</h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {upcoming.map((item, idx) => {
            const dateStr = item.release_date || item.first_air_date;
            const formattedDate = new Date(dateStr as string).toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            });

            return (
              <Link 
                key={`${item.id}-${idx}`} 
                href={`/${item.media_type}/${item.id}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                      alt={item.title || item.name || 'Upcoming Project'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                      <span className="text-sm font-medium uppercase">In Production</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/10">
                    {formattedDate}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-1 group-hover:text-red-500 transition-colors">
                    {item.title || item.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 mt-0.5 line-clamp-1">As {item.character || 'Unknown'}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
