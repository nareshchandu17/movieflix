"use client";

import React, { useMemo } from 'react';
import { TMDBPerson, TMDBPersonCombinedCredits } from '@/features/shared/types';
import { differenceInYears } from 'date-fns';

interface CastStatsStripProps {
  person: TMDBPerson;
  credits?: TMDBPersonCombinedCredits;
}

export function CastStatsStrip({ person, credits }: CastStatsStripProps) {
  const stats = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    
    if (credits && credits.cast.length > 0) {
      // 1. Total Projects
      items.push({ label: 'Projects', value: credits.cast.length.toString() });

      // 2. Years Active
      const dates = credits.cast
        .map(c => c.release_date || c.first_air_date)
        .filter(Boolean)
        .map(d => new Date(d as string).getTime())
        .sort((a, b) => a - b);
        
      if (dates.length > 0) {
        const first = new Date(dates[0]);
        const last = new Date(dates[dates.length - 1]);
        const years = differenceInYears(last, first);
        if (years > 0) {
          items.push({ label: 'Years Active', value: years.toString() });
        }
      }

      // 3. Avg Rating (only for projects with enough votes)
      const validRatings = credits.cast.filter(c => c.vote_count > 100 && c.vote_average > 0);
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((acc, curr) => acc + curr.vote_average, 0);
        const avg = (sum / validRatings.length).toFixed(1);
        items.push({ label: 'Avg Rating', value: avg });
      }
    }

    // 4. Popularity
    if (person.popularity) {
      const percentile = person.popularity > 100 ? 'Top 1%' : person.popularity > 50 ? 'Top 5%' : 'Top 10%';
      items.push({ label: 'Popularity', value: percentile });
    }

    return items;
  }, [credits, person]);

  if (stats.length === 0) return null;

  return (
    <div className="w-full bg-zinc-900 border-y border-zinc-800 py-6 md:py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center">
              <span className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1">
                {stat.value}
              </span>
              <span className="text-sm md:text-base text-zinc-400 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
