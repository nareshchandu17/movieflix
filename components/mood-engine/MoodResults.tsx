"use client";

import { motion } from "framer-motion";
import { Star, Play, Info, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function MoodResults({ results, userMood }: { results: any[], userMood: string }) {
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});

  const handleFeedback = async (contentId: string, rating: number) => {
    setFeedback(prev => ({ ...prev, [contentId]: rating === 1 ? 'up' : 'down' }));
    try {
      await fetch("/api/mood-engine/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, rating, userMood }),
      });
    } catch (error) {
      console.error("Feedback failed:", error);
    }
  };

  const getPosterUrl = (movie: any) => {
    const path = movie?.posterUrl || movie?.poster_path;
    
    // Check if it's a mock placeholder or missing
    if (!path || (typeof path === 'string' && path.includes("placeholder"))) {
      // Use premium cinema-themed placeholder
      const title = movie?.title || "Cinema";
      return `https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop&title=${encodeURIComponent(title)}`;
    }
    
    // If it's already a full URL, return it
    if (path.startsWith("http")) return path;
    
    // Otherwise, assume it's a TMDB path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://image.tmdb.org/t/p/w500${cleanPath}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-8 space-y-12 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          Your Emotional Matches <span className="text-white/20 text-lg font-normal">({results.length})</span>
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="text-white/40 hover:text-white transition-colors"
        >
          Reset Engine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((result, index) => {
          const isMovie = result.contentType !== "Series";
          // Use routingId (tmdbId) for detail page links
          const linkHref = isMovie 
            ? `/movie/${result.routingId}` 
            : `/series/${result.routingId}`;
          
          return (
            <motion.div
              key={result.contentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 bg-zinc-900 border border-white/5">
                <Image
                  src={getPosterUrl(result.movie)}
                  alt={result.movie?.title || "Recommended Title"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20 text-white">
                    {Math.round(result.similarityScore * 100)}% Match
                  </div>
                  {result.language && (
                    <div className="bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white w-fit">
                      {result.language === 'te' ? 'Tollywood' : 
                       result.language === 'hi' ? 'Hindi' :
                       result.language === 'ml' ? 'Malayalam' : 
                       result.language === 'en' ? 'English' : result.language}
                    </div>
                  )}
                  {!isMovie && (
                    <div className="bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white w-fit">
                      Series
                    </div>
                  )}
                </div>

                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="flex gap-3 mb-4">
                    <Link
                      href={linkHref}
                      className="flex-1 bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/90"
                    >
                      <Play className="w-4 h-4 fill-black" /> Watch Now
                    </Link>
                    <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold line-clamp-1">{result.movie?.title}</h3>
                    <p className="text-white/40 text-sm">{result.movie?.year || result.movie?.release_date?.split('-')[0]} • {result.tone}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{result.movie?.vote_average ? result.movie.vote_average.toFixed(1) : "8.5"}</span>
                  </div>
                </div>

                <p className="text-white/80 italic text-sm border-l-2 border-red-500 pl-4 py-1">
                  &quot;{result.explanation}&quot;
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <span className="text-xs text-white/20 uppercase tracking-widest">Feedback</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedback(result.contentId, 1)}
                      className={`p-2 rounded-lg transition-colors ${feedback[result.contentId] === 'up' ? 'bg-green-500/20 text-green-500' : 'hover:bg-white/5 text-white/20'}`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(result.contentId, -1)}
                      className={`p-2 rounded-lg transition-colors ${feedback[result.contentId] === 'down' ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/5 text-white/20'}`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
