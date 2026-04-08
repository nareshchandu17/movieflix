"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Maximize2, 
  Wifi, 
  WifiOff, 
  Battery,
  Signal
} from "lucide-react";
import type { VideoStream } from "@/lib/webrtc";
import { useMobileOptimization, useTouchGestures, useBandwidthOptimization } from "@/hooks/useMobileOptimization";

interface MobileVideoGridProps {
  participants: VideoStream[];
  localStream?: MediaStream | null;
  onToggleVideo?: (userId: string) => void;
  onToggleAudio?: (userId: string) => void;
  onToggleScreenShare?: () => void;
  className?: string;
}

export default function MobileVideoGrid({ 
  participants, 
  localStream, 
  onToggleVideo, 
  onToggleAudio, 
  onToggleScreenShare,
  className = "" 
}: MobileVideoGridProps) {
  const {
    isMobile,
    isTablet,
    orientation,
    connectionType,
    bandwidthOptimized,
    touchEnabled,
    viewportSize,
    videoQuality,
    getOptimalGridSize,
    toggleBandwidthOptimization
  } = useMobileOptimization();

  const { gesture, handleTouchStart, handleTouchEnd, handleTouchMove } = useTouchGestures();
  const { bandwidthMode, getDataUsageStats } = useBandwidthOptimization();
  
  const [maximizedVideo, setMaximizedVideo] = useState<string | null>(null);
  const [focusedVideo, setFocusedVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Calculate optimal grid layout
  const gridSize = useMemo(() => {
    const allStreams = [
      ...(localStream ? [{ userId: 'local', stream: localStream }] : []),
      ...participants
    ];
    return getOptimalGridSize(allStreams.length);
  }, [participants, localStream, getOptimalGridSize]);

  // Get grid class based on device and participant count
  const getGridClass = () => {
    const allStreams = [
      ...(localStream ? [{ userId: 'local', stream: localStream }] : []),
      ...participants
    ];
    const count = allStreams.length;

    if (isMobile) {
      if (count === 1) return 'grid-cols-1';
      if (count === 2 && orientation === 'landscape') return 'grid-cols-2';
      return 'grid-cols-1'; // Stack vertically on mobile
    }

    if (isTablet) {
      if (count <= 2) return 'grid-cols-2';
      if (count <= 4) return 'grid-cols-2';
      return 'grid-cols-3';
    }

    // Desktop
    if (count === 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Get video quality constraints
  const getVideoConstraints = (quality: string) => {
    switch (quality) {
      case 'low':
        return { width: 320, height: 240, frameRate: 15 };
      case 'medium':
        return { width: 640, height: 480, frameRate: 25 };
      case 'high':
        return { width: 1280, height: 720, frameRate: 30 };
      default:
        return { width: 854, height: 480, frameRate: 30 };
    }
  };

  const VideoTile = ({ 
    stream, 
    isLocal 
  }: { 
    stream: VideoStream; 
    isLocal?: boolean;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    useEffect(() => {
      if (videoRef.current && stream.stream) {
        videoRef.current.srcObject = stream.stream;
        
        // Apply quality constraints
        const constraints = getVideoConstraints(videoQuality);
        if (videoRef.current.videoWidth > constraints.width) {
          videoRef.current.style.width = `${constraints.width}px`;
          videoRef.current.style.height = `${constraints.height}px`;
        }
      }
    }, [stream.stream, videoQuality]);

    const isScreenShare = stream.isScreenShare;
    const displayName = isLocal ? "You" : stream.userId;
    const isFocused = focusedVideo === stream.userId;
    const isMaximized = maximizedVideo === stream.userId;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative bg-gray-900 rounded-lg overflow-hidden
          ${isMaximized ? 'fixed inset-0 z-50' : ''}
          ${isLocal ? 'ring-2 ring-blue-500' : ''}
          ${isFocused ? 'ring-2 ring-green-500' : ''}
          ${isMobile ? 'aspect-video' : 'aspect-video'}
          transition-all duration-200
        `}
        onTouchStart={touchEnabled ? handleTouchStart : undefined}
        onTouchEnd={touchEnabled ? handleTouchEnd : undefined}
        onTouchMove={touchEnabled ? handleTouchMove : undefined}
        onClick={() => {
          if (!isLocal) {
            setMaximizedVideo(maximizedVideo === stream.userId ? null : stream.userId);
            setFocusedVideo(stream.userId);
          }
        }}
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
            ${isMobile ? 'cursor-pointer' : 'cursor-pointer hover:brightness-110'}
          `}
        />

        {/* Video Off Overlay */}
        {isVideoOff && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
            <VideoOff className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-white text-sm">Camera Off</span>
          </div>
        )}

        {/* Mobile Touch Controls Overlay */}
        {isMobile && touchEnabled && (
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
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
                {isScreenShare && " - Screen"}
              </span>
            </div>

            {/* Connection Quality */}
            <div className="flex items-center gap-1">
              {connectionType === 'wifi' || connectionType === '4g' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : connectionType === '3g' ? (
                <Signal className="w-4 h-4 text-yellow-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              {bandwidthOptimized && (
                <div className="w-2 h-2 bg-orange-400 rounded-full" title="Bandwidth optimized" />
              )}
            </div>
          </div>
        </div>

        {/* Focus Indicator */}
        {isFocused && !isMaximized && (
          <div className="absolute top-2 left-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
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

  const dataStats = getDataUsageStats();

  // Set srcObject for maximized video
  useEffect(() => {
    if (maximizedVideo && videoRefs.current[maximizedVideo]) {
      const stream = allStreams.find((s) => s.userId === maximizedVideo)?.stream;
      if (stream) {
        videoRefs.current[maximizedVideo]!.srcObject = stream;
      }
    }
  }, [maximizedVideo, allStreams]);

  return (
    <div className={`mobile-video-grid ${getGridClass()} ${className} gap-2 md:gap-4 p-2 md:p-4`}>
      {/* Mobile Status Bar */}
      {isMobile && (
        <div className="col-span-full bg-black/50 backdrop-blur rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2">
              <Battery className="w-3 h-3" />
              <span>{bandwidthMode.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{dataStats.totalMB} MB used</span>
              <button
                onClick={toggleBandwidthOptimization}
                className={`px-2 py-1 rounded text-xs ${
                  bandwidthOptimized 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {bandwidthOptimized ? 'Optimized' : 'Auto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <AnimatePresence mode="wait">
        {allStreams.map((stream) => (
          <VideoTile
            key={stream.userId}
            stream={stream}
            isLocal={stream.userId === 'local'}
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
          <div className="relative w-full h-full">
            <video
              ref={(el) => {
                if (maximizedVideo) {
                  videoRefs.current[maximizedVideo] = el;
                }
              }}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            
            {/* Mobile Controls */}
            {isMobile && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <button
                  onClick={() => setMaximizedVideo(null)}
                  className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
                >
                  ×
                </button>
                <div className="flex gap-2">
                  <button
                    className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
                    onClick={() => onToggleVideo?.(maximizedVideo)}
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
                    onClick={() => onToggleAudio?.(maximizedVideo)}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Controls */}
            {!isMobile && (
              <button
                onClick={() => setMaximizedVideo(null)}
                className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white text-xl"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Gesture Indicator */}
      {gesture && (
        <div className="fixed top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          {gesture.type} {gesture.direction && `- ${gesture.direction}`}
        </div>
      )}
    </div>
  );
}
