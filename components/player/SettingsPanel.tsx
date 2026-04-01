import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { PlaybackQuality, PlaybackRate } from '@/types/player.types';
import { Check } from 'lucide-react';

export function SettingsPanel() {
  const { 
    activePanel, 
    quality, 
    setQuality, 
    playbackRate, 
    setPlaybackRate,
    subtitleTrack,
    setSubtitleTrack,
    audioTrack,
    setAudioTrack
  } = usePlayerState();

  if (activePanel !== 'settings') return null;

  const qualities: PlaybackQuality[] = ['auto', '1080p', '720p', '480p', '360p'];
  const speeds: PlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const audioTracks = ['Original', 'English', 'Hindi'];
  const subtitleTracks = ['off', 'English', 'Hindi', 'Telugu'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute bottom-[76px] right-8 bg-[rgba(20,20,20,0.96)] border-[0.5px] border-white/10 rounded-lg min-w-[280px] backdrop-blur-xl origin-bottom-right shadow-2xl z-50 overflow-hidden flex"
      onClick={(e) => e.stopPropagation()} // Keep click from falling through to video
    >
      <div className="flex-1 border-r border-white/10 p-2">
        <h3 className="uppercase text-[11px] text-white/40 font-semibold px-4 py-2 tracking-widest">Speed</h3>
        {speeds.map(speed => (
          <button
            key={speed}
            onClick={() => setPlaybackRate(speed)}
            className="w-full text-left px-4 py-2 text-[14px] text-white/85 hover:bg-white/10 rounded flex items-center justify-between transition-colors"
          >
            {speed === 1 ? 'Normal' : `${speed}x`}
            {playbackRate === speed && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}

        <div className="h-[1px] bg-white/10 my-2 mx-4" />

        <h3 className="uppercase text-[11px] text-white/40 font-semibold px-4 py-2 tracking-widest">Quality</h3>
        {qualities.map(q => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            className="w-full text-left px-4 py-2 text-[14px] text-white/85 hover:bg-white/10 rounded flex items-center justify-between transition-colors"
          >
            {q === 'auto' ? 'Auto (1080p)' : q}
            {quality === q && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
      </div>

      <div className="flex-1 p-2">
        <h3 className="uppercase text-[11px] text-white/40 font-semibold px-4 py-2 tracking-widest">Audio</h3>
        {audioTracks.map(audio => (
          <button
            key={audio}
            onClick={() => setAudioTrack(audio)}
            className="w-full text-left px-4 py-2 text-[14px] text-white/85 hover:bg-white/10 rounded flex items-center justify-between transition-colors"
          >
            {audio}
            {audioTrack === audio && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}

        <div className="h-[1px] bg-white/10 my-2 mx-4" />

        <h3 className="uppercase text-[11px] text-white/40 font-semibold px-4 py-2 tracking-widest">Subtitles</h3>
        {subtitleTracks.map(sub => (
          <button
            key={sub}
            onClick={() => setSubtitleTrack(sub)}
            className="w-full text-left px-4 py-2 text-[14px] text-white/85 hover:bg-white/10 rounded flex items-center justify-between transition-colors"
          >
            {sub === 'off' ? 'Off' : sub}
            {subtitleTrack === sub && <Check className="w-4 h-4 text-white" />}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
