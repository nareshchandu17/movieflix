"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, Maximize2, MessageCircle, Heart, Laugh, ThumbsUp, Send, Users, Settings } from 'lucide-react';
import Image from 'next/image';
import { useWatchPartySocket } from '@/hooks/useWatchPartySocket';

interface WatchPartyPlayerProps {
  watchParty: {
    _id: string;
    movieId: string;
    movieTitle: string;
    moviePoster: string;
    roomCode: string;
    circleId: string;
    hostId: string;
    participants: Array<{
      userId: string;
      userName: string;
      userImage: string;
    }>;
  };
  userId: string;
  userName: string;
  userImage: string;
  onLeave: () => void;
}

export function WatchPartyPlayer({ watchParty, userId, userName, userImage, onLeave }: WatchPartyPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [currentVolume, setCurrentVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [watchDuration, setWatchDuration] = useState(0);
  const [showReactions, setShowReactions] = useState(true);

  const {
    socketState,
    playbackState,
    chatMessages,
    reactions,
    play,
    pause,
    seek,
    setVolume,
    updateProgress,
    setBuffering,
    sendMessage,
    sendReaction
  } = useWatchPartySocket(watchParty.roomCode, userId);

  // Sync video with socket events
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Handle play/pause from other users
    if (playbackState.isPlaying && video.paused) {
      video.play().catch(console.error);
    } else if (!playbackState.isPlaying && !video.paused) {
      video.pause();
    }

    // Handle seek from other users
    if (Math.abs(video.currentTime - playbackState.currentTime) > 1) {
      video.currentTime = playbackState.currentTime;
    }

    // Handle volume from other users
    if (Math.abs(video.volume - playbackState.volume) > 0.1) {
      video.volume = playbackState.volume;
      setCurrentVolume(playbackState.volume);
    }
  }, [playbackState, videoRef.current]);

  // Track watch duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setWatchDuration(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      play(videoRef.current.currentTime);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      pause(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      seek(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendMessage(chatInput.trim(), userName);
      setChatInput('');
    }
  };

  const handleReaction = (type: string) => {
    if (videoRef.current) {
      sendReaction(type, userName, videoRef.current.currentTime);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatWatchDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="relative w-full h-screen bg-black flex">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        {/* Video Player */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={watchParty.moviePoster}
            onPlay={handlePlay}
            onPause={handlePause}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onTimeUpdate={() => {
              if (videoRef.current) {
                updateProgress(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={(e) => {
              if (videoRef.current) {
                updateProgress(videoRef.current.currentTime);
              }
            }}
          >
            <source src={`/api/movie/stream/${watchParty.movieId}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Buffering Indicator */}
          <AnimatePresence>
            {isBuffering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-white text-sm">Buffering...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reactions Overlay */}
          <AnimatePresence>
            {showReactions && (
              <div className="absolute top-4 right-4 space-y-2">
                {reactions.map(reaction => (
                  <motion.div
                    key={reaction.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full"
                  >
                    <span className="text-2xl">
                      {reaction.type === 'like' && '👍'}
                      {reaction.type === 'love' && '❤️'}
                      {reaction.type === 'laugh' && '😂'}
                      {reaction.type === 'surprised' && '😮'}
                      {reaction.type === 'sad' && '😢'}
                      {reaction.type === 'angry' && '😠'}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                      {reaction.userName}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Room Info */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="text-center">
              <p className="text-white font-semibold">{watchParty.movieTitle}</p>
              <p className="text-gray-300 text-sm">Room: {watchParty.roomCode}</p>
              <p className="text-gray-400 text-xs">{watchParty.participants.length} watching</p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={videoRef.current?.duration || 100}
                value={playbackState.currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(playbackState.currentTime)}</span>
                <span>{formatTime(videoRef.current?.duration || 0)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={playbackState.isPlaying ? handlePause : handlePlay}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {playbackState.isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentVolume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleFullscreen}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-white text-sm">
                <span>🔥 {formatWatchDuration(watchDuration)}</span>
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  React
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={onLeave}
                  className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
                >
                  Leave Party
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reaction Buttons */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
          {['like', 'love', 'laugh', 'surprised'].map(reaction => (
            <button
              key={reaction}
              onClick={() => handleReaction(reaction)}
              className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <span className="text-xl">
                {reaction === 'like' && '👍'}
                {reaction === 'love' && '❤️'}
                {reaction === 'laugh' && '😂'}
                {reaction === 'surprised' && '😮'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 bg-[#111] border-l border-white/10 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Watch Party Chat
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  {watchParty.participants.length}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm">No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map(message => (
                  <div key={message.id} className="flex gap-3">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={`/api/placeholder/32/32`}
                        alt={message.userName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{message.userName}</p>
                      <p className="text-gray-300 text-sm">{message.message}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status */}
      {!socketState.isConnected && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg">
          Reconnecting...
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ef4444;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}
