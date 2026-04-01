import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { Settings } from 'lucide-react';

export function SubtitlesPanel() {
  const { 
    activePanel, 
    subtitleTrack,
    setSubtitleTrack,
    togglePanel
  } = usePlayerState();

  const subtitleTracks = ['off', 'English', 'Hindi', 'Telugu'];

  if (activePanel !== 'subtitles') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute bottom-[76px] right-8 bg-[rgba(20,20,20,0.96)] border-[0.5px] border-white/10 rounded-lg min-w-[200px] backdrop-blur-xl origin-bottom-right shadow-2xl z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-3">
        <h3 className="uppercase text-[11px] text-white/40 font-semibold mb-3 tracking-widest">Subtitles</h3>
        
        <div className="space-y-1">
          {subtitleTracks.map(sub => (
            <button
              key={sub}
              onClick={() => setSubtitleTrack(sub)}
              className="w-full text-left px-3 py-2 text-[14px] text-white/85 hover:bg-white/10 rounded flex items-center justify-between transition-colors"
            >
              <span>{sub === 'off' ? 'Off' : sub}</span>
              {subtitleTrack === sub && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="h-[1px] bg-white/10 my-3" />

        <button
          onClick={() => {
            togglePanel('settings'); // Open full settings
          }}
          className="w-full text-left px-3 py-2 text-[12px] text-white/60 hover:text-white/80 hover:bg-white/5 rounded flex items-center gap-2 transition-colors"
        >
          <Settings className="w-3 h-3" />
          <span>Subtitle Settings</span>
        </button>
      </div>
    </motion.div>
  );
}
