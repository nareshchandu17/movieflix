import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WatchPartySocket {
  socket: Socket | null;
  isConnected: boolean;
  roomCode: string | null;
  participants: string[];
  error: string | null;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isBuffering: boolean;
  quality: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface Reaction {
  id: string;
  userId: string;
  userName: string;
  type: string;
  movieTimestamp: number;
  timestamp: number;
}

export const useWatchPartySocket = (roomCode: string | null, userId: string | null) => {
  const [socketState, setSocketState] = useState<WatchPartySocket>({
    socket: null,
    isConnected: false,
    roomCode: null,
    participants: [],
    error: null
  });

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isBuffering: false,
    quality: 'auto'
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomCode || !userId) return;

    // Initialize socket connection
    const socket = io('/api/socket/io', {
      transports: ['websocket'],
      upgrade: false
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to watch party server');
      setSocketState(prev => ({
        ...prev,
        socket,
        isConnected: true,
        roomCode,
        error: null
      }));

      // Join watch party room
      socket.emit('join-watch-party', { roomCode, userId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from watch party server');
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        error: 'Connection lost'
      }));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketState(prev => ({
        ...prev,
        error: 'Failed to connect'
      }));
    });

    // Room events
    socket.on('room-state', (data: { roomCode: string; participants: string[] }) => {
      setSocketState(prev => ({
        ...prev,
        participants: data.participants
      }));
    });

    socket.on('user-joined', (data: { userId: string; timestamp: number }) => {
      console.log('User joined:', data.userId);
      // Could show a notification or update UI
    });

    socket.on('user-left', (data: { socketId: string; timestamp: number }) => {
      console.log('User left:', data.socketId);
      setSocketState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p !== data.socketId)
      }));
    });

    // Playback events
    socket.on('play', (data: { timestamp: number; userId: string; initiatedBy: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: true,
        currentTime: data.timestamp
      }));
    });

    socket.on('pause', (data: { timestamp: number; userId: string; initiatedBy: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: data.timestamp
      }));
    });

    socket.on('seek', (data: { timestamp: number; userId: string; initiatedBy: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: data.timestamp
      }));
    });

    socket.on('volume-change', (data: { volume: number; userId: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        volume: data.volume
      }));
    });

    socket.on('progress-update', (data: { currentTime: number; userId: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        currentTime: data.currentTime
      }));
    });

    socket.on('buffer-status', (data: { isBuffering: boolean; userId: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        isBuffering: data.isBuffering
      }));
    });

    socket.on('quality-change', (data: { quality: string; userId: string }) => {
      setPlaybackState(prev => ({
        ...prev,
        quality: data.quality
      }));
    });

    // Chat events
    socket.on('chat-message', (data: ChatMessage) => {
      setChatMessages(prev => [...prev, { ...data, id: Date.now().toString() }]);
    });

    // Reaction events
    socket.on('reaction', (data: Reaction) => {
      setReactions(prev => [...prev, { ...data, id: Date.now().toString() }]);
      
      // Remove reaction after 3 seconds
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== data.id));
      }, 3000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, userId]);

  // Playback control functions
  const play = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('play', {
        roomCode,
        timestamp,
        userId
      });
    }
  };

  const pause = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('pause', {
        roomCode,
        timestamp,
        userId
      });
    }
  };

  const seek = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('seek', {
        roomCode,
        timestamp,
        userId
      });
    }
  };

  const setVolume = (volume: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('volume-change', {
        roomCode,
        volume,
        userId
      });
    }
  };

  const updateProgress = (currentTime: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('progress-update', {
        roomCode,
        currentTime,
        userId
      });
    }
  };

  const setBuffering = (isBuffering: boolean) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('buffer-status', {
        roomCode,
        isBuffering,
        userId
      });
    }
  };

  const setQuality = (quality: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('quality-change', {
        roomCode,
        quality,
        userId
      });
    }
  };

  // Chat functions
  const sendMessage = (message: string, userName: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('chat-message', {
        roomCode,
        message,
        userId,
        userName
      });
    }
  };

  // Reaction functions
  const sendReaction = (reaction: string, userName: string, movieTimestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('reaction', {
        roomCode,
        reaction,
        userId,
        userName,
        movieTimestamp
      });
    }
  };

  return {
    // Socket state
    socketState,
    playbackState,
    chatMessages,
    reactions,
    
    // Playback controls
    play,
    pause,
    seek,
    setVolume,
    updateProgress,
    setBuffering,
    setQuality,
    
    // Chat and reactions
    sendMessage,
    sendReaction
  };
};
