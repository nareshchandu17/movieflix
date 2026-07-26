"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TMDBWatchProvider } from '@/features/shared/types';
import { Play, Plus, ArrowLeft, Info, Shield, X, Star } from 'lucide-react';

interface OfficialViewingScreenProps {
  contentData: any;
  providers: {
    link?: string;
    flatrate?: TMDBWatchProvider[];
    rent?: TMDBWatchProvider[];
    buy?: TMDBWatchProvider[];
    free?: TMDBWatchProvider[];
  };
}

export function OfficialViewingScreen({ contentData, providers }: OfficialViewingScreenProps) {
  const router = useRouter();

  // Combine TMDB details if they exist
  const details = contentData.tmdbDetails || contentData;

  const getImageUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w780${path}` : null;
  };

  const getBackdropUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/original${path}` : null;
  };

  const backdropUrl = getBackdropUrl(details.backdrop_path || details.poster_path);
  const posterUrl = getImageUrl(details.poster_path || details.backdrop_path);
  
  const title = details.title || details.name || contentData.title || "Unknown Title";
  const releaseYear = (details.release_date || details.first_air_date || contentData.year || "").toString().split('-')[0];
  
  let runtimeStr = "";
  if (details.runtime) {
    const hours = Math.floor(details.runtime / 60);
    const minutes = details.runtime % 60;
    runtimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  } else if (details.episode_run_time && details.episode_run_time.length > 0) {
    runtimeStr = `${details.episode_run_time[0]}m`;
  }

  const certification = contentData.certification || details.certification;
  const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
  
  // Try to resolve languages and genres
  const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
  let languageStr = "Unknown";
  try {
    if (details.original_language) languageStr = langNames.of(details.original_language) || languageStr;
  } catch (e) {}

  const genres = details.genres ? details.genres.map((g: any) => g.name).join(', ') : (contentData.genres?.join(', ') || "");
  const overview = details.overview || contentData.description;

  // Flatten providers for rendering
  const mappedProviders: { provider: TMDBWatchProvider, type: string, actionText: string }[] = [];
  
  if (providers.flatrate) providers.flatrate.forEach(p => mappedProviders.push({ provider: p, type: 'Subscription', actionText: 'Watch Now ⇗' }));
  if (providers.rent) providers.rent.forEach(p => mappedProviders.push({ provider: p, type: 'Rent', actionText: 'Rent ⇗' }));
  if (providers.buy) providers.buy.forEach(p => mappedProviders.push({ provider: p, type: 'Buy', actionText: 'Buy ⇗' }));
  if (providers.free) providers.free.forEach(p => mappedProviders.push({ provider: p, type: 'Free', actionText: 'Watch Now ⇗' }));

  // Remove duplicates by provider name
  const uniqueProviders = mappedProviders.filter((v, i, a) => a.findIndex(t => (t.provider.provider_name === v.provider.provider_name)) === i);
  const hasProviders = uniqueProviders.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-white font-sans"
    >
      {/* Blurred Background */}
      {backdropUrl && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-110 opacity-30 blur-2xl"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      
      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-red-600 font-black text-3xl tracking-tighter">M</span>
          <span className="text-white font-bold tracking-widest text-lg">MOVIEFLIX</span>
        </div>
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 lg:px-16 pt-24 pb-12 flex flex-col lg:flex-row gap-12 lg:gap-16 h-full overflow-y-auto custom-scrollbar">
        
        {/* Left Column - Poster */}
        <div className="flex-none w-[320px] lg:w-[380px] mx-auto lg:mx-0 flex flex-col gap-6 shrink-0 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
          >
            {posterUrl ? (
              <Image 
                src={posterUrl} 
                alt={title} 
                fill 
                className="object-cover"
                sizes="380px"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                <span className="text-sm uppercase tracking-widest">No Image</span>
              </div>
            )}
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/5 rounded-lg flex items-center justify-center gap-2 transition-colors group"
            onClick={() => window.open(contentData.videoUrl, '_blank')}
          >
            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Watch Trailer</span>
          </motion.button>
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 flex flex-col justify-center gap-8 pb-10">
          
          {/* Header & Meta */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm lg:text-base text-white/70 font-medium">
              {rating && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span className="text-white/90">{rating}/10</span>
                </div>
              )}
              {rating && <span className="text-white/20">|</span>}
              
              {releaseYear && <span>{releaseYear}</span>}
              {releaseYear && <span className="text-white/20">|</span>}
              
              {runtimeStr && <span>{runtimeStr}</span>}
              {runtimeStr && <span className="text-white/20">|</span>}
              
              {certification && (
                <span className="px-1.5 py-0.5 border border-white/30 rounded text-xs text-white/90 font-semibold uppercase">
                  {certification}
                </span>
              )}
              {certification && <span className="text-white/20">|</span>}
              
              <span>{languageStr}</span>
              <span className="text-white/20">|</span>
              
              <span>{genres}</span>
            </div>

            {overview && (
              <p className="text-white/80 text-lg leading-relaxed max-w-3xl mt-4">
                {overview}
              </p>
            )}
          </motion.div>

          {/* Providers Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 mt-4"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold">Official Streaming Partners</h2>
              <Info className="w-4 h-4 text-white/40" />
            </div>

            {hasProviders ? (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {uniqueProviders.map((item, idx) => (
                  <a
                    key={`${item.provider.provider_id}-${idx}`}
                    href={providers.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-36 lg:w-40 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors group snap-start"
                  >
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-black">
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${item.provider.logo_path}`}
                        alt={item.provider.provider_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center w-full space-y-1">
                      <h3 className="font-semibold text-sm truncate">{item.provider.provider_name}</h3>
                      <p className={`text-xs font-medium ${item.type === 'Rent' || item.type === 'Buy' ? 'text-yellow-500' : 'text-green-500'}`}>
                        {item.type}
                      </p>
                    </div>
                    <div className="w-full mt-2 py-1.5 border border-white/20 rounded-md text-xs text-center font-medium group-hover:bg-white group-hover:text-black transition-colors">
                      {item.actionText}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-white/60">
                No official streaming platforms found for this content in your region.
              </div>
            )}
          </motion.div>

          {/* Bottom Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mt-6"
          >
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
              onClick={() => window.open(contentData.videoUrl, '_blank')}
            >
              <Play className="w-4 h-4 fill-white" /> Watch Trailer
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add to Watchlist
            </button>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Details
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-auto pt-8 flex items-start gap-2 text-white/40 text-xs"
          >
            <Shield className="w-4 h-4 shrink-0" />
            <p>MovieFlix respects creators and only links to official streaming platforms. Availability may vary by region.</p>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
