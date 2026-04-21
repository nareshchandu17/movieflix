"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clip } from "@/lib/scenes/types";
import { FiX, FiExternalLink } from "react-icons/fi";

interface PlayerModalProps {
  clip: Clip | null;
  onClose: () => void;
}

export default function PlayerModal({ clip, onClose }: PlayerModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (clip) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [clip, handleKeyDown]);

  return (
    <AnimatePresence>
      {clip && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content - Reels Style Vertical Container */}
          <motion.div
            className="relative z-10 w-full max-w-[400px] h-[85vh] mx-auto flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Playback Container */}
            <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group/player">
              <iframe
                src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
                title={clip.title}
              />

              {/* Minimal Overlay - only visible on hover */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-500 p-6 flex flex-col justify-end">
                 <h3 className="text-white text-base font-bold line-clamp-2 mb-1">
                   {clip.title}
                 </h3>
                 <p className="text-white/60 text-xs font-medium">@{clip.channel.replace(/ /g, '').toLowerCase()}</p>
              </div>
            </div>

            {/* Floating Close Button - Styled like a Reels exit */}
            <button
              onClick={onClose}
              className="absolute -top-4 -right-12 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60
                         flex items-center justify-center text-white transition-all duration-200 backdrop-blur-md border border-white/10"
              aria-label="Close player"
            >
              <FiX size={20} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
