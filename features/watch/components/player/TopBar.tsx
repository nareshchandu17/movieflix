import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/features/watch/hooks/usePlayerState';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "" }: TopBarProps) {
  const controlsVisible = usePlayerState(s => s.controlsVisible);
  const router = useRouter();

  // Split title for episodes (e.g. "Series Title - S1E2: Episode Title")
  let mainTitle = title;
  let subtitle = "";
  
  const match = title.match(/^(.*?) - (S\d+E\d+:.*)$/);
  if (match) {
    mainTitle = match[1];
    subtitle = match[2];
  }

  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="absolute top-0 left-0 right-0 z-50 px-8 pt-8 pb-16 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-6 pointer-events-none"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); router.back(); }}
            className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
            aria-label="Back to Browse"
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          
          <div className="flex items-end gap-3 pointer-events-none">
            <h1 className="text-white text-2xl font-bold tracking-wide text-shadow-md">{mainTitle || "Untitled Video"}</h1>
            {subtitle && (
              <span className="text-white/60 text-sm font-medium pb-1.5">{subtitle}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
