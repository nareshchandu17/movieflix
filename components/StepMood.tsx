"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface StepMoodProps {
  data: {
    moods: string[];
  };
  updateData: (newData: any) => void;
}

const moods = [
  { id: 'mind-bending', name: 'Mind-bending plots', icon: '🧠', color: 'from-purple-500 to-pink-500' },
  { id: 'feel-good', name: 'Feel-good movies', icon: '😊', color: 'from-yellow-500 to-orange-500' },
  { id: 'dark-psychological', name: 'Dark psychological', icon: '🌑', color: 'from-gray-700 to-gray-900' },
  { id: 'epic-action', name: 'Epic action', icon: '⚔️', color: 'from-red-500 to-orange-500' },
  { id: 'romantic', name: 'Romantic stories', icon: '💕', color: 'from-pink-500 to-rose-500' },
  { id: 'funny', name: 'Funny movies', icon: '😂', color: 'from-green-500 to-teal-500' },
  { id: 'emotional-drama', name: 'Emotional drama', icon: '🎭', color: 'from-blue-500 to-indigo-500' },
  { id: 'suspenseful', name: 'Suspenseful thrillers', icon: '🔍', color: 'from-purple-600 to-purple-800' },
  { id: 'inspiring', name: 'Inspiring stories', icon: '✨', color: 'from-amber-500 to-yellow-500' },
  { id: 'nostalgic', name: 'Nostalgic classics', icon: '📼', color: 'from-orange-600 to-red-600' },
];

export default function StepMood({ data, updateData }: StepMoodProps) {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  const toggleMood = (moodId: string) => {
    const currentMoods = data.moods;
    const isSelected = currentMoods.includes(moodId);
    
    if (isSelected) {
      updateData({
        moods: currentMoods.filter(id => id !== moodId)
      });
    } else {
      updateData({
        moods: [...currentMoods, moodId]
      });
    }
  };

  const isSelected = (moodId: string) => data.moods.includes(moodId);

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
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          What type of movie vibe do you enjoy?
        </h1>
        <p className="text-white/60 text-lg">
          Choose your preferred moods (optional)
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
            {data.moods.length} mood{data.moods.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </motion.div>

      {/* Mood Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {moods.map((mood, index) => {
          const selected = isSelected(mood.id);
          const hovered = hoveredMood === mood.id;
          const moodColor = moods.find(m => m.id === mood.id)?.color || 'from-purple-500 to-blue-500';
          
          return (
            <motion.button
              key={mood.id}
              onClick={() => toggleMood(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border transition-all duration-300 overflow-hidden text-left
                ${selected 
                  ? `bg-gradient-to-r ${moodColor} border-transparent text-white shadow-lg` 
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10'
                }
              `}
            >
              {/* Background effect */}
              {selected && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${moodColor} opacity-30`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              
              {/* Content */}
              <div className="relative z-10 flex items-center space-x-3">
                <span className="text-2xl">{mood.icon}</span>
                <span className="text-sm font-semibold flex-1">{mood.name}</span>
              </div>

              {/* Selection indicator */}
              {selected && (
                <motion.div
                  className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <span className="text-purple-500 text-xs">✓</span>
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

      {/* Optional Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-red-600 to-red-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">💡</span>
          </div>
          <div>
            <h3 className="text-white/80 font-semibold mb-1">This step is optional</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Selecting moods helps us understand your preferences better and provide more personalized recommendations. 
              You can always update these later in your profile settings.
            </p>
            {data.moods.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3"
              >
                <span className="text-green-400 text-sm flex items-center space-x-1">
                  <span>✓</span>
                  <span>Great! You've selected {data.moods.length} mood{data.moods.length !== 1 ? 's' : ''}</span>
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Preview Selected Moods */}
      {data.moods.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-4 border border-white/10"
        >
          <h3 className="text-white/80 font-semibold mb-3 text-sm">Your selected moods:</h3>
          <div className="flex flex-wrap gap-2">
            {data.moods.map((moodId) => {
              const mood = moods.find(m => m.id === moodId);
              if (!mood) return null;
              
              return (
                <motion.div
                  key={moodId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r ${mood.color} text-white text-sm`}
                >
                  <span>{mood.icon}</span>
                  <span>{mood.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
