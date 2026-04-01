import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { PlayCircle, X } from 'lucide-react';

export function NextEpisodeCard() {
  const { currentTime, duration, controlsVisible } = usePlayerState();
  const [isDismissed, setIsDismissed] = useState(false);
  const showNext = duration > 0 && (currentTime / duration) > 0.92 && !isDismissed;

  useEffect(() => {
    // Determine auto-play behavior when reaching end
    if (showNext && currentTime >= duration - 0.5) {
      console.log('Auto-playing next episode...');
      // Logic to actually trigger next episode
    }
  }, [currentTime, duration, showNext]);

  return (
    <AnimatePresence>
      {showNext && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: controlsVisible ? 0 : 64 // Shift down if controls hide
          }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute bottom-[90px] right-8 z-40 bg-[rgba(20,20,20,0.96)] border border-white/10 rounded-md overflow-hidden flex shadow-2xl w-[320px] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-[120px] h-[68px] flex-shrink-0 cursor-pointer group" onClick={() => console.log('Playing next!')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/thumbnails/drama-2.jpg" alt="Next Episode" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
            {/* Auto-play progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
               <motion.div 
                 className="h-full bg-white" 
                 initial={{ width: '100%' }}
                 animate={{ width: '0%' }}
                 transition={{ duration: 10, ease: 'linear' }} // 10s countdown
               />
            </div>
          </div>
          
          <div className="flex-1 p-3 min-w-0 flex flex-col justify-center relative">
            <button 
              onClick={() => setIsDismissed(true)}
              className="absolute top-1 right-1 p-1 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-0.5">Next Episode</span>
            <span className="text-sm font-bold text-white truncate pr-4">Winter is Coming</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
