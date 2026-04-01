import { useSubtitles } from '@/hooks/useSubtitles';
import { motion, AnimatePresence } from 'framer-motion';

export function SubtitleRenderer() {
  const { activeCue } = useSubtitles();

  return (
    <div className="absolute bottom-24 left-0 right-0 pointer-events-none flex justify-center z-40 px-8">
      <AnimatePresence>
        {activeCue && (
          <motion.div
            key={activeCue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-center max-w-[75%]"
          >
            <span 
              className="text-white font-medium text-[20px] md:text-[24px]"
              style={{
                textShadow: '0px 0px 4px rgba(0,0,0,1), 0px 0px 8px rgba(0,0,0,0.8), 1px 1px 0px rgba(0,0,0,1), -1px -1px 0px rgba(0,0,0,1), 1px -1px 0px rgba(0,0,0,1), -1px 1px 0px rgba(0,0,0,1)'
              }}
            >
              {activeCue}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
