"use client";
import React, { useState, useMemo } from "react";
import { SearchResult } from "@/features/search/components/search/SmartSearch";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import EnhancedMediaCard from "@/features/shared/components/display/EnhancedMediaCard";
import { Play, Star, Calendar, Clock, TrendingUp, Film, Tv, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PremiumSearchDisplayProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
  actor?: {
    id: number;
    name: string;
    profile_path: string;
    known_for_department: string;
    biography?: string;
  } | null;
}

const ActorSection: React.FC<{ actor: NonNullable<PremiumSearchDisplayProps['actor']> }> = ({ actor }) => {
  return (
    <div className="bg-gradient-to-br from-red-900/20 via-black to-black rounded-3xl p-8 border border-red-500/30 overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full -mr-20 -mt-20" />

      <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
        <div className="flex-shrink-0 relative">
          <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-red-600/50 shadow-[0_0_40px_rgba(229,9,20,0.3)]">
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/h632${actor.profile_path}`}
                alt={actor.name}
                width={224}
                height={224}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <User className="w-20 h-20 text-gray-600" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest shadow-lg">
            ACTOR
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-black italic text-white mb-2 drop-shadow-[0_0_15px_rgba(229,9,20,0.4)]">
            {actor.name.toUpperCase()}
          </h2>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="text-red-500 font-bold tracking-tighter flex items-center gap-2">
              <Star className="w-4 h-4 fill-red-500" />
              {actor.known_for_department}
            </span>
            <span className="text-white/40">|</span>
            <span className="text-white/60">Verified Profile</span>
          </div>

          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mb-6">
            Explore the legendary filmography and career highlights of {actor.name}.
            From blockbuster performances to critically acclaimed masterpieces.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              href={`/person/${actor.id}`}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
            >
              View Full Profile
            </Link>
            <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/10 transition-all">
              Save to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PremiumSearchDisplay: React.FC<PremiumSearchDisplayProps> = ({
  results,
  query,
  isLoading = false,
  actor = null,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'tv'>('all');

  // Filter results by type
  const filteredResults = useMemo(() => {
    // Only keep results that have an image
    const validResults = results.filter((r: any) => {
      const raw = r.raw || r;
      return !!(raw.poster_path || raw.profile_path || r.poster);
    });

    if (activeTab === 'all') return validResults;
    if (activeTab === 'movies') {
      return validResults.filter(
        (result: any) => result.type === 'movie' || result.type === 'actor' || result.media_type === 'movie' || result.media_type === 'person'
      );
    }
    return validResults.filter(
      (result: any) => result.type === 'series' || result.media_type === 'tv'
    );
  }, [results, activeTab]);

  const topResult = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((prev, current) =>
      (current.popularity || 0) > (prev.popularity || 0) ? current : prev
    );
  }, [results]);

  const otherResults = useMemo(() => {
    if (!topResult) return results;
    return results.filter(result => result.id !== topResult.id);
  }, [results, topResult]);

  const counts = useMemo(() => ({
    movies: results.filter(
      (r: any) => r.type === 'movie' || r.type === 'actor' || r.media_type === 'movie' || r.media_type === 'person'
    ).length,
    tv: results.filter((r: any) => r.type === 'series' || r.media_type === 'tv').length,
    total: results.length
  }), [results]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_15px_rgba(229,9,20,0.4)]"></div>
          <p className="text-gray-400 animate-pulse italic">Decoding cinematic DNA for "{query}"...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && !actor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-900 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Film className="w-10 h-10 text-red-600/50" />
          </div>
          <h3 className="text-2xl font-black italic text-white mb-2 tracking-tighter">SIGNAL LOST</h3>
          <p className="text-gray-400 mb-6 font-medium">
            We couldn't find a cinematic match for "{query}"
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-500">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">Check your spelling</div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">Try different keywords</div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">Use more general terms</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* 🎭 Actor Profile (Priority #1) */}
      {actor && activeTab === 'all' && (
        <ActorSection actor={actor} />
      )}

      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter">
            DISCOVERY FEED <span className="text-red-600">/</span> {query.toUpperCase()}
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/40 font-bold tracking-widest">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> RANKED {counts.total}</span>
            <span>•</span>
            <span className="text-red-500/60 uppercase">{activeTab} VIEW</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
          {(['all', 'movies', 'tv'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300",
                activeTab === tab
                  ? "bg-red-600 text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {tab} ({tab === 'all' ? counts.total : tab === 'movies' ? counts.movies : counts.tv})
            </button>
          ))}
        </div>
      </div>

      {/* Top Result (only if not an actor search or if searching in tabs) */}
      {topResult && activeTab === 'all' && !actor && (() => {
        const tr: any = topResult.raw || topResult;
        const type = tr.media_type || topResult.type || 'movie';
        const title = tr.title || tr.name || topResult.title;
        const poster = tr.poster_path || tr.profile_path || topResult.poster;
        const rating = tr.vote_average || topResult.rating;
        const year = topResult.year || (tr.release_date ? tr.release_date.substring(0, 4) : (tr.first_air_date ? tr.first_air_date.substring(0, 4) : ''));
        const description = tr.overview || topResult.description;
        const linkHref = type === 'movie' ? `/movie/${tr.id}` : `/series/${tr.id}`;
        
        return (
          <div className="bg-gradient-to-r from-red-900/10 via-black to-black rounded-3xl p-1 border border-red-500/20 overflow-hidden group">
            <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-[22px] flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <Link href={linkHref}>
                  <div className="relative group cursor-pointer w-full md:w-64 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {poster ? (
                      <Image
                        src={poster.startsWith('http') ? poster : `https://image.tmdb.org/t/p/w500${poster}`}
                        alt={title || 'Content'}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Film className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-red-600 rounded-full p-4 shadow-[0_0_30px_rgba(229,9,20,0.6)]">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">TOP MATCH</span>
                </div>

                <Link href={linkHref}>
                  <h3 className="text-4xl md:text-5xl font-black italic text-white mb-4 hover:text-red-500 transition-colors tracking-tighter">
                    {title}
                  </h3>
                </Link>

                <div className="flex items-center gap-6 mb-6 text-sm font-bold tracking-widest text-white/60">
                  {rating > 0 && (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <Star className="w-4 h-4 fill-red-500" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  )}
                  {year && (
                    <div className="flex items-center gap-1.5 uppercase">
                      <Calendar className="w-4 h-4" />
                      <span>{year}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 uppercase">
                    {type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                    <span>{type === 'tv' ? 'series' : type}</span>
                  </div>
                </div>

                <p className="text-gray-400 text-lg line-clamp-3 mb-8 leading-relaxed max-w-3xl">
                  {description}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/watch/${tr.id}?type=${type === 'tv' ? 'series' : type}`}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-black tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_20px_rgba(229,9,20,0.4)] flex items-center gap-3"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Experience Now
                  </Link>
                  <button className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-black tracking-widest uppercase border border-white/10 transition-all">
                    + MY LIST
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Other Results Grid */}
      {filteredResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xl font-black italic text-white tracking-widest uppercase">
              {activeTab === 'all'
                ? (actor ? `FILMOGRAPHY FOR ${actor.name.toUpperCase()}` : 'EXTENDED DISCOVERY')
                : `${activeTab} ARCHIVE`}
            </h3>
            <span className="text-[10px] font-bold text-white/20 tracking-[0.3em]">SECURE STREAM</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredResults.map((result) => (
              <div key={result.id} className="group relative">
                <EnhancedMediaCard
                  media={(result.raw || result) as TMDBMovie | TMDBTVShow}
                  className="transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2"
                />

                {/* Score Indicator */}
                {result.popularity && result.popularity > 0 && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-black bg-black/60 text-red-500 border border-red-500/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {Math.round(result.popularity)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSearchDisplay;

