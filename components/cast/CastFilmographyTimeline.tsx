"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { TMDBPersonCombinedCredits } from '@/features/shared/types';
import { Button } from '@/components/ui/button';
import { ArrowDownAZ, ArrowUpAZ, Monitor, Film, ChevronDown, ChevronUp } from 'lucide-react';

interface CastFilmographyTimelineProps {
  credits?: TMDBPersonCombinedCredits;
}

export function CastFilmographyTimeline({ credits }: CastFilmographyTimelineProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());

  const timelineData = useMemo(() => {
    if (!credits || credits.cast.length === 0) return [];

    const processed = credits.cast.map(c => {
      const dateStr = c.release_date || c.first_air_date;
      const year = dateStr ? new Date(dateStr as string).getFullYear() : 'Upcoming';
      return { ...c, year };
    });

    const sorted = processed.sort((a, b) => {
      if (a.year === 'Upcoming') return sortOrder === 'desc' ? -1 : 1;
      if (b.year === 'Upcoming') return sortOrder === 'desc' ? 1 : -1;
      return sortOrder === 'desc' 
        ? (b.year as number) - (a.year as number) 
        : (a.year as number) - (b.year as number);
    });

    const grouped = sorted.reduce((acc, curr) => {
      const y = curr.year.toString();
      if (!acc[y]) acc[y] = [];
      acc[y].push(curr);
      return acc;
    }, {} as Record<string, typeof processed>);

    return Object.entries(grouped).map(([year, items]) => ({
      year,
      items
    }));
  }, [credits, sortOrder]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  if (timelineData.length === 0) return null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl mx-0 md:mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Acting Timeline</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="text-zinc-400 hover:text-white"
          >
            {sortOrder === 'desc' ? <ArrowDownAZ className="w-5 h-5" /> : <ArrowUpAZ className="w-5 h-5" />}
            <span className="ml-2 hidden sm:inline">
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </span>
          </Button>
        </div>
        
        <div className="relative border-l-2 border-zinc-800 ml-3 md:ml-0 md:pl-0">
          {timelineData.map((group, groupIdx) => {
            const isExpanded = expandedYears.has(group.year);

            return (
              <div key={groupIdx} className="mb-6 pl-6 md:pl-10 relative group/timeline">
                <div className="absolute -left-[9px] md:-left-[41px] top-1.5 w-4 h-4 rounded-full bg-zinc-800 group-hover/timeline:bg-red-600 ring-4 ring-black transition-colors" />
                
                <button 
                  onClick={() => toggleYear(group.year)}
                  className="w-full flex items-center justify-between text-left -mt-1 group/btn hover:bg-zinc-900/50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white group-hover/btn:text-red-500 transition-colors">
                      {group.year}
                    </h3>
                    <span className="text-zinc-500 text-sm font-medium">
                      {group.items.length} {group.items.length === 1 ? 'title' : 'titles'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400 group-hover/btn:text-white" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400 group-hover/btn:text-white" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="flex flex-col gap-2 mt-4 ml-2">
                    {group.items.map((item, idx) => (
                      <Link 
                        key={`${item.id}-${idx}`}
                        href={`/${item.media_type}/${item.id}`}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 transition-colors group/item"
                      >
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {item.media_type === 'movie' ? (
                            <Film className="w-4 h-4 text-zinc-500 group-hover/item:text-red-500 transition-colors" />
                          ) : (
                            <Monitor className="w-4 h-4 text-zinc-500 group-hover/item:text-red-500 transition-colors" />
                          )}
                          <span className="text-white font-medium group-hover/item:text-red-400 transition-colors">
                            {item.title || item.name}
                          </span>
                        </div>
                        {item.character && (
                          <>
                            <span className="hidden sm:inline text-zinc-700">as</span>
                            <span className="text-zinc-400 text-sm sm:text-base line-clamp-1">
                              {item.character}
                            </span>
                          </>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
