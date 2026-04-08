"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plus, 
  Users, 
  Lock, 
  Globe, 
  Calendar, 
  Clock, 
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Settings,
  Play,
  Heart,
  MessageSquare,
  Zap,
  Crown,
  TrendingUp,
  Hash,
  X
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  isPrivate: boolean;
  hasPassword: boolean;
  currentParticipants: number;
  maxParticipants: number;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
  isLive: boolean;
  isFavorite: boolean;
  thumbnail?: string;
  language: string;
  quality: 'low' | 'medium' | 'high' | 'auto';
}

interface RoomDiscoveryProps {
  currentUserId: string;
  onJoinRoom: (roomId: string, password?: string) => void;
  onCreateRoom: () => void;
  onToggleFavorite: (roomId: string) => void;
  className?: string;
}

export default function RoomDiscovery({
  currentUserId,
  onJoinRoom,
  onCreateRoom,
  onToggleFavorite,
  className = ""
}: RoomDiscoveryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'participants' | 'name'>('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [favoriteRooms, setFavoriteRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All Rooms", icon: <Globe className="w-4 h-4" /> },
    { id: "movie", name: "Movies", icon: <Play className="w-4 h-4" /> },
    { id: "series", name: "TV Series", icon: <Hash className="w-4 h-4" /> },
    { id: "anime", name: "Anime", icon: <Star className="w-4 h-4" /> },
    { id: "documentary", name: "Documentary", icon: <Eye className="w-4 h-4" /> },
    { id: "sports", name: "Sports", icon: <Zap className="w-4 h-4" /> },
    { id: "gaming", name: "Gaming", icon: <Play className="w-4 h-4" /> },
    { id: "music", name: "Music", icon: <Heart className="w-4 h-4" /> },
    { id: "education", name: "Education", icon: <Users className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      // Simulate API call to fetch rooms
      const mockRooms: Room[] = [
        {
          id: "room1",
          name: "Marvel Movie Night",
          description: "Watching the latest Marvel movies together!",
          category: "movie",
          isPublic: true,
          isPrivate: false,
          hasPassword: false,
          currentParticipants: 8,
          maxParticipants: 20,
          host: {
            id: "user1",
            name: "JohnDoe",
            avatar: "/avatars/john.jpg"
          },
          createdAt: new Date(Date.now() - 3600000),
          lastActivity: new Date(),
          tags: ["marvel", "action", "superhero"],
          isLive: true,
          isFavorite: false,
          thumbnail: "/thumbnails/marvel.jpg",
          language: "English",
          quality: "high"
        },
        {
          id: "room2",
          name: "Anime Watch Party",
          description: "Weekly anime streaming session",
          category: "anime",
          isPublic: true,
          isPrivate: false,
          hasPassword: true,
          currentParticipants: 15,
          maxParticipants: 25,
          host: {
            id: "user2",
            name: "AnimeFan99"
          },
          createdAt: new Date(Date.now() - 7200000),
          lastActivity: new Date(Date.now() - 300000),
          tags: ["anime", "weekly", "community"],
          isLive: true,
          isFavorite: true,
          thumbnail: "/thumbnails/anime.jpg",
          language: "Japanese",
          quality: "medium"
        },
        {
          id: "room3",
          name: "Documentary Club",
          description: "Exploring nature documentaries",
          category: "documentary",
          isPublic: true,
          isPrivate: false,
          hasPassword: false,
          currentParticipants: 5,
          maxParticipants: 15,
          host: {
            id: "user3",
            name: "DocuLover"
          },
          createdAt: new Date(Date.now() - 86400000),
          lastActivity: new Date(Date.now() - 600000),
          tags: ["documentary", "nature", "educational"],
          isLive: false,
          isFavorite: false,
          thumbnail: "/thumbnails/doc.jpg",
          language: "English",
          quality: "auto"
        }
      ];

      setRooms(mockRooms);
      setMyRooms(mockRooms.slice(0, 2));
      setFavoriteRooms(mockRooms.filter(room => room.isFavorite));
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return b.currentParticipants - a.currentParticipants;
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'participants':
        return b.currentParticipants - a.currentParticipants;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleJoinRoom = (room: Room) => {
    if (room.hasPassword) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      onJoinRoom(room.id);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedRoom) {
      onJoinRoom(selectedRoom.id, passwordInput);
      setShowPasswordModal(false);
      setPasswordInput("");
      setSelectedRoom(null);
    }
  };

  const RoomCard = ({ room, compact = false }: { room: Room; compact?: boolean }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all cursor-pointer ${
        compact ? 'flex items-center gap-3 p-3' : ''
      }`}
      onClick={() => handleJoinRoom(room)}
    >
      {compact ? (
        <>
          <div className="relative w-12 h-12 bg-gray-700 rounded flex-shrink-0">
            {room.thumbnail ? (
              <img src={room.thumbnail} alt={room.name} className="w-full h-full object-cover rounded" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
            )}
            {room.isLive && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium truncate">{room.name}</h3>
              {room.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
              {room.hasPassword && <Lock className="w-3 h-3 text-gray-400" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {room.currentParticipants}/{room.maxParticipants}
              </span>
              <span>{formatTimeAgo(room.lastActivity)}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Thumbnail */}
          <div className="relative h-32 bg-gray-700">
            {room.thumbnail ? (
              <img src={room.thumbnail} alt={room.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Live Indicator */}
            {room.isLive && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}

            {/* Actions */}
            <div className="absolute top-2 left-2 flex gap-1">
              {room.isFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(room.id);
                  }}
                  className="p-1 bg-black/50 rounded text-yellow-400"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-2 left-2">
              <span className="bg-blue-500/80 text-white text-xs px-2 py-1 rounded">
                {categories.find(c => c.id === room.category)?.name || room.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                  {room.name}
                  {room.hasPassword && <Lock className="w-4 h-4 text-gray-400" />}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">{room.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(room.id);
                }}
                className="ml-2 p-1 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Star className={`w-4 h-4 ${room.isFavorite ? 'fill-current text-yellow-400' : ''}`} />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {room.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
              {room.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{room.tags.length - 3} more</span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {room.currentParticipants}/{room.maxParticipants}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(room.lastActivity)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Quality:</span>
                <span className={`text-xs font-medium ${
                  room.quality === 'high' ? 'text-green-400' :
                  room.quality === 'medium' ? 'text-yellow-400' :
                  room.quality === 'low' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {room.quality.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className={`room-discovery bg-gray-900 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Discover Rooms</h2>
            <button
              onClick={onCreateRoom}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-800 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Categories */}
              <div>
                <h3 className="text-white font-medium mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {category.icon}
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-white font-medium mb-3">Sort By</h3>
                <div className="flex gap-2">
                  {[
                    { id: 'trending', name: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'newest', name: 'Newest', icon: <Clock className="w-4 h-4" /> },
                    { id: 'participants', name: 'Most Popular', icon: <Users className="w-4 h-4" /> },
                    { id: 'name', name: 'Name', icon: <Hash className="w-4 h-4" /> }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        sortBy === option.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option.icon}
                      <span className="text-sm">{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading rooms...</p>
          </div>
        ) : sortedRooms.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No rooms found</h3>
            <p className="text-gray-400">
              {searchQuery ? "Try adjusting your search terms" : "Be the first to create a room!"}
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }>
            {sortedRooms.map((room) => (
              <RoomCard key={room.id} room={room} compact={viewMode === 'list'} />
            ))}
          </div>
        )}
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Join Private Room</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-700 rounded">
                    {selectedRoom.thumbnail ? (
                      <img src={selectedRoom.thumbnail} alt={selectedRoom.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{selectedRoom.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedRoom.description}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-400 text-sm block mb-2">Room Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password to join"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={!passwordInput.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                >
                  Join Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
