import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControl } from './VolumeControl';
import { ProgressBar } from './ProgressBar';
import { TimeDisplay } from './TimeDisplay';
import { QualityBadge } from './QualityBadge';
import { SubtitlesPanel } from './SubtitlesPanel';
import { Settings, Maximize, Minimize, Captions, Layers, Video } from 'lucide-react';

export function ControlsOverlay({ isWatchParty }: { isWatchParty?: boolean }) {
  const { controlsVisible, activePanel, togglePanel, isFullscreen, setIsFullscreen, setReactionMode } = usePlayerState();

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.5)] to-transparent pt-32 pb-4 px-8 pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // Prevent bubbling up to PlayerRoot (which toggles play/pause)
        >
          {/* Top Layer: Scrubber */}
          <div className="mb-2 -mx-4">
             <ProgressBar />
          </div>

          {/* Bottom Layer: Controls Row */}
          <div className="flex items-center justify-between mt-2">
            
            {/* Left Controls */}
            <div className="flex items-center gap-6">
              <PlaybackControls isWatchParty={isWatchParty} />
              <VolumeControl />
              <TimeDisplay />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-5">
              <QualityBadge />
              
              <div className="px-1.5 border-[1.5px] border-white/40 rounded text-[9px] font-bold text-white/50 tracking-widest hidden sm:block">
                5.1
              </div>

              <button 
                onClick={() => togglePanel('episodes')}
                className={`text-white transition-all transform hover:scale-110 active:scale-95 ${activePanel === 'episodes' ? 'scale-110 text-white' : 'text-white/80'}`}
                aria-label="Episodes"
              >
                <Layers className="w-6 h-6" />
              </button>
              
              {/* Episodes Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                  Episodes
                </div>
              </div>

              <button 
                onClick={() => togglePanel('subtitles')}
                className={`text-white transition-all transform hover:scale-110 active:scale-95 ${activePanel === 'subtitles' ? 'scale-110 text-white' : 'text-white/80'}`}
                aria-label="Subtitles"
              >
                <Captions className="w-6 h-6" />
              </button>
              
              {/* CC Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                  Subtitles
                </div>
              </div>
              
              <button 
                onClick={() => togglePanel('settings')} // Using settings panel for speed/quality too
                className={`text-white transition-all transform hover:scale-110 active:scale-95 ${activePanel === 'settings' ? 'scale-110 text-white' : 'text-white/80'}`}
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>

              <button 
                onClick={handleFullscreenToggle}
                className="text-white/80 hover:text-white transition-all transform hover:scale-110 active:scale-95 mx-2"
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" strokeWidth={2.5} /> : <Maximize className="w-5 h-5" strokeWidth={2.5} />}
              </button>

              {/* Record Reaction Button - Hidden in Watch Party */}
              {!isWatchParty && (
                <div className="relative group">
                  <button
                    onClick={() => setReactionMode(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider rounded-md border border-white/20 hover:border-red-500 transition-all shadow-md group ml-1"
                  >
                    <Video className="w-4 h-4 text-white/80 group-hover:text-white" />
                    <span className="hidden sm:inline">React</span>
                  </button>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                      🎥 Record your reaction & share the moment
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
