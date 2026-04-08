"use client";

import { useEffect, useRef, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Monitor, Maximize2 } from "lucide-react";
import type { VideoStream } from "@/lib/webrtc";

interface VideoGridProps {
  participants: VideoStream[];
  localStream?: MediaStream | null;
  onToggleVideo?: (userId: string) => void;
  onToggleAudio?: (userId: string) => void;
  onToggleScreenShare?: () => void;
  className?: string;
}

interface VideoTileProps {
  stream: VideoStream;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onToggleScreenShare?: () => void;
  onMaximize?: () => void;
}

export default function VideoGrid({ 
  participants, 
  localStream, 
  onToggleVideo, 
  onToggleAudio, 
  onToggleScreenShare,
  className = "" 
}: VideoGridProps) {
  const [maximizedVideo, setMaximizedVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Auto-scroll to ensure local video is visible
  useEffect(() => {
    if (localStream && videoRefs.current['local']) {
      videoRefs.current['local'].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [localStream]);

  const VideoTile = ({ 
    stream, 
    isLocal, 
    isMuted = false, 
    isVideoOff = false,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onMaximize 
  }: VideoTileProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && stream.stream) {
        videoRef.current.srcObject = stream.stream;
      }
    }, [stream.stream]);

    const isScreenShare = stream.isScreenShare;
    const displayName = isLocal ? "You" : stream.userId;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          relative bg-gray-900 rounded-lg overflow-hidden
          ${maximizedVideo === stream.userId ? 'fixed inset-0 z-50' : ''}
          ${isLocal ? 'ring-2 ring-blue-500' : ''}
        `}
        onClick={() => isLocal && setMaximizedVideo(null)}
      >
        {/* Video Element */}
        <video
          ref={(el) => {
            if (el) {
              videoRefs.current[stream.userId] = el;
            }
          }}
          autoPlay
          playsInline
          muted={isLocal || isMuted}
          className={`
            w-full h-full object-cover
            ${isVideoOff ? 'hidden' : ''}
            ${maximizedVideo === stream.userId ? '' : 'cursor-pointer hover:brightness-110'}
          `}
          onClick={() => !isLocal && setMaximizedVideo(
            maximizedVideo === stream.userId ? null : stream.userId
          )}
        />

        {/* Video Off Overlay */}
        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-gray-400" />
            <span className="text-white text-sm">Camera Off</span>
          </div>
        )}

        {/* User Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                {isScreenShare ? (
                  <Monitor className="w-4 h-4 text-blue-400" />
                ) : (
                  <div className="text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-white text-sm font-medium">
                {displayName}
                {isLocal && " (You)"}
                {isScreenShare && " - Screen Share"}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              {!isLocal && onToggleVideo && (
                <button
                  onClick={onToggleVideo}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                  title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                >
                  {isVideoOff ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              )}

              {!isLocal && onToggleAudio && (
                <button
                  onClick={onToggleAudio}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {isLocal && onToggleScreenShare && (
                <button
                  onClick={onToggleScreenShare}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                  title="Share screen"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              )}

              {!isLocal && onMaximize && (
                <button
                  onClick={onMaximize}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                  title="Maximize"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${
            stream.stream ? 'bg-green-500' : 'bg-gray-500'
          }`} />
        </div>
      </motion.div>
    );
  };


  // Combine local stream with participants
  const allStreams = [
    ...(localStream ? [{
      userId: 'local',
      stream: localStream,
      isAudioOnly: false
    }] : []),
    ...participants
  ];

  // Handle maximized video stream
  useEffect(() => {
    if (maximizedVideo && videoRefs.current[maximizedVideo]) {
      const stream = allStreams.find((s) => s.userId === maximizedVideo)?.stream;
      if (stream) {
        videoRefs.current[maximizedVideo]!.srcObject = stream;
      }
    }
  }, [maximizedVideo, allStreams]);

  // Calculate grid layout based on number of participants
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const gridClass = getGridClass(allStreams.length);

  return (
    <div className={`video-grid ${gridClass} ${className} gap-4 p-4`}>
      <AnimatePresence>
        {allStreams.map((stream) => (
          <VideoTile
            key={stream.userId}
            stream={stream}
            isLocal={stream.userId === 'local'}
            onToggleVideo={() => onToggleVideo?.(stream.userId)}
            onToggleAudio={() => onToggleAudio?.(stream.userId)}
            onMaximize={() => setMaximizedVideo(
              maximizedVideo === stream.userId ? null : stream.userId
            )}
          />
        ))}
      </AnimatePresence>

      {/* Maximized Video View */}
      {maximizedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setMaximizedVideo(null)}
        >
          <div className="relative w-full h-full max-w-6xl">
            <video
              ref={(el) => {
                if (el && maximizedVideo) {
                  videoRefs.current[maximizedVideo] = el;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setMaximizedVideo(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

  </div>
  );
}
