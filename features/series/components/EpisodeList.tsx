import React from "react";
import { motion } from "framer-motion";
import { Play, Check, Download } from "lucide-react";
import Image from "next/image";
import { TMDBEpisodeDetail } from "@/lib/types";

interface EpisodeWithProgress {
  episode: TMDBEpisodeDetail;
  progress: number;
  isWatched: boolean;
  isCurrent: boolean;
}

interface EpisodeListProps {
  episodes: EpisodeWithProgress[];
  avgRuntime: number;
  isSeasonLoading: boolean;
  onEpisodePlay: (episode: TMDBEpisodeDetail) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const EpisodeItem = React.memo(({ 
  ep, 
  avgRuntime, 
  onEpisodePlay 
}: { 
  ep: EpisodeWithProgress, 
  avgRuntime: number, 
  onEpisodePlay: (ep: TMDBEpisodeDetail) => void 
}) => {
  return (
    <motion.div
      id={`episode-${ep.episode.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onEpisodePlay(ep.episode)}
      className={`group relative flex flex-col md:flex-row gap-6 p-4 rounded-3xl transition-all duration-500 border cursor-pointer ${
        ep.isCurrent
          ? 'bg-red-600/10 border-red-500/30'
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      {/* Episode Thumbnail */}
      <div className="relative w-full md:w-64 h-36 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
        {ep.episode.still_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${ep.episode.still_path}`}
            alt={ep.episode.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 256px"
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <Play className="w-12 h-12 text-gray-700" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-white ml-1 fill-current" />
          </div>
        </div>

        {/* Progress Bar */}
        {ep.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-red-600 shadow-[0_0_8px_rgba(229,9,20,0.8)]"
              style={{ width: `${ep.progress}%` }}
            />
          </div>
        )}

        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
          EP {ep.episode.episode_number}
        </div>
      </div>

      {/* Episode Info */}
      <div className="flex-1 min-w-0 py-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">
            {ep.episode.name}
          </h3>
          <div className="flex items-center gap-3">
            {ep.isWatched && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Check className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-black text-green-500 uppercase">Watched</span>
              </div>
            )}
            <span className="text-xs font-bold text-gray-500">{ep.episode.runtime || avgRuntime}m</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4 group-hover:text-gray-300 transition-colors">
          {ep.episode.overview || "No overview available for this episode."}
        </p>

        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); /* handle download */ }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); /* handle details */ }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20 active:scale-95"
          >
            Details
          </button>
        </div>
      </div>

      {/* Floating Badge for Current Episode */}
      {ep.isCurrent && (
        <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-600/40 z-10 animate-bounce">
          Watching Now
        </div>
      )}
    </motion.div>
  );
});
EpisodeItem.displayName = "EpisodeItem";

export const EpisodeList = React.memo(({
  episodes,
  avgRuntime,
  isSeasonLoading,
  onEpisodePlay,
  containerRef,
}: EpisodeListProps) => {
  return (
    <div
      ref={containerRef}
      className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
    >
      {isSeasonLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
        ))
      ) : (
        episodes.map((ep) => (
          <EpisodeItem 
            key={ep.episode.id} 
            ep={ep} 
            avgRuntime={avgRuntime} 
            onEpisodePlay={onEpisodePlay} 
          />
        ))
      )}
    </div>
  );
});
EpisodeList.displayName = "EpisodeList";
