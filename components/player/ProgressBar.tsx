import { useRef, useState, useMemo } from 'react';
import { usePlayerState } from '@/hooks/usePlayerState';

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressBar() {
  const { currentTime, duration, buffered, seekToPercent, chapters, movieReactions } = usePlayerState();
  const trackRef = useRef<HTMLDivElement>(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPct, setHoverPct] = useState(0);

  // Guard against divide by zero or NaN
  const safeProgressPct = duration > 0 ? (currentTime / duration) : 0;
  const safeBufferPct = duration > 0 ? (buffered / duration) : 0;

  // Render variables
  const progressPercent = Math.min(100, Math.max(0, safeProgressPct * 100));
  const bufferPercent = Math.min(100, Math.max(0, safeBufferPct * 100));

  // Determine chapter preview
  const hoverTime = hoverPct * duration;
  const hoverChapter = useMemo(() => {
    return chapters.find(c => hoverTime >= c.startTime && hoverTime < c.endTime);
  }, [hoverTime, chapters]);

  const updateScrub = (clientX: number, commit: boolean) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    
    setHoverPct(pct);
    if (commit || isDragging) {
      seekToPercent(pct);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updateScrub(e.clientX, true);

    const onPointerMove = (moveEv: PointerEvent) => {
      updateScrub(moveEv.clientX, true);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging && trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setHoverPct(x / rect.width);
    }
  };

  return (
    <div 
      className="relative w-full px-4 pt-4 pb-2 group/progress cursor-pointer flex flex-col justify-end"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hover Popup (Chapter Preview) */}
      {(isHovering || isDragging) && duration > 0 && (
        <div 
          className="absolute bottom-full mb-3 left-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-75"
          style={{ 
            left: `max(10%, min(90%, ${hoverPct * 100}%))` 
          }}
        >
          {hoverChapter?.thumbnailUrl && (
            <div className="w-[160px] h-[90px] bg-black border-2 border-white/20 rounded-md overflow-hidden mb-1 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hoverChapter.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="text-white font-bold text-shadow-sm text-[15px] drop-shadow-md">
            {formatTime(hoverTime)}
          </div>
          {hoverChapter && (
            <div className="text-white/80 font-medium text-xs truncate max-w-[150px]">
              {hoverChapter.title}
            </div>
          )}
        </div>
      )}

      {/* Track Base */}
      <div 
        ref={trackRef}
        className="relative w-full bg-white/20 rounded-full flex items-center h-[4px] group-hover/progress:h-[6px] transition-all duration-150 overflow-hidden"
      >
        {/* Buffered Region */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full"
          style={{ width: `${bufferPercent}%` }}
        />

        {/* Played Region */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-[#E50914] rounded-full z-10"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Chapter Ticks */}
        {duration > 0 && chapters.map(ch => (
          <div 
            key={ch.id}
            className="absolute top-0 bottom-0 w-[2px] bg-black/50 z-20"
            style={{ left: `${(ch.startTime / duration) * 100}%` }}
          />
        ))}

        {/* Reaction Ticks */}
        {duration > 0 && movieReactions.map(reaction => (
          <div 
            key={reaction._id || reaction.id}
            className="absolute top-1/2 -translate-y-1/2 cursor-pointer z-30 group/tick hover:scale-150 transition-transform duration-200"
            style={{ left: `${(reaction.movieTimestamp / duration) * 100}%` }}
            onClick={(e) => {
              e.stopPropagation();
              const { setActiveReaction, seek } = usePlayerState.getState();
              // Seek 5 seconds before for context, or to the exact timestamp
              seek(Math.max(0, reaction.movieTimestamp - 2)); 
              setActiveReaction(reaction);
            }}
          >
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/tick:opacity-100 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none border border-white/10 backdrop-blur-sm">
               {reaction.moodEmoji} View Reaction
             </div>
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-white/20" />
             <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm pointer-events-none opacity-0 group-hover/tick:opacity-100 transition-opacity">
               {reaction.moodEmoji}
             </span>
          </div>
        ))}
      </div>

      {/* Scrub Thumb (Dragger), sits outside overflow-hidden track */}
      <div 
        className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg z-30 transition-transform ${isHovering || isDragging ? 'scale-100' : 'scale-0'} ${isDragging ? '!scale-125' : ''}`}
        style={{ 
          left: `calc(1rem + ${progressPercent}% - 7px)`, 
          bottom: '7px' // Adjust to precisely align center with the track
        }}
      />
    </div>
  );
}
