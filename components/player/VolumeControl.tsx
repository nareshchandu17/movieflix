import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerState } from '@/hooks/usePlayerState';

export function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = usePlayerState();
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Derive active volume considering mute state
  const activeVolume = muted ? 0 : volume;

  const handleSliderUpdate = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newVol = x / rect.width;
    setVolume(newVol);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    handleSliderUpdate(e.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (isDragging.current) {
        handleSliderUpdate(moveEvent.clientX);
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div 
      className="flex items-center group relative h-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { if (!isDragging.current) setIsHovered(false) }}
      onClick={(e) => e.stopPropagation()} // Prevent toggling play state when clicking volume area
    >
      {/* Mute Toggle Button */}
      <button
        onClick={toggleMute}
        className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white transition-all hover:scale-110 active:scale-90"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.4rem] h-[1.4rem] drop-shadow-md">
          {/* Base Speaker Shell */}
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          {/* If Muted, overlay a strike-through cross */}
          {muted && (
            <path d="M21 4.5l-1.5-1.5-18 18 1.5 1.5 18-18z" stroke="currentColor" strokeWidth={1} />
          )}
        </svg>
      </button>

      {/* Expandable Slider Wrapper */}
      <motion.div
        className="overflow-hidden flex items-center h-full origin-left"
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: isHovered ? 72 : 0, 
          opacity: isHovered ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div 
          ref={sliderRef}
          className="relative w-full h-[5px] mx-1 bg-white/30 rounded-full cursor-pointer group/slider flex items-center"
          onPointerDown={onPointerDown}
        >
          {/* Active Fill Track */}
          <div 
            className="absolute left-0 h-full bg-[#E50914] rounded-full"
            style={{ width: `${activeVolume * 100}%` }}
          />
          {/* Thumb Indicator */}
          <div 
            className="absolute w-[13px] h-[13px] bg-[#E50914] rounded-full shadow-lg transition-transform scale-0 group-hover/slider:scale-100"
            style={{ left: `calc(${activeVolume * 100}% - 6px)` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
