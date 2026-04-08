"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Crown, 
  Shield, 
  Ban, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  UserPlus,
  UserMinus,
  Volume2,
  Eye,
  Settings,
  MoreVertical
} from "lucide-react";

interface Participant {
  userId: string;
  userName: string;
  socketId: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  role: 'host' | 'moderator' | 'participant';
}

interface ParticipantManagerProps {
  participants: Participant[];
  currentUserId: string;
  isHost: boolean;
  roomSettings: {
    maxParticipants: number;
    requireApproval: boolean;
    allowScreenShare: boolean;
    muteOnJoin: boolean;
    videoOffOnJoin: boolean;
  };
  pendingRequests?: Array<{
    userId: string;
    userName: string;
    requestedAt: Date;
  }>;
  onParticipantAction: (action: string, userId: string, data?: any) => void;
  onApproveRequest: (userId: string) => void;
  onRejectRequest: (userId: string) => void;
  className?: string;
}

export default function ParticipantManager({
  participants,
  currentUserId,
  isHost,
  roomSettings,
  pendingRequests = [],
  onParticipantAction,
  onApproveRequest,
  onRejectRequest,
  className = ""
}: ParticipantManagerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  const currentUser = participants.find(p => p.userId === currentUserId);
  const nonHostParticipants = participants.filter(p => !p.isHost);
  const canManageParticipants = isHost || currentUser?.role === 'moderator';

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const ParticipantCard = ({ participant, showActions = false }: { participant: Participant; showActions?: boolean }) => {
    const [actionsOpen, setActionsOpen] = useState(false);
    const isCurrentUser = participant.userId === currentUserId;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-all ${
          selectedParticipant === participant.userId ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                {participant.isHost ? (
                  <Crown className="w-5 h-5 text-yellow-400" />
                ) : participant.role === 'moderator' ? (
                  <Shield className="w-5 h-5 text-blue-400" />
                ) : (
                  <div className="text-white font-bold">
                    {participant.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Connection Quality Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getQualityColor(participant.connectionQuality)}`} />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {participant.userName}
                  {isCurrentUser && <span className="text-xs text-gray-400"> (You)</span>}
                </span>
                
                {/* Role Badges */}
                {participant.isHost && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    HOST
                  </span>
                )}
                {participant.role === 'moderator' && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    MOD
                  </span>
                )}
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {participant.isMuted && <MicOff className="w-3 h-3" />}
                {participant.isVideoOff && <VideoOff className="w-3 h-3" />}
                {participant.isScreenSharing && <Monitor className="w-3 h-3 text-blue-400" />}
                <span>Joined {new Date(participant.joinedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {canManageParticipants && !isCurrentUser && (
            <div className="relative">
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {actionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-full mt-1 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-10"
                  >
                    <div className="py-1">
                      {/* Audio Actions */}
                      <button
                        onClick={() => {
                          onParticipantAction(participant.isMuted ? 'unmute' : 'mute', participant.userId);
                          setActionsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        {participant.isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        {participant.isMuted ? 'Unmute' : 'Mute'}
                      </button>

                      {/* Video Actions */}
                      <button
                        onClick={() => {
                          onParticipantAction(participant.isVideoOff ? 'videoOn' : 'videoOff', participant.userId);
                          setActionsOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      >
                        {participant.isVideoOff ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        {participant.isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                      </button>

                      {/* Screen Share Actions */}
                      {roomSettings.allowScreenShare && (
                        <button
                          onClick={() => {
                            onParticipantAction(participant.isScreenSharing ? 'stopScreenShare' : 'requestScreenShare', participant.userId);
                            setActionsOpen(false);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        >
                          <Monitor className="w-4 h-4" />
                          {participant.isScreenSharing ? 'Stop Screen Share' : 'Request Screen Share'}
                        </button>
                      )}

                      {/* Role Actions (Host Only) */}
                      {isHost && participant.role !== 'host' && (
                        <>
                          <div className="border-t border-gray-700 my-1" />
                          <button
                            onClick={() => {
                              const newRole = participant.role === 'moderator' ? 'participant' : 'moderator';
                              onParticipantAction('changeRole', participant.userId, { role: newRole });
                              setActionsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <Shield className="w-4 h-4" />
                            {participant.role === 'moderator' ? 'Remove Moderator' : 'Make Moderator'}
                          </button>
                        </>
                      )}

                      {/* Remove Actions (Host Only) */}
                      {isHost && (
                        <>
                          <div className="border-t border-gray-700 my-1" />
                          <button
                            onClick={() => {
                              onParticipantAction('kick', participant.userId);
                              setActionsOpen(false);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <Ban className="w-4 h-4" />
                            Remove from Room
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Extended Details */}
        {showDetails && selectedParticipant === participant.userId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Connection:</span>
                <span className={`ml-2 ${getQualityColor(participant.connectionQuality)}`}>
                  {participant.connectionQuality}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Joined:</span>
                <span className="ml-2 text-white">
                  {new Date(participant.joinedAt).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Socket ID:</span>
                <span className="ml-2 text-white font-mono text-xs">
                  {participant.socketId.slice(0, 8)}...
                </span>
              </div>
              <div>
                <span className="text-gray-400">User ID:</span>
                <span className="ml-2 text-white font-mono text-xs">
                  {participant.userId.slice(0, 8)}...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`participant-manager ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Participants</h3>
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
            {participants.length}/{roomSettings.maxParticipants}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Pending Requests */}
          {isHost && pendingRequests.length > 0 && (
            <button
              onClick={() => setShowPending(!showPending)}
              className="relative p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            </button>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      <AnimatePresence>
        {showPending && pendingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <h4 className="text-sm font-medium text-yellow-400 mb-2">Join Requests</h4>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.userId} className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm">{request.userName}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(request.requestedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onApproveRequest(request.userId)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onRejectRequest(request.userId)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {/* Host First */}
          {participants.filter(p => p.isHost).map((participant) => (
            <ParticipantCard key={participant.userId} participant={participant} />
          ))}
          
          {/* Then Moderators */}
          {participants.filter(p => p.role === 'moderator' && !p.isHost).map((participant) => (
            <ParticipantCard key={participant.userId} participant={participant} />
          ))}
          
          {/* Then Regular Participants */}
          {participants.filter(p => p.role === 'participant' && !p.isHost).map((participant) => (
            <ParticipantCard 
              key={participant.userId} 
              participant={participant} 
              showActions={canManageParticipants}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Room Full Warning */}
      {participants.length >= roomSettings.maxParticipants && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <Ban className="w-4 h-4" />
            <span className="text-sm">Room is full ({roomSettings.maxParticipants} participants)</span>
          </div>
        </div>
      )}

      {/* Room Settings Summary */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Room Settings</h4>
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Max Participants:</span>
            <span className="text-white">{roomSettings.maxParticipants}</span>
          </div>
          <div className="flex justify-between">
            <span>Require Approval:</span>
            <span className={roomSettings.requireApproval ? 'text-yellow-400' : 'text-green-400'}>
              {roomSettings.requireApproval ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Screen Share:</span>
            <span className={roomSettings.allowScreenShare ? 'text-green-400' : 'text-red-400'}>
              {roomSettings.allowScreenShare ? 'Allowed' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
