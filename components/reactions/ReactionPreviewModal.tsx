"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, RefreshCcw, Share2, Loader2, Globe, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReactionPreviewModalProps {
  blob: Blob;
  movieId: string;
  movieTitle: string;
  movieTimestamp: number;
  onRetake: () => void;
  onClose: () => void;
}

const MOODS = [
  { emoji: "😱", label: "Shocked" },
  { emoji: "😂", label: "Funny" },
  { emoji: "🔥", label: "Hyped" },
  { emoji: "😭", label: "Sad" },
  { emoji: "🤯", label: "Mind Blown" },
  { emoji: "🍿", label: "Interested" },
];

export function ReactionPreviewModal({
  blob,
  movieId,
  movieTitle,
  movieTimestamp,
  onRetake,
  onClose,
}: ReactionPreviewModalProps) {
  const [selectedMood, setSelectedMood] = useState(MOODS[0].emoji);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (videoRef.current) {
        const url = URL.createObjectURL(blob);
        videoRef.current.src = url;
        return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  const handlePost = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("video", blob, "reaction.webm");
      formData.set("movieId", movieId);
      formData.set("movieTimestamp", movieTimestamp.toString());
      formData.set("moodEmoji", selectedMood);
      formData.set("visibility", visibility);

      const response = await fetch("/api/reactions/create", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Reaction posted to feed!");
        onClose();
        router.refresh();
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Post error:", err);
      toast.error("Failed to post reaction. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-[90vh] md:h-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-white/40 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-20 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="md:w-3/5 relative bg-black aspect-video md:aspect-auto flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10">
          <video
            ref={videoRef}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white font-medium text-sm">
            Previewing Reaction
          </div>
        </div>

        <div className="md:w-2/5 p-8 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-white/[0.03] to-transparent">
          <div>
            <div className="space-y-1 mb-8">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Reacting to</span>
                <h3 className="text-2xl font-bold text-white leading-tight">{movieTitle}</h3>
                <p className="text-white/40 text-sm">Scene at {Math.floor(movieTimestamp / 60)}:{(movieTimestamp % 60).toString().padStart(2, '0')}</p>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-semibold text-white/60 tracking-wide uppercase">Select Mood</label>
              <div className="flex flex-wrap gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => setSelectedMood(mood.emoji)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 ${
                      selectedMood === mood.emoji 
                        ? "bg-white/15 border-white/30 scale-110 shadow-lg" 
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                    }`}
                    title={mood.label}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-semibold text-white/60 tracking-wide uppercase">Visibility</label>
              <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setVisibility("public")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    visibility === "public" ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
                <button
                  onClick={() => setVisibility("private")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    visibility === "private" ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white"
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  Private
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={handlePost}
              disabled={isUploading}
              className="w-full relative h-14 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 overflow-hidden group shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
            >
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Clip...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="post"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Post to Feed</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={onRetake}
              disabled={isUploading}
              className="w-full h-14 flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-semibold"
            >
              <RefreshCcw className="w-5 h-5 mt-0.5" />
              Retake Reaction
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
