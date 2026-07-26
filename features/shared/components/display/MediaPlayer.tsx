"use client";

import React, { useState, useEffect } from "react";

import CatchUpModal from "@/features/watch/components/video/CatchUpModal";
import { ReactionRecorder } from "@/features/social/components/reactions/ReactionRecorder";
import { History, Camera, Video } from "lucide-react";

interface MediaPlayerProps {
  mediaId: string | number;
  title: string;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  className?: string;
}

const MediaPlayer = ({
  mediaId,
  title,
  type = "movie",
  season,
  episode,
  className = "",
}: MediaPlayerProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Reaction Clips State
  const [isSessionActive, setIsSessionActive] = useState(false);



  const embedUrl =
    type === "movie"
      ? `https://v2.vidsrc.me/embed/${mediaId}`
      : season && episode
      ? `https://v2.vidsrc.me/embed/${mediaId}/${season}-${episode}`
      : `https://v2.vidsrc.me/embed/tv/${mediaId}`;

  return (
    <div className={`glass-container p-4 lg:p-6 ${className}`}>
      <div className="relative">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
              Watch {title}
              {type === "tv" && season && episode && (
                <span className="text-primary ml-2 text-lg">
                  S{season}E{episode}
                </span>
              )}
            </h2>
            <div className="w-48 h-px bg-gradient-to-r from-primary to-transparent" />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSessionActive(!isSessionActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                isSessionActive 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                  : 'bg-white/10 border-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Camera className="w-4 h-4" /> 
              {isSessionActive ? 'Reaction Session Active' : 'Start Reaction Session'}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10"
            >
              <History className="w-4 h-4 text-primary" /> Catch Up
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50">
            <iframe
              src={embedUrl}
              title={`${title} - Video Player`}
              className="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div
            className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-blue-500/10 
                        to-primary/10 rounded-2xl blur-xl opacity-50 -z-10"
          />



          {showModal && (
            <CatchUpModal 
              contentId={mediaId.toString()}
              contentType={type === "movie" ? "Movie" : "Series"}
              skippedFrom={0} // To be implemented with dynamic data
              skippedTo={0} // To be implemented with dynamic data
              onClose={() => setShowModal(false)}
            />
          )}

          {/* Feature: Reaction Clips */}
          {isSessionActive && (
            <ReactionRecorder 
              movieId={mediaId.toString()}
              movieTitle={title}
              movieTimestamp={0}
              isOpen={isSessionActive}
              onClose={() => setIsSessionActive(false)}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Streaming in high quality • Auto-adjusts to your connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;

