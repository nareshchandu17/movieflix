"use client";

import { motion } from "framer-motion";
import { Star, Play, Info, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function MoodResults({ results, userMood }: { results: any[], userMood: string }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getPosterUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1485099667758-41c1700995ce?q=80&w=1000";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      te: "Tollywood",
      hi: "Hindi",
      en: "English",
      ta: "Tamil",
      kn: "Kannada"
    };
    return labels[lang] || lang.toUpperCase();
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-8 space-y-12 text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">
            The <span className="text-red-500">{userMood}</span> Collection
          </h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
            {results.length} Dynamic matches retrieved from TMDB
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Reset Engine
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {results.map((movie, index) => (
          <motion.div
            key={`${movie.id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.05, 1) }}
            onMouseEnter={() => setHoveredId(movie.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative"
          >
            <Link href={`/movie/${movie.id}`}>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-300 group-hover:border-red-500/50 group-hover:shadow-red-500/10">
                <Image
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  priority={index < 5}
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-white/10 text-white shadow-xl">
                    {getLanguageLabel(movie.language)}
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-bold">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>

                {/* Hover Details */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-sm font-black line-clamp-2 leading-tight mb-3">
                    {movie.title}
                  </h3>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-black uppercase tracking-tighter flex items-center justify-center gap-1">
                      <Play className="w-3 h-3 fill-black text-black" /> Watch
                    </div>
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
