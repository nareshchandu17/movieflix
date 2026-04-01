import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';

export function PlaybackControls({ isWatchParty }: { isWatchParty?: boolean }) {
  const { playing, togglePlay, seek, currentTime } = usePlayerState();

  const handleSeek = (amount: number, type: 'forward' | 'rewind', msg: string) => {
    seek(currentTime + amount);
    window.dispatchEvent(new CustomEvent('player:seek-flash', { detail: { type, msg } }));
  };

  return (
    <div className="flex items-center gap-4">
      {/* Rewind 10s */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleSeek(-10, 'rewind', '-10s') }}
        className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-all hover:scale-110 active:scale-90"
        aria-label="Rewind 10 seconds"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 drop-shadow-md">
          <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
        </svg>
      </button>

      {/* Play / Pause Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className="relative w-12 h-12 flex items-center justify-center text-white group"
        aria-label={playing ? "Pause" : "Play"}
      >
         <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-full transition-colors duration-200" />
         <AnimatePresence mode="wait" initial={false}>
          {playing ? (
            <motion.svg
              key="pause"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.6, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </motion.svg>
          ) : (
            <motion.svg
              key="play"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.6, opacity: 0, rotate: 90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, rotate: -90 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <path d="M8 5v14l11-7z"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {/* Forward 10s */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleSeek(10, 'forward', '+10s') }}
        className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-all hover:scale-110 active:scale-90"
        aria-label="Forward 10 seconds"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 drop-shadow-md">
          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
        </svg>
      </button>

      {/* Conditional: React Button or Room Settings */}
      {isWatchParty ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('player:open-room-settings'));
          }}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm border border-white/20 transition-all hover:scale-105 active:scale-95 group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Room Settings</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
             // Dispatch custom event to open reaction recorder
             window.dispatchEvent(new CustomEvent('player:open-recorder', { 
              detail: { timestamp: currentTime } 
            }));
          }}
          className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-sm shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="group-hover:animate-pulse">React</span>
          <span className="text-lg leading-none">🎥</span>
        </button>
      )}
    </div>
  );
}
