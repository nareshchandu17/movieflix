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

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-5xl mx-4"
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                         flex items-center justify-center text-white transition-colors duration-200 backdrop-blur-sm"
              aria-label="Close player"
            >
              <FiX size={20} />
            </button>

            {/* Player */}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10"
                 style={{ aspectRatio: "16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${clip.id}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
                title={clip.title}
              />
            </div>

            {/* Video info */}
            <div className="mt-4 px-1">
              <h3 className="text-white text-lg md:text-xl font-semibold line-clamp-2">
                {clip.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>{clip.channel}</span>
                <span>•</span>
                <span>{clip.views} views</span>
                <span>•</span>
                <span>{clip.duration}</span>
                <a
                  href={`https://www.youtube.com/watch?v=${clip.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <FiExternalLink size={14} />
                  YouTube
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
