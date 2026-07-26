"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBPerson } from '@/features/shared/types';
import { Play } from 'lucide-react';

interface CastKnownForProps {
  person: TMDBPerson;
}

export function CastKnownFor({ person }: CastKnownForProps) {
  if (!person.known_for || person.known_for.length === 0) return null;

  const topKnownFor = person.known_for.slice(0, 4);

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Known For</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {topKnownFor.map((item) => (
            <Link 
              key={item.id} 
              href={`/${item.title ? 'movie' : 'tv'}/${item.id}`}
              className="group relative flex flex-col gap-3 rounded-lg overflow-hidden transition-all hover:scale-105 duration-300"
            >
              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg border border-white/5 group-hover:border-white/20">
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name || 'Unknown'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500 text-sm italic">
                    No Poster
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
              <p className="text-sm md:text-base font-medium text-white truncate px-1">
                {item.title || item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
