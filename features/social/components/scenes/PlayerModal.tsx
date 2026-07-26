"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clip } from "@/lib/scenes/types";
import { 
  FiX, 
  FiHeart, 
  FiMessageCircle, 
  FiSend, 
  FiBookmark, 
  FiMoreVertical, 
  FiChevronUp, 
  FiChevronDown,
  FiMusic
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

interface PlayerModalProps {
  clips: Clip[];
  startIndex: number;
  onClose: () => void;
}

export default function PlayerModal({ clips, startIndex, onClose }: PlayerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [direction, setDirection] = useState(0); // 1 for down, -1 for up

  useEffect(() => {
    setCurrentIndex(startIndex);
    setIsLiked(false);
  }, [startIndex]);

  const activeClip = useMemo(() => clips[currentIndex] || null, [clips, currentIndex]);

  // Derived mock stats
  const stats = useMemo(() => {
    if (!activeClip) return { likes: "0", comments: "0" };
    const views = parseInt(activeClip.views.replace(/[^0-9]/g, "")) || 1000;
    return {
      likes: (views / 150).toFixed(1) + "K",
      comments: Math.floor(views / 1200)
    };
  }, [activeClip]);

  const handleNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setIsLiked(false);
    }
  }, [currentIndex, clips.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setIsLiked(false);
    }
  }, [currentIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowUp") handlePrev();
      if (e.key === "ArrowDown") handleNext();
    },
    [onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    if (activeClip) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeClip, handleKeyDown]);

  const variants = {
    initial: (direction: number) => ({
      y: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (!activeClip) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-overlay"
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Main Content Area */}
        <div className="relative flex items-center gap-4 md:gap-8 max-w-7xl w-full h-full justify-center">
          
          {/* Vertical Reel Container */}
          <div className="relative h-[92vh] aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col group">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeClip.id}
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Video Player */}
                <iframe
                  src={`https://www.youtube.com/embed/${activeClip.id}?autoplay=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&loop=1&playlist=${activeClip.id}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  className="w-full h-full border-0 brightness-110 pointer-events-none"
                />

                {/* Bottom-to-Top interaction gradient */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Information Overlay (Bottom Left) */}
                <div className="absolute bottom-0 left-0 right-16 p-5 flex flex-col gap-3 z-10 pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-zinc-800 shadow-lg">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${activeClip.channel}&background=random&color=fff`} 
                        alt={activeClip.channel}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white font-bold text-sm drop-shadow-md">
                      {activeClip.channel}
                    </span>
                    <button className="px-3 py-1 bg-transparent border border-white text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors">
                      Follow
                    </button>
                  </div>

                  <div className="text-white text-sm font-medium leading-snug drop-shadow-md">
                    <p className="line-clamp-2 uppercase tracking-wide">
                      {activeClip.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                    <FiMusic className="text-white" />
                    <span className="overflow-hidden whitespace-nowrap">
                       <motion.span
                         animate={{ x: [0, -100, 0] }}
                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         className="inline-block"
                       >
                         {activeClip.channel} • Original Audio
                       </motion.span>
                    </span>
                  </div>
                </div>

                {/* Interaction Sidebar (Right) */}
                <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 z-20 pointer-events-auto">
                  <div className="flex flex-col items-center gap-1 group/btn">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                      className="p-2 transition-transform active:scale-125"
                    >
                      {isLiked ? (
                        <FaHeart className="text-red-500 text-2xl drop-shadow-glow" />
                      ) : (
                        <FiHeart className="text-white text-2xl hover:text-white/70" />
                      )}
                    </button>
                    <span className="text-[10px] text-white font-bold">{stats.likes}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-2">
                       <FiMessageCircle className="text-white text-2xl hover:text-white/70 transition-colors" />
                    </button>
                    <span className="text-[10px] text-white font-bold">{stats.comments}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-2">
                       <FiSend className="text-white text-2xl hover:text-white/70 transition-colors" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-2">
                       <FiBookmark className="text-white text-2xl hover:text-white/70 transition-colors" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <button className="p-2">
                       <FiMoreVertical className="text-white text-xl hover:text-white/70 transition-colors" />
                    </button>
                  </div>

                  <div className="mt-2 w-7 h-7 rounded bg-zinc-800 border border-white/20 overflow-hidden shadow-lg animate-pulse">
                    <img 
                      src={activeClip.thumbnail} 
                      className="w-full h-full object-cover scale-150 rotate-45"
                      alt="audio icon"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* External Controls & Navigation (Desktop Only) */}
          <div className="hidden lg:flex flex-col justify-center gap-4">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full bg-zinc-900/80 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-zinc-700"
              >
                <FiChevronUp size={28} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                disabled={currentIndex === clips.length - 1}
                className="w-12 h-12 rounded-full bg-zinc-900/80 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-zinc-700"
              >
                <FiChevronDown size={28} />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
          >
            <FiX size={32} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
