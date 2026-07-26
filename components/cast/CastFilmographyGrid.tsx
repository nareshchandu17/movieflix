"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBPersonCombinedCredits, TMDBCastCredit } from '@/features/shared/types';
import { Button } from '@/components/ui/button';
import { Play, ArrowDownWideNarrow } from 'lucide-react';

interface CastFilmographyGridProps {
  credits?: TMDBPersonCombinedCredits;
}

type SortOption = 'popularity' | 'newest' | 'oldest' | 'rating' | 'alphabetical' | 'role';

export function CastFilmographyGrid({ credits }: CastFilmographyGridProps) {
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');

  const filteredCredits = useMemo(() => {
    if (!credits || credits.cast.length === 0) return [];
    
    // Deduplicate by ID just in case
    const unique = new Map<number, TMDBCastCredit>();
    credits.cast.forEach(c => unique.set(c.id, c));
    
    let items = Array.from(unique.values());
    
    if (filter !== 'all') {
      items = items.filter(c => c.media_type === filter);
    }
    
    return items.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'newest': {
          const dateA = new Date((a.release_date || a.first_air_date) as string).getTime() || 0;
          const dateB = new Date((b.release_date || b.first_air_date) as string).getTime() || 0;
          return dateB - dateA;
        }
        case 'oldest': {
          const dateA = new Date((a.release_date || a.first_air_date) as string).getTime() || Infinity;
          const dateB = new Date((b.release_date || b.first_air_date) as string).getTime() || Infinity;
          return dateA - dateB;
        }
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'alphabetical':
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          return titleA.localeCompare(titleB);
        case 'role': {
          // Put standard acting roles first, then Cameo, then Self/Uncredited
          const charA = (a.character || '').toLowerCase();
          const charB = (b.character || '').toLowerCase();
          
          const getRoleScore = (c: string) => {
            if (!c || c.includes('uncredited')) return 3;
            if (c.includes('self') || c.includes('himself') || c.includes('herself') || c.includes('narrator')) return 2;
            if (c.includes('cameo')) return 1;
            return 0;
          };
          
          const scoreA = getRoleScore(charA);
          const scoreB = getRoleScore(charB);
          
          if (scoreA !== scoreB) return scoreA - scoreB;
          return b.popularity - a.popularity; // Tie-breaker
        }
        default:
          return 0;
      }
    });
  }, [credits, filter, sortBy]);

  if (!credits || credits.cast.length === 0) return null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Full Filmography</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            {/* Filter */}
            <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 md:px-6 transition-colors ${filter === 'all' ? 'bg-white text-black hover:bg-zinc-200' : 'text-zinc-400 hover:text-white'}`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter('movie')}
                className={`rounded-full px-4 md:px-6 transition-colors ${filter === 'movie' ? 'bg-white text-black hover:bg-zinc-200' : 'text-zinc-400 hover:text-white'}`}
              >
                Movies
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilter('tv')}
                className={`rounded-full px-4 md:px-6 transition-colors ${filter === 'tv' ? 'bg-white text-black hover:bg-zinc-200' : 'text-zinc-400 hover:text-white'}`}
              >
                TV
              </Button>
            </div>

            {/* Sort */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <ArrowDownWideNarrow className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-full focus:ring-red-500 focus:border-red-500 block w-full pl-10 pr-10 py-2.5 transition-colors hover:text-white hover:border-zinc-700 cursor-pointer outline-none"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="rating">Sort by Rating</option>
                <option value="alphabetical">Sort Alphabetically</option>
                <option value="role">Sort by Role Type</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div data-testid="filmography-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredCredits.map((item, idx) => (
            <Link 
              key={`${item.id}-${idx}`} 
              href={`/${item.media_type}/${item.id}`}
              className="group relative flex flex-col gap-3 rounded-lg overflow-hidden transition-all hover:scale-105 duration-300"
            >
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg border border-white/5 group-hover:border-white/20 bg-zinc-900">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name || 'Poster'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
                    <span className="text-sm font-medium">{item.title || item.name}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  {item.vote_average > 0 && (
                    <div className="bg-black/60 px-2 py-1 rounded flex items-center gap-1 text-xs text-white backdrop-blur-md">
                      <span className="text-yellow-500">★</span> {item.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm md:text-base font-medium text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                  {item.title || item.name}
                </p>
                {item.character && (
                  <p className="text-xs text-zinc-500 line-clamp-1">as {item.character}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
