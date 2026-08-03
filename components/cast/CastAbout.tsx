"use client";

import React, { useState, useMemo } from 'react';
import { TMDBPerson, TMDBPersonCombinedCredits } from '@/features/shared/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInYears } from 'date-fns';

interface CastAboutProps {
  person: TMDBPerson;
  credits?: TMDBPersonCombinedCredits;
}

export function CastAbout({ person, credits }: CastAboutProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    
    if (person.known_for_department) {
      items.push({ label: 'Occupation', value: person.known_for_department });
    }

    if (person.birthday) {
      const birthDate = new Date(person.birthday);
      const age = person.deathday 
        ? differenceInYears(new Date(person.deathday), birthDate)
        : differenceInYears(new Date(), birthDate);
      
      const formattedDate = birthDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      items.push({ label: 'Born', value: `${formattedDate} (Age ${age})` });
    }

    if (person.place_of_birth) {
      items.push({ label: 'Birth Place', value: person.place_of_birth });
    }

    if (credits && credits.cast && credits.cast.length > 0) {
      items.push({ label: 'Credits', value: credits.cast.length.toString() });

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
    }

    return items;
  }, [person, credits]);

  const bio = person.biography || '';
  const hasBiography = bio.trim() !== '';
  const paragraphs = hasBiography ? bio.split('\n').filter(p => p.trim() !== '') : [];
  const isLongBio = paragraphs.length > 2 || bio.length > 500;
  const displayParagraphs = expanded ? paragraphs : paragraphs.slice(0, 2);

  // If no stats and no biography, hide gracefully
  if (stats.length === 0 && !hasBiography) return null;

  return (
    <section className="py-12 bg-black text-white border-t border-zinc-900">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Quick Facts</h2>
        
        {stats.length > 0 && (
          <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6 mb-12 bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col flex-1 min-w-[120px]">
                <span className="text-xs md:text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">
                  {stat.label}
                </span>
                <span className="text-base md:text-lg font-bold text-white leading-tight">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {hasBiography && (
          <div className="relative">
            <h3 className="text-xl font-bold mb-4 text-zinc-100">About</h3>
            <div className={`space-y-4 text-zinc-300 leading-relaxed text-base md:text-lg relative ${!expanded && isLongBio ? 'pb-8' : ''}`}>
              {displayParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
              
              {!expanded && isLongBio && (
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
              )}
            </div>

            {isLongBio && (
              <div className="mt-4 flex justify-center md:justify-start">
                <Button 
                  variant="ghost" 
                  onClick={() => setExpanded(!expanded)}
                  className="text-white hover:text-red-500 bg-zinc-900 hover:bg-zinc-800 rounded-full px-6"
                >
                  {expanded ? (
                    <>Read Less <ChevronUp className="ml-2 w-4 h-4" /></>
                  ) : (
                    <>Read Full Biography <ChevronDown className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
