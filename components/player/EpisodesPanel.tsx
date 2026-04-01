import { motion } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { ChevronDown, PlayCircle } from 'lucide-react';
import { Episode } from '@/types/player.types';
import { useState } from 'react';

// Mock data
const MOCK_EPISODES: Episode[] = [
  { id: 'e1', seasonNumber: 1, episodeNumber: 1, title: 'Winter is Coming', description: 'Lord Eddard Stark is asked by his old friend, King Robert Baratheon, to serve as the Kings Hand.', duration: 3600, thumbnailUrl: '/thumbnails/drama-1.jpg', videoUrl: '' },
  { id: 'e2', seasonNumber: 1, episodeNumber: 2, title: 'The Kingsroad', description: 'Bran\'s fate remains in doubt. Having agreed to become the King\'s Hand, Ned leaves Winterfell.', duration: 3300, thumbnailUrl: '/thumbnails/drama-2.jpg', videoUrl: '' },
  { id: 'e3', seasonNumber: 1, episodeNumber: 3, title: 'Lord Snow', description: 'Jon Snow begins his training at Castle Black. Ned arrives in King\'s Landing.', duration: 3450, thumbnailUrl: '/thumbnails/drama-3.jpg', videoUrl: '' },
  { id: 'e4', seasonNumber: 1, episodeNumber: 4, title: 'Cripples, Bastards, and Broken Things', description: 'Eddard investigates Jon Arryn\'s murder. Jon befriends Samwell Tarly.', duration: 3360, thumbnailUrl: '/thumbnails/drama-4.jpg', videoUrl: '' },
];

export function EpisodesPanel() {
  const { activePanel } = usePlayerState();
  const [seasonOpen, setSeasonOpen] = useState(false);
  const currentEpisodeId = 'e2'; // Mock active episode

  if (activePanel !== 'episodes') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute bottom-[76px] right-8 bg-[rgba(20,20,20,0.96)] border-[0.5px] border-white/10 rounded-lg w-[360px] max-h-[400px] backdrop-blur-xl origin-bottom-right shadow-2xl z-50 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[rgba(20,20,20,0.96)] z-10 p-4 border-b border-white/10 flex justify-between items-center rounded-t-lg">
        <button 
          onClick={() => setSeasonOpen(!seasonOpen)}
          className="text-lg font-bold text-white flex items-center gap-2 hover:text-white/80"
        >
          Season 1
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Episodes List */}
      <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
        {MOCK_EPISODES.map((ep) => {
          const isActive = ep.id === currentEpisodeId;
          
          return (
            <div 
              key={ep.id}
              className={`flex gap-3 p-3 rounded-md cursor-pointer transition-colors group ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-[110px] h-[62px] flex-shrink-0 bg-black rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ep.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                
                {/* Play Button Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <PlayCircle className="w-8 h-8 text-white" />
                </div>

                {/* Watched Progress Bar (Mocked) */}
                {ep.id === 'e1' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                     <div className="h-full bg-[#E50914] w-[95%]" />
                  </div>
                )}
                {ep.id === 'e2' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                     <div className="h-full bg-[#E50914] w-[35%]" />
                  </div>
                )}
              </div>

              {/* Info Block */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[13px] font-semibold truncate pr-2 ${isActive ? 'text-white' : 'text-white/90'}`}>
                    {ep.episodeNumber}. {ep.title}
                  </span>
                  <span className="text-[11px] text-white/50">{Math.floor(ep.duration / 60)}m</span>
                </div>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-snug">
                  {ep.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
