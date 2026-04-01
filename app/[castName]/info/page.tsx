"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, UserPlus, Calendar, Award, Film, Star, TrendingUp, Users, Clock, ChevronLeft, Compass } from 'lucide-react';
import { api } from '@/lib/api';
import { TMDBPerson, TMDBMovie } from '@/lib/types';

interface CastWork {
  id: string;
  title: string;
  poster: string;
  year: number;
  genre: string;
  type: 'movie' | 'series' | 'documentary';
  badge?: 'Latest' | 'Debut' | 'Award';
  character?: string;
}

interface CastInfo {
  id: number;
  name: string;
  profession: string;
  bio: string;
  followers: string;
  projects: number;
  awards: number;
  backgroundImage: string;
  profileImage?: string;
  works: CastWork[];
  birthday?: string;
  placeOfBirth?: string;
  knownFor?: string;
}

const CastInfoPage = () => {
  const params = useParams();
  const router = useRouter();
  const castName = params?.castName as string;
  const [castInfo, setCastInfo] = useState<CastInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allWorks, setAllWorks] = useState<CastWork[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [yearRange, setYearRange] = useState({ min: 2018, max: 2024 });

  useEffect(() => {
    const fetchCastInfo = async () => {
      if (!castName) return;

      setIsLoading(true);
      setError(null);

      try {
        // First, search for the person by name using multi-search
        const searchResults = await api.search(castName);
        
        if (!searchResults.results || searchResults.results.length === 0) {
          throw new Error('Cast member not found');
        }

        // Filter for people results and get the first match
        const person = searchResults.results.find((item: any) => item.media_type === 'person');
        
        if (!person) {
          throw new Error('Cast member not found');
        }
        
        // Fetch detailed person information
        const personDetails = await api.getPersonDetails(person.id);
        
        // Fetch person's movie credits using person combined credits endpoint
        const credits = await api.getCombinedCredits('person', person.id);
        
        // Process works (combine cast and crew credits, deduplicate)
        const uniqueWorksMap = new Map<string, CastWork>();
        let bestBackdrop = '';
        
        // Add cast works
        if (credits.cast) {
          // Sort by popularity first to get the best backdrop
          const sortedCast = [...credits.cast].sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
          
          sortedCast.forEach((item: any) => {
            if (item.backdrop_path && !bestBackdrop) {
              bestBackdrop = item.backdrop_path;
            }
            if (item.media_type === 'movie' && item.poster_path) {
              const idStr = item.id.toString();
              if (!uniqueWorksMap.has(idStr)) {
                uniqueWorksMap.set(idStr, {
                  id: idStr,
                  title: item.title || item.name || 'Unknown',
                  poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                  year: item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : new Date().getFullYear()),
                  genre: 'Movie',
                  type: 'movie',
                  character: item.character,
                  badge: item.release_date && new Date(item.release_date).getFullYear() === new Date().getFullYear() ? 'Latest' : undefined
                });
              } else {
                const existing = uniqueWorksMap.get(idStr)!;
                if (item.character && existing.character && !existing.character.includes(item.character)) {
                  existing.character += ` / ${item.character}`;
                }
              }
            }
          });
        }

        // Add crew works (director)
        if (credits.crew) {
          const sortedCrew = [...credits.crew].sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
          sortedCrew.forEach((item: any) => {
            if (item.backdrop_path && !bestBackdrop) {
              bestBackdrop = item.backdrop_path;
            }
            if (item.media_type === 'movie' && item.poster_path && item.job === 'Director') {
              const idStr = item.id.toString();
              if (!uniqueWorksMap.has(idStr)) {
                uniqueWorksMap.set(idStr, {
                  id: idStr,
                  title: item.title || item.name || 'Unknown',
                  poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                  year: item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : new Date().getFullYear()),
                  genre: 'Movie',
                  type: 'movie',
                  badge: item.release_date && new Date(item.release_date).getFullYear() === new Date().getFullYear() ? 'Latest' : undefined
                });
              }
            }
          });
        }

        // Convert map to array and sort works by year (latest first)
        const allUniqueWorks = Array.from(uniqueWorksMap.values());
        allUniqueWorks.sort((a, b) => b.year - a.year);

        const sortedWorks = allUniqueWorks.slice(0, 15);

        // Mark debut work
        if (sortedWorks.length > 0) {
          const oldestWork = sortedWorks[sortedWorks.length - 1];
          if (!oldestWork.badge) {
            oldestWork.badge = 'Debut';
          }
        }

        // Store all works for pagination
        setAllWorks(allUniqueWorks);
        setHasMore(allUniqueWorks.length > 15);

        // Create cast info object
        const processedCastInfo: CastInfo = {
          id: personDetails.id,
          name: personDetails.name,
          profession: personDetails.known_for_department || 'Actor',
          bio: personDetails.biography || 'No biography available.',
          followers: `${Math.floor(Math.random() * 900000) + 100000}M`, // Mock followers
          projects: sortedWorks.length,
          awards: Math.floor(Math.random() * 20) + 5, // Mock awards
          backgroundImage: bestBackdrop 
            ? `https://image.tmdb.org/t/p/original${bestBackdrop}`
            : (personDetails.profile_path ? `https://image.tmdb.org/t/p/original${personDetails.profile_path}` : 'https://via.placeholder.com/1920x1080/000000/ffffff?text=No+Background'),
          profileImage: personDetails.profile_path 
            ? `https://image.tmdb.org/t/p/h632${personDetails.profile_path}`
            : undefined,
          works: sortedWorks,
          birthday: personDetails.birthday || undefined,
          placeOfBirth: personDetails.place_of_birth || undefined,
          knownFor: personDetails.known_for_department
        };

        setCastInfo(processedCastInfo);
      } catch (err) {
        console.error('Error fetching cast info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cast information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCastInfo();
  }, [castName]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const newWorks = allWorks.slice(0, nextPage * 15);
      
      setCastInfo(prev => prev ? { ...prev, works: newWorks } : null);
      setCurrentPage(nextPage);
      setHasMore(newWorks.length < allWorks.length);
      setIsLoadingMore(false);
    }, 800);
  };

  // Filter functions
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleYearRangeChange = (type: 'min' | 'max', value: number) => {
    setYearRange(prev => ({ ...prev, [type]: value }));
  };

  // Get filtered works
  const getFilteredWorks = () => {
    let filtered = allWorks;
    
    // Filter by content type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(work => {
        switch (selectedFilter) {
          case 'movies':
            return work.type === 'movie';
          case 'series':
            return work.type === 'series';
          case 'behind-scenes':
            return work.type === 'documentary';
          default:
            return true;
        }
      });
    }
    
    // Filter by year range
    filtered = filtered.filter(work => work.year >= yearRange.min && work.year <= yearRange.max);
    
    // Apply pagination
    const paginatedWorks = filtered.slice(0, currentPage * 15);
    
    // Update hasMore based on filtered results
    const newHasMore = paginatedWorks.length < filtered.length;
    if (newHasMore !== hasMore) {
      setHasMore(newHasMore);
    }
    
    return paginatedWorks;
  };

  // Update castInfo works when filters change
  useEffect(() => {
    if (castInfo && allWorks.length > 0) {
      const filteredWorks = getFilteredWorks();
      setCastInfo(prev => prev ? { ...prev, works: filteredWorks } : null);
    }
  }, [selectedFilter, yearRange, currentPage]);

  // Year drag functionality
  const handleYearDrag = (e: React.MouseEvent, type: 'min' | 'max') => {
    e.preventDefault();
    const slider = e.currentTarget.parentElement;
    if (!slider) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = slider.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const year = Math.round(2000 + (percentage / 100) * 24);
      
      handleYearRangeChange(type, year);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Automatic loading when scrolling to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoadingMore) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when user is within 500px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, currentPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading cast information...</div>
      </div>
    );
  }

  if (error || !castInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Cast information not found</div>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-display">
      {/* Back Navigation */}
      <div className="fixed top-4 left-4 z-[150]">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-black/70 backdrop-blur-lg rounded-full text-white hover:bg-black/90 transition-all duration-300 group cursor-pointer border border-white/20 shadow-lg"
          title="Go back"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>

      {/* Hero Section - Netflix cinematic style */}
      <section className="relative h-[75vh] w-full overflow-hidden flex items-center">
        {/* Full-screen Background Image with Vignette */}
        <div className="absolute inset-0">
          <img 
            alt={`${castInfo.name} Background`} 
            className="h-full w-full object-cover object-top" 
            src={castInfo.backgroundImage}
            style={{
              filter: 'brightness(0.9) contrast(1.05)'
            }}
          />
          {/* Netflix-style smooth gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent w-full md:w-3/4"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-20">
          <div className="max-w-3xl space-y-6">
            
            {/* Title Block */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white drop-shadow-2xl uppercase">
                {castInfo.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-bold text-white drop-shadow-lg">
                <span className="text-green-500">98% Match</span>
                {castInfo.birthday && (
                  <span>{new Date(castInfo.birthday).getFullYear()}</span>
                )}
                <span className="rounded bg-white/20 px-2 py-0.5 border border-white/40">{castInfo.profession}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {castInfo.awards} Awards
                </span>
              </div>

              <p className="max-w-2xl text-base md:text-lg text-slate-200 drop-shadow-lg line-clamp-3 md:line-clamp-4 leading-relaxed mt-4">
                {castInfo.bio !== 'No biography available.' 
                  ? castInfo.bio 
                  : `Explore the complete filmography, latest releases, and exclusive behind-the-scenes content of ${castInfo.name}.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button className="flex h-10 md:h-12 items-center justify-center gap-3 rounded-full bg-white px-4 md:px-6 text-sm md:text-base font-bold text-black transition-all hover:bg-white/80">
                <Play className="text-lg md:text-xl fill-black" />
                Play Showreel
              </button>
              <button className="flex h-10 md:h-12 items-center justify-center gap-3 rounded-full bg-zinc-600/70 px-4 md:px-6 text-sm md:text-base font-bold text-white transition-all hover:bg-zinc-600/90 backdrop-blur-sm">
                <UserPlus className="text-lg md:text-xl" />
                Follow
              </button>
            </div>
            
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-8 relative z-20 mt-8">

        {/* Bio Section */}
        {castInfo.bio && castInfo.bio !== 'No biography available.' && (
          <section className="mb-16">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Biography</h2>
              <p className="text-gray-300 leading-relaxed">{castInfo.bio}</p>
            </div>
          </section>
        )}

        {/* Filter & Control Bar */}
        <section className="glass sticky top-24 z-40 mb-12 flex flex-col items-center justify-between gap-6 rounded-2xl p-4 lg:flex-row lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-all ${
                selectedFilter === 'all' 
                  ? 'bg-gradient-to-br from-red-500 to-red-800 text-white shadow-red-500/20' 
                  : 'px-6 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              All Content
            </button>
            <button 
              onClick={() => handleFilterChange('movies')}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                selectedFilter === 'movies' 
                  ? 'bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg shadow-red-500/20' 
                  : 'px-6 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button 
              onClick={() => handleFilterChange('series')}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                selectedFilter === 'series' 
                  ? 'bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg shadow-red-500/20' 
                  : 'px-6 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Series
            </button>
            <button 
              onClick={() => handleFilterChange('behind-scenes')}
              className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                selectedFilter === 'behind-scenes' 
                  ? 'bg-gradient-to-br from-red-500 to-red-800 text-white shadow-lg shadow-red-500/20' 
                  : 'px-6 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Behind Scenes
            </button>
          </div>
          <div className="flex w-full items-center gap-8 lg:w-auto">
            <div className="hidden items-center gap-3 text-sm font-bold text-slate-500 lg:flex uppercase tracking-tighter">
              Release Year
            </div>
            <div className="relative flex h-2 w-full flex-1 items-center rounded-full bg-white/10 lg:w-64">
              <div 
                className="absolute h-full rounded-full bg-gradient-to-r from-red-500 to-red-800 transition-all duration-300"
                style={{
                  left: `${((yearRange.min - 2000) / 24) * 100}%`,
                  right: `${100 - ((yearRange.max - 2000) / 24) * 100}%`
                }}
              />
              <div 
                className="absolute -top-1.5 flex flex-col items-center gap-1 group cursor-pointer"
                style={{ left: `${((yearRange.min - 2000) / 24) * 100}%` }}
                onMouseDown={(e) => handleYearDrag(e, 'min')}
              >
                <div className="size-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                <span className="absolute -top-8 hidden rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white group-hover:block">{yearRange.min}</span>
              </div>
              <div 
                className="absolute -top-1.5 flex flex-col items-center gap-1 group cursor-pointer"
                style={{ left: `${((yearRange.max - 2000) / 24) * 100}%` }}
                onMouseDown={(e) => handleYearDrag(e, 'max')}
              >
                <div className="size-5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                <span className="absolute -top-8 hidden rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white group-hover:block">{yearRange.max}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="mb-20">
          <div className="mb-8 flex items-end justify-between">
            <h3 className="text-2xl font-bold text-white">Selected Works</h3>
            <a className="text-sm font-bold text-red-500 hover:underline" href="#">View Archive</a>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {castInfo.works.map((work) => (
              <div key={work.id} className="group cursor-pointer">
                <div className="relative mb-4 aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-red-500/10">
                  <img 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={work.poster}
                    alt={work.title}
                  />
                  {work.badge && (
                    <div className="absolute top-3 left-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
                        work.badge === 'Latest' ? 'bg-red-500' : 
                        work.badge === 'Debut' ? 'border border-red-500/50 bg-black/50 text-red-500' : 
                        'bg-red-500'
                      }`}>
                        {work.badge}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">{work.title}</h4>
                <p className="text-xs font-medium text-slate-500 uppercase">{work.genre} • {work.year}</p>
                {work.character && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="text-xs text-slate-400">as {work.character}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // For demo, we use a fixed ID or navigate to the search results
                        router.push(`/character/${work.id}`);
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-300"
                    >
                      <Compass className="w-3 h-3" /> View Character Compass
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Auto Loading Indicator */}
          {isLoadingMore && (
            <div className="mt-16 flex justify-center">
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading more works...</span>
              </div>
            </div>
          )}
          
          {!hasMore && castInfo.works.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-sm text-slate-500">
                Showing all {castInfo.works.length} works
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-black/60 py-12 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-800">
                <Film className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-black tracking-tighter text-white">CREATOR.FLIX</h2>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
              <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-white transition-colors" href="#">Contact Support</a>
            </div>
            <div className="text-xs text-slate-600">
              © 2024 Creator.Flix Media Group. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        body {
          background: radial-gradient(circle at 50% -20%, #2d0a0a 0%, #050505 60%);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default CastInfoPage;
