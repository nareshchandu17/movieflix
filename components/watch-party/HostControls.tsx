"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings, 
  Users, 
  Shield, 
  Crown,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Eye,
  EyeOff
} from "lucide-react";

interface HostControlsProps {
  isHost: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  participants: Array<{
    userId: string;
    userName: string;
    isHost: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  }>;
  roomSettings: {
    isPrivate: boolean;
    maxParticipants: number;
    allowScreenShare: boolean;
  };
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onFullscreen: () => void;
  onParticipantAction: (action: string, userId: string) => void;
  onRoomSettings: () => void;
  className?: string;
}

export default function HostControls({
  isHost,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  participants,
  roomSettings,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onSkipForward,
  onSkipBackward,
  onFullscreen,
  onParticipantAction,
  onRoomSettings,
  className = ""
}: HostControlsProps) {
  const [showVolume, setShowVolume] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !isHost) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  };

  // Handle progress bar drag
  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !progressBarRef.current || !isHost) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    onSeek(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`host-controls bg-black/80 backdrop-blur-lg rounded-lg p-4 ${className}`}>
      {/* Progress Bar */}
      <div 
        ref={progressBarRef}
        className={`relative h-2 bg-gray-700 rounded-full mb-4 cursor-pointer ${
          isHost ? 'hover:bg-gray-600' : 'cursor-not-allowed'
        }`}
        onClick={handleProgressClick}
        onMouseDown={() => isHost && setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleProgressDrag}
      >
        <div 
          className="absolute h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        <div 
          className="absolute h-4 w-4 bg-white rounded-full top-1/2 transform -translate-y-1/2 shadow-lg"
          style={{ left: `${progressPercentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Skip Backward */}
        <button
          onClick={onSkipBackward}
          disabled={!isHost}
          className={`p-2 rounded-full transition-colors ${
            isHost 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title={isHost ? "Skip backward 10s" : "Only host can control playback"}
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!isHost}
          className={`p-4 rounded-full transition-colors ${
            isHost 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title={isHost ? (isPlaying ? "Pause" : "Play") : "Only host can control playback"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        {/* Skip Forward */}
        <button
          onClick={onSkipForward}
          disabled={!isHost}
          className={`p-2 rounded-full transition-colors ${
            isHost 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title={isHost ? "Skip forward 10s" : "Only host can control playback"}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Left Side - Volume & Settings */}
        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="relative">
            <button
              onClick={onMute}
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Volume Slider */}
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 rounded-lg p-3"
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={(e) => onVolumeChange(parseInt(e.target.value) / 100)}
                    className="w-24"
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {Math.round(isMuted ? 0 : volume * 100)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings Button */}
          {isHost && (
            <button
              onClick={onRoomSettings}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
              title="Room Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Side - Participants & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Participants */}
          <div className="relative">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors flex items-center gap-1"
              title={`Participants (${participants.length}/${roomSettings.maxParticipants})`}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs">{participants.length}</span>
            </button>

            {/* Participants Dropdown */}
            <AnimatePresence>
              {showParticipants && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl w-64 max-h-64 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Participants</span>
                      <span className="text-xs text-gray-400">
                        {participants.length}/{roomSettings.maxParticipants}
                      </span>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {participants.map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between p-3 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                            {participant.isHost ? (
                              <Crown className="w-3 h-3 text-yellow-400" />
                            ) : (
                              <div className="text-white text-xs">
                                {participant.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-white truncate">
                            {participant.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {participant.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                          {participant.isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Host Indicator */}
      {isHost && (
        <div className="mt-3 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
            <Crown className="w-3 h-3" />
            <span>You are the host</span>
          </div>
        </div>
      )}

      {/* Room Status */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
        {roomSettings.isPrivate && (
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Private Room</span>
          </div>
        )}
        {!roomSettings.allowScreenShare && (
          <div className="flex items-center gap-1">
            <EyeOff className="w-3 h-3" />
            <span>No Screen Share</span>
          </div>
        )}
      </div>
    </div>
  );
}
