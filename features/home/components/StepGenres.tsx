"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Sparkles } from "lucide-react";

interface StepGenresProps {
  data: {
    interests: string[];
  };
  updateData: (newData: any) => void;
}

const genres = [
  { id: 'action', name: 'Action', icon: '💥' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'thriller', name: 'Thriller', icon: '🔪' },
  { id: 'comedy', name: 'Comedy', icon: '😄' },
  { id: 'drama', name: 'Drama', icon: '🎭' },
  { id: 'anime', name: 'Anime', icon: '🌸' },
  { id: 'horror', name: 'Horror', icon: '👻' },
  { id: 'mystery', name: 'Mystery', icon: '🔍' },
  { id: 'adventure', name: 'Adventure', icon: '🗺️' },
  { id: 'romance', name: 'Romance', icon: '💕' },
  { id: 'documentary', name: 'Documentary', icon: '📽️' },
  { id: 'fantasy', name: 'Fantasy', icon: '🐉' },
];

export default function StepGenres({ data, updateData }: StepGenresProps) {
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  const toggleGenre = (genreId: string) => {
    const currentInterests = data.interests;
    const isSelected = currentInterests.includes(genreId);
    
    if (isSelected) {
      updateData({
        interests: currentInterests.filter(id => id !== genreId)
      });
    } else {
      updateData({
        interests: [...currentInterests, genreId]
      });
    }
  };

  const isSelected = (genreId: string) => data.interests.includes(genreId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg shadow-red-500/25">
          <Film className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          What do you love watching?
        </h1>
        <p className="text-white/60 text-lg">
          Pick at least 3 genres
        </p>
      </motion.div>

      {/* Selection Counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-white/80 text-sm">
            {data.interests.length} selected
          </span>
          <span className="text-white/40 text-sm">
            (min 3)
          </span>
        </div>
      </motion.div>

      {/* Genre Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {genres.map((genre, index) => {
          const selected = isSelected(genre.id);
          const hovered = hoveredGenre === genre.id;
          
          return (
            <motion.button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              onMouseEnter={() => setHoveredGenre(genre.id)}
              onMouseLeave={() => setHoveredGenre(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 overflow-hidden
                ${selected 
                  ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-red-400 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              {/* Background effect */}
              {selected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center space-y-2">
                <span className="text-2xl">{genre.icon}</span>
                <span className="text-sm font-semibold">{genre.name}</span>
              </div>

              {/* Selection indicator */}
              {selected && (
                <motion.div
                  className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <span className="text-red-500 text-xs">✓</span>
                </motion.div>
              )}

              {/* Hover effect */}
              {hovered && !selected && (
                <motion.div
                  className="absolute inset-0 bg-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-semibold">Selection Progress</span>
          <span className={`text-sm font-semibold ${
            data.interests.length >= 3 ? 'text-green-400' : 'text-white/60'
          }`}>
            {data.interests.length}/3
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-500 ${
              data.interests.length >= 3 
                ? 'bg-gradient-to-br from-green-400 to-green-500' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((data.interests.length / 3) * 100, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        {data.interests.length < 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 text-sm mt-2"
          >
            Select {3 - data.interests.length} more {3 - data.interests.length === 1 ? 'genre' : 'genres'} to continue
          </motion.p>
        )}
        {data.interests.length >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-green-400 text-sm mt-2 flex items-center space-x-1"
          >
            <span>✓</span>
            <span>Great choices! Ready to continue</span>
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
