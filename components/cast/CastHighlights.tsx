"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBPersonCombinedCredits, TMDBCastCredit } from '@/features/shared/types';
import { Star, TrendingUp, CalendarDays } from 'lucide-react';

interface CastHighlightsProps {
  credits?: TMDBPersonCombinedCredits;
}

export function CastHighlights({ credits }: CastHighlightsProps) {
  const highlights = useMemo(() => {
    if (!credits || credits.cast.length === 0) return [];

    const cast = [...credits.cast].filter(c => c.poster_path); // Need images for highlights

    if (cast.length === 0) return [];

    // Highest Rated (min 100 votes to avoid outliers)
    const highestRated = [...cast]
      .filter(c => c.vote_count > 100)
      .sort((a, b) => b.vote_average - a.vote_average)[0];

    // Most Popular
    const mostPopular = [...cast]
      .sort((a, b) => b.popularity - a.popularity)[0];

    // Earliest Project (Debut/Early Career)
    const earliest = [...cast]
      .filter(c => c.release_date || c.first_air_date)
      .sort((a, b) => {
        const dateA = new Date((a.release_date || a.first_air_date) as string).getTime();
        const dateB = new Date((b.release_date || b.first_air_date) as string).getTime();
        return dateA - dateB;
      })[0];

    const items: { title: string; icon: JSX.Element; credit: TMDBCastCredit; value: string }[] = [];

    if (highestRated) {
      items.push({
        title: 'Highest Rated',
        icon: <Star className="w-5 h-5 text-yellow-500" />,
        credit: highestRated,
        value: `${highestRated.vote_average.toFixed(1)} / 10`
      });
    }

    if (mostPopular && mostPopular.id !== highestRated?.id) {
      items.push({
        title: 'Most Popular',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        credit: mostPopular,
        value: 'Global Hit'
      });
    }

    if (earliest && earliest.id !== highestRated?.id && earliest.id !== mostPopular?.id) {
      const year = new Date((earliest.release_date || earliest.first_air_date) as string).getFullYear();
      items.push({
        title: 'Early Career',
        icon: <CalendarDays className="w-5 h-5 text-blue-500" />,
        credit: earliest,
        value: `Released in ${year}`
      });
    }

    return items;
  }, [credits]);

  if (highlights.length === 0) return null;

  return (
    <section className="py-12 bg-black border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Career Highlights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => (
            <Link 
              key={idx} 
              href={`/${item.credit.media_type}/${item.credit.id}`}
              className="flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/80 p-4 rounded-xl border border-zinc-800 transition-all duration-300 group"
            >
              <div className="w-16 h-24 relative rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={`https://image.tmdb.org/t/p/w200${item.credit.poster_path}`}
                  alt={item.credit.title || item.credit.name || 'Highlight'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  {item.icon}
                  <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{item.title}</span>
                </div>
                <h3 className="text-white font-semibold line-clamp-1 group-hover:text-red-500 transition-colors">
                  {item.credit.title || item.credit.name}
                </h3>
                <p className="text-zinc-500 text-sm mt-1">{item.value}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
