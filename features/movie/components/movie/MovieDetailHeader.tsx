"use client";
import React from "react";
import { TMDBMovieDetail } from "@/lib/types";
import { Play, Plus, Share2, Download, Heart, BarChart3, Zap, Users, Eye, Shield, ThumbsUp, MessageCircle, Film, Globe, DollarSign, TrendingUp, AlertTriangle, ThumbsDown, Clapperboard, Info, Coins, Bot, Moon, RotateCcw, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import "@/styles/movie-insights.css";

interface MovieDetailHeaderProps {
  movie: TMDBMovieDetail;
  trailerKey: string | null;
  onAddToWatchlist: () => void;
  onShare: (platform: string) => void;
  showShareMenu: boolean;
  shareButtonPosition: { top: number; left: number };
  setShowShareMenu: (show: boolean) => void;
  setShareButtonPosition: (position: { top: number; left: number }) => void;
  movieInsights: {
    audienceLove: number;
    rewatchValue: number;
    intensity: 'Low' | 'Medium' | 'High';
    bestWatchTime: 'Day' | 'Night' | 'Weekend';
    movieMood: string[];
    sceneComposition: { name: string; value: number; color: string }[];
  };
}

const MovieDetailHeader: React.FC<MovieDetailHeaderProps> = ({
  movie,
  trailerKey,
  onAddToWatchlist,
  onShare,
  showShareMenu,
  shareButtonPosition,
  setShowShareMenu,
  setShareButtonPosition,
  movieInsights
}) => {
  const router = useRouter();

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setShareButtonPosition({ top: rect.bottom + 8, left: rect.left });
    setShowShareMenu(!showShareMenu);
  };

  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        {movie.backdrop_path && (
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              {movie.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  width={400}
                  height={600}
                  className="w-full"
                />
              )}
            </motion.div>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xl text-zinc-400 italic mb-4">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span>{movie.release_date?.split('-')[0]}</span>
                <span>•</span>
                <span>{movie.runtime} min</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-white">{movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {movie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-red-600/20 text-red-500 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => router.push(`/watch/${movie.id}`)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all"
              >
                <Play className="w-5 h-5" />
                Watch Now
              </button>
              <button
                onClick={onAddToWatchlist}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-medium transition-all"
              >
                <Plus className="w-5 h-5" />
                Watchlist
              </button>
              <button
                onClick={handleShareClick}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-full font-medium transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </motion.div>

            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
              <p className="text-zinc-300 leading-relaxed">{movie.overview}</p>
            </motion.div>

            {/* Movie Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                Movie Insights
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500">{movieInsights.audienceLove}%</div>
                  <div className="text-xs text-zinc-400 mt-1">Audience Love</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{movieInsights.rewatchValue}</div>
                  <div className="text-xs text-zinc-400 mt-1">Rewatch Value</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">{movieInsights.intensity}</div>
                  <div className="text-xs text-zinc-400 mt-1">Intensity</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{movieInsights.bestWatchTime}</div>
                  <div className="text-xs text-zinc-400 mt-1">Best Time</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movieInsights.movieMood.map((mood) => (
                  <span key={mood} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
                    {mood}
                  </span>
                ))}
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={movieInsights.sceneComposition}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {movieInsights.sceneComposition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trailer Section */}
      {trailerKey && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative z-10 container mx-auto px-4 py-8"
        >
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title={`${movie.title} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-50 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 p-2"
          style={{
            top: shareButtonPosition.top,
            left: shareButtonPosition.left,
          }}
        >
          {['twitter', 'facebook', 'linkedin', 'copy'].map((platform) => (
            <button
              key={platform}
              onClick={() => onShare(platform)}
              className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MovieDetailHeader;
