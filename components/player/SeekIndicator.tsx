import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';

export function SeekIndicator() {
  const { currentTime } = usePlayerState();
  const [flash, setFlash] = useState<{ id: number, type: 'forward' | 'rewind', msg: string } | null>(null);

  // We detect rapid changes in currentTime from user input to trigger the flash
  // Alternatively, this could be driven by a Zustand event bus, 
  // but for simplicity we rely on the parent PlayerRoot to pass refs or fire events.
  // We'll export a method attached to the window for the player root to call.

  useEffect(() => {
    const handleSeekEvent = (e: CustomEvent) => {
      const { type, msg } = e.detail;
      const flashId = Date.now();
      setFlash({ id: flashId, type, msg });
      
      // Auto-hide after 1 second
      setTimeout(() => {
        setFlash(null);
      }, 1000);
    };

    window.addEventListener('player:seek-flash', handleSeekEvent as EventListener);
    return () => window.removeEventListener('player:seek-flash', handleSeekEvent as EventListener);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center">
      <AnimatePresence mode="popLayout">
        {flash && (
          <motion.div
            key={flash.id}
            initial={{ opacity: 0, x: flash.type === 'forward' ? 50 : -50 }}
            animate={{ opacity: 0.8, x: 0 }}
            exit={{ opacity: 0, x: flash.type === 'forward' ? 50 : -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`absolute flex items-center gap-2 ${
              flash.type === 'forward' ? 'right-1/4 translate-x-16' : 'left-1/4 -translate-x-16'
            }`}
          >
            <div className="text-white/80">
              {flash.type === 'forward' ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
                </svg>
              )}
            </div>
            <span className="text-white/90 font-medium text-base">
              {flash.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
