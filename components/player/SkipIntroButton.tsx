import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';

export function SkipIntroButton() {
  const { currentTime, introStartTime, introEndTime, seek } = usePlayerState();
  const isIntro = introStartTime !== undefined && introEndTime !== undefined && currentTime >= introStartTime && currentTime < introEndTime;

  return (
    <AnimatePresence>
      {isIntro && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-24 right-8 z-40"
        >
          <button
            onClick={(e) => { e.stopPropagation(); seek(introEndTime ?? 0); }}
            className="group px-4 py-2 bg-black/40 border-[1.5px] border-white/80 rounded hover:bg-white hover:border-white transition-colors duration-200"
          >
            <span className="text-white group-hover:text-black font-semibold text-sm tracking-wide transition-colors">
              Skip Intro
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
