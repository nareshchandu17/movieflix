"use client";

import React, { useMemo } from 'react';
import { TMDBPersonCombinedCredits } from '@/features/shared/types';

interface CastGenresProps {
  credits?: TMDBPersonCombinedCredits;
}

// TMDB Genre Mapping (since credits only give genre_ids)
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

export function CastGenres({ credits }: CastGenresProps) {
  const topGenres = useMemo(() => {
    if (!credits || credits.cast.length === 0) return [];
    
    const genreCounts: Record<number, number> = {};
    let totalCount = 0;

    credits.cast.forEach(item => {
      if (item.genre_ids) {
        item.genre_ids.forEach(id => {
          genreCounts[id] = (genreCounts[id] || 0) + 1;
          totalCount++;
        });
      }
    });

    if (totalCount === 0) return [];

    return Object.entries(genreCounts)
      .map(([id, count]) => ({
        id: Number(id),
        name: GENRE_MAP[Number(id)] || 'Unknown',
        count,
        percentage: Math.round((count / totalCount) * 100)
      }))
      .filter(g => g.name !== 'Unknown')
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [credits]);

  if (topGenres.length === 0) return null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Genres</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {topGenres.map(genre => (
            <div key={genre.id} className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-zinc-300 font-medium">{genre.name}</span>
                <span className="text-zinc-500 text-sm">{genre.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 rounded-full transition-all duration-1000"
                  style={{ width: `${genre.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
