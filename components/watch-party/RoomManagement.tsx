"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye, 
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Play,
  Pause,
  MoreVertical,
  Download,
  Share,
  RefreshCw,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface MyRoom {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  hasPassword: boolean;
  password?: string;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: Date;
  lastActivity: Date;
  totalViews: number;
  totalMessages: number;
  totalWatchTime: number; // in minutes
  settings: {
    allowScreenShare: boolean;
    requireApproval: boolean;
    muteOnJoin: boolean;
    videoOffOnJoin: boolean;
  };
  stats: {
    peakParticipants: number;
    averageParticipants: number;
    averageWatchTime: number;
    retentionRate: number; // percentage of users who stay > 10 minutes
  };
}

interface RoomManagementProps {
  currentUserId: string;
  onEditRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onDuplicateRoom: (roomId: string) => void;
  onShareRoom: (roomId: string) => void;
  onRefreshStats: (roomId: string) => void;
  className?: string;
}

export default function RoomManagement({
  currentUserId,
  onEditRoom,
  onDeleteRoom,
  onDuplicateRoom,
  onShareRoom,
  onRefreshStats,
  className = ""
}: RoomManagementProps) {
  const [rooms, setRooms] = useState<MyRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<MyRoom | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'participants' | 'activity'>('activity');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMyRooms();
  }, []);

  const loadMyRooms = async () => {
    setLoading(true);
    try {
      // Simulate API call to fetch user's rooms
      const mockRooms: MyRoom[] = [
        {
          id: "room1",
          name: "Marvel Movie Night",
          description: "Weekly Marvel movie streaming with friends",
          category: "movie",
          isPublic: true,
          hasPassword: false,
          maxParticipants: 20,
          currentParticipants: 8,
          createdAt: new Date(Date.now() - 86400000 * 7),
          lastActivity: new Date(),
          totalViews: 156,
          totalMessages: 892,
          totalWatchTime: 2340, // 39 hours
          settings: {
            allowScreenShare: true,
            requireApproval: false,
            muteOnJoin: false,
            videoOffOnJoin: false
          },
          stats: {
            peakParticipants: 18,
            averageParticipants: 12.5,
            averageWatchTime: 45, // minutes
            retentionRate: 78
          }
        },
        {
          id: "room2",
          name: "Anime Watch Party",
          description: "Private anime streaming for close friends",
          category: "anime",
          isPublic: false,
          hasPassword: true,
          password: "anime123",
          maxParticipants: 10,
          currentParticipants: 4,
          createdAt: new Date(Date.now() - 86400000 * 14),
          lastActivity: new Date(Date.now() - 3600000),
          totalViews: 89,
          totalMessages: 445,
          totalWatchTime: 1560, // 26 hours
          settings: {
            allowScreenShare: false,
            requireApproval: true,
            muteOnJoin: true,
            videoOffOnJoin: false
          },
          stats: {
            peakParticipants: 10,
            averageParticipants: 7.2,
            averageWatchTime: 52,
            retentionRate: 85
          }
        },
        {
          id: "room3",
          name: "Study Group - CS101",
          description: "Computer science study sessions",
          category: "education",
          isPublic: true,
          hasPassword: true,
          password: "study2024",
          maxParticipants: 15,
          currentParticipants: 0,
          createdAt: new Date(Date.now() - 86400000 * 30),
          lastActivity: new Date(Date.now() - 86400000 * 2),
          totalViews: 234,
          totalMessages: 1203,
          totalWatchTime: 3240, // 54 hours
          settings: {
            allowScreenShare: true,
            requireApproval: false,
            muteOnJoin: true,
            videoOffOnJoin: true
          },
          stats: {
            peakParticipants: 15,
            averageParticipants: 9.8,
            averageWatchTime: 68,
            retentionRate: 92
          }
        }
      ];

      setRooms(mockRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshRoomStats = async (roomId: string) => {
    setStatsLoading(roomId);
    try {
      // Simulate API call to refresh stats
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRefreshStats(roomId);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    } finally {
      setStatsLoading(null);
    }
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'participants':
        return b.currentParticipants - a.currentParticipants;
      case 'activity':
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      default:
        return 0;
    }
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const copyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId);
    // Could show toast notification here
  };

  const RoomCard = ({ room }: { room: MyRoom }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-white font-medium text-lg">{room.name}</h3>
            {room.isPublic ? (
              <Unlock className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-yellow-400" />
            )}
            {room.currentParticipants > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm">{room.description}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onShareRoom(room.id)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Share room"
          >
            <Share className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Room settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{room.currentParticipants}</div>
          <div className="text-xs text-gray-400">Current</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{room.totalViews}</div>
          <div className="text-xs text-gray-400">Total Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{formatTime(room.totalWatchTime)}</div>
          <div className="text-xs text-gray-400">Watch Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{room.stats.retentionRate}%</div>
          <div className="text-xs text-gray-400">Retention</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Peak Participants</span>
          <span className="text-white">{room.stats.peakParticipants}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Average Session</span>
          <span className="text-white">{formatTime(room.stats.averageWatchTime)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Messages</span>
          <span className="text-white">{room.totalMessages.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Created</span>
          <span className="text-white">{formatDate(room.createdAt)}</span>
        </div>
      </div>

      {/* Room Settings Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {room.settings.allowScreenShare && (
          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
            Screen Share
          </span>
        )}
        {room.settings.requireApproval && (
          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
            Approval Required
          </span>
        )}
        {room.settings.muteOnJoin && (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
            Mute on Join
          </span>
        )}
        {room.settings.videoOffOnJoin && (
          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
            Video Off on Join
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyRoomId(room.id)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
          >
            <Copy className="w-3 h-3" />
            Copy ID
          </button>
          <button
            onClick={() => onDuplicateRoom(room.id)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Duplicate
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditRoom(room.id)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
          <button
            onClick={() => onDeleteRoom(room.id)}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`room-management bg-gray-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">My Rooms</h2>
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
              {rooms.length} rooms
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            >
              <option value="activity">Last Activity</option>
              <option value="name">Name</option>
              <option value="created">Created Date</option>
              <option value="participants">Participants</option>
            </select>
            
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading your rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No rooms yet</h3>
            <p className="text-gray-400 mb-4">Create your first watch party room to get started!</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
              Create Room
            </button>
          </div>
        ) : (
          <div className={viewMode === 'cards' ? 'grid gap-6' : 'space-y-4'}>
            {sortedRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {rooms.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {rooms.reduce((sum, room) => sum + room.totalViews, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {rooms.reduce((sum, room) => sum + room.currentParticipants, 0)}
              </div>
              <div className="text-xs text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatTime(rooms.reduce((sum, room) => sum + room.totalWatchTime, 0))}
              </div>
              <div className="text-xs text-gray-400">Total Watch Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(rooms.reduce((sum, room) => sum + room.stats.retentionRate, 0) / rooms.length)}%
              </div>
              <div className="text-xs text-gray-400">Avg. Retention</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
