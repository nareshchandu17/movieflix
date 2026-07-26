"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Users, 
  Lock, 
  Unlock, 
  Crown, 
  Shield, 
  Ban,
  Volume2,
  Video,
  Monitor,
  Eye,
  EyeOff,
  Copy,
  Check,
  X
} from "lucide-react";

interface RoomSettingsProps {
  roomId: string;
  isHost: boolean;
  participants: Array<{
    userId: string;
    userName: string;
    isHost: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    socketId: string;
  }>;
  currentSettings: {
    isPrivate: boolean;
    password?: string;
    maxParticipants: number;
    allowScreenShare: boolean;
    requireApproval: boolean;
    muteOnJoin: boolean;
    videoOffOnJoin: boolean;
  };
  onSettingsUpdate: (settings: any) => void;
  onParticipantAction: (action: string, userId: string) => void;
  className?: string;
}

export default function RoomSettings({
  roomId,
  isHost,
  participants,
  currentSettings,
  onSettingsUpdate,
  onParticipantAction,
  className = ""
}: RoomSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'participants' | 'permissions'>('general');
  const [settings, setSettings] = useState(currentSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsUpdate(newSettings);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const ParticipantItem = ({ participant }: { participant: any }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div
        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            {participant.isHost ? (
              <Crown className="w-5 h-5 text-yellow-400" />
            ) : (
              <div className="text-white font-bold">
                {participant.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-medium">
              {participant.userName}
              {participant.isHost && (
                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                  HOST
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              {participant.isMuted && <Volume2 className="w-3 h-3" />}
              {participant.isVideoOff && <Video className="w-3 h-3" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isHost && !participant.isHost && showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex gap-1"
            >
              <button
                onClick={() => onParticipantAction('mute', participant.userId)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Mute participant"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onParticipantAction('videoOff', participant.userId)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                title="Turn off video"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => onParticipantAction('kick', participant.userId)}
                className="p-2 bg-red-600 hover:bg-red-500 rounded text-white"
                title="Remove participant"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`room-settings ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 p-3 rounded-lg transition-all ${
          isOpen 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-800 hover:bg-gray-700'
        } text-white`}
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Room Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Room ID */}
              <div className="mt-3 p-2 bg-gray-800 rounded-lg flex items-center gap-2">
                <span className="text-sm text-gray-400">Room ID:</span>
                <span className="text-white font-mono flex-1">{roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="p-1 hover:bg-gray-700 rounded text-white"
                >
                  {copiedRoomId ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'general'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'participants'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Participants ({participants.length})
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'permissions'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Permissions
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  {/* Room Privacy */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      {settings.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      Room Privacy
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSettingChange('isPrivate', false)}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          !settings.isPrivate
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => handleSettingChange('isPrivate', true)}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                          settings.isPrivate
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  {settings.isPrivate && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">Room Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={settings.password || ''}
                          onChange={(e) => handleSettingChange('password', e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Max Participants */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max Participants
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={settings.maxParticipants}
                        onChange={(e) => handleSettingChange('maxParticipants', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-white font-medium w-8">{settings.maxParticipants}</span>
                    </div>
                  </div>

                  {/* Screen Share */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Allow Screen Sharing
                    </label>
                    <button
                      onClick={() => handleSettingChange('allowScreenShare', !settings.allowScreenShare)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.allowScreenShare ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.allowScreenShare ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Participants */}
              {activeTab === 'participants' && (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <ParticipantItem key={participant.userId} participant={participant} />
                  ))}
                </div>
              )}

              {/* Permissions */}
              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  {/* Host Only Controls */}
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Host Only Controls</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Only the host can change these settings and control playback.
                    </p>
                  </div>

                  {/* Require Approval */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Require Approval to Join
                    </label>
                    <button
                      onClick={() => handleSettingChange('requireApproval', !settings.requireApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.requireApproval ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Mute on Join */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Mute Participants on Join
                    </label>
                    <button
                      onClick={() => handleSettingChange('muteOnJoin', !settings.muteOnJoin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.muteOnJoin ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.muteOnJoin ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Video Off on Join */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Turn Off Video on Join
                    </label>
                    <button
                      onClick={() => handleSettingChange('videoOffOnJoin', !settings.videoOffOnJoin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.videoOffOnJoin ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.videoOffOnJoin ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
