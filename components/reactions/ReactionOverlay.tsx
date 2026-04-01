import { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Square } from 'lucide-react';

interface ReactionOverlayProps {
  stream: MediaStream | null;
  isRecording: boolean;
  onStop: () => void;
  onCancel: () => void;
  maxDuration: number; // in seconds
}

export function ReactionOverlay({ stream, isRecording, onStop, onCancel, maxDuration }: ReactionOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragControls = useDragControls();
  const [timeLeft, setTimeLeft] = useState(maxDuration);

  // Bind live stream to local video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Tick timer down
  useEffect(() => {
    if (!isRecording) return;
    
    setTimeLeft(maxDuration);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, maxDuration]);

  // Prevent parent player click interference (so you can drag without pausing video)
  const handleWrapperClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0} // Disable elasticity so it stays exactly where dropped
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Technically constrained by parent overflow, but we let it wander safely
      onClick={handleWrapperClick}
      className="absolute bottom-32 right-8 z-[100] w-[200px] h-[355px] bg-black/80 rounded-2xl overflow-hidden shadow-2xl border-[1.5px] border-white/20 backdrop-blur-md flex flex-col group cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Draggable Header Handle */}
      <div 
        className="h-8 w-full flex items-center justify-between px-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 z-10"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          {isRecording && (
            <motion.div 
              animate={{ opacity: [1, 0.4, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
            />
          )}
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">
            {isRecording ? `00:${timeLeft.toString().padStart(2, '0')}` : 'REC READY'}
          </span>
        </div>
        
        {!isRecording && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="text-white/60 hover:text-white pointer-events-auto"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Video Feed */}
      <div className="flex-1 bg-zinc-900 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
        />
        
        {/* Hover Controls */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${!isRecording ? 'hidden' : ''}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); onStop(); }}
            className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-xl border-2 border-white/20"
          >
            <Square className="w-5 h-5 text-white fill-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
