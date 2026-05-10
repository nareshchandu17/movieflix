import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Participant {
  userId: string;
  userName: string;
  status: string;
  socketId: string;
  isHost: boolean;
}

interface WatchPartySocket {
  socket: Socket | null;
  isConnected: boolean;
  roomCode: string | null;
  participants: Participant[];
  hostId: string | null;
  isHost: boolean;
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

export const useWatchPartySocket = (roomCode: string | null, userId: string | null, userName?: string | null) => {
  const [socketState, setSocketState] = useState<WatchPartySocket>({
    socket: null,
    isConnected: false,
    roomCode: null,
    participants: [],
    hostId: null,
    isHost: false,
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

    const isInitializing = useRef(false);

    useEffect(() => {
    if (!roomCode || !userId || isInitializing.current) return;

    const initSocket = async () => {
      if (isInitializing.current) return;
      isInitializing.current = true;
      
      try {
        const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:3001";
        const socket = io(URL, {
          transports: ['websocket', 'polling'],
          upgrade: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
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

          // Join watch party room with name
          socket.emit('join-room', { roomId: roomCode, userId, userName });
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
        socket.on('room-state', (data: { 
          roomId: string; 
          hostId: string; 
          participants: any[]; 
          currentPlayState?: string;
          currentTime?: number;
          chatHistory?: any[];
        }) => {
          setSocketState(prev => ({
            ...prev,
            participants: data.participants,
            hostId: data.hostId,
            isHost: socket.id === data.hostId
          }));

          if (data.currentPlayState || data.currentTime !== undefined) {
            setPlaybackState(prev => ({
              ...prev,
              isPlaying: data.currentPlayState === 'playing',
              currentTime: data.currentTime || 0
            }));
          }

          if (data.chatHistory) {
            const formattedHistory = data.chatHistory.map((msg: any) => ({
              id: msg._id || Math.random().toString(),
              userId: msg.userId,
              userName: msg.userName,
              message: msg.message,
              timestamp: new Date(msg.timestamp).getTime()
            }));
            setChatMessages(formattedHistory);
          }
        });

        socket.on('user-joined', (data: { userId: string; userName: string; socketId: string; isHost: boolean }) => {
          setSocketState(prev => ({
            ...prev,
            participants: [...prev.participants, { ...data, status: 'watching' }]
          }));
        });

        socket.on('user-left', (data: { socketId: string }) => {
          setSocketState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.socketId !== data.socketId)
          }));
        });

        socket.on('host-changed', (data: { hostId: string; userId: string }) => {
          setSocketState(prev => ({
            ...prev,
            hostId: data.hostId,
            isHost: socket.id === data.hostId
          }));
        });

        socket.on('status-update', (data: { userId: string; socketId: string; status: string }) => {
          setSocketState(prev => ({
            ...prev,
            participants: prev.participants.map(p => 
              p.socketId === data.socketId ? { ...p, status: data.status } : p
            )
          }));
        });

        socket.on('progress-sync', (data: { currentTime: number }) => {
          setSocketState(current => {
            if (!current.isHost) {
            }
            return current;
          });
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

        socket.on('chat-message', (data: any) => {
          console.log('💬 Received chat message:', data);
          const formattedMessage: ChatMessage = {
            id: data.id || Date.now().toString(),
            userId: data.userId,
            userName: data.userName,
            message: data.message,
            timestamp: typeof data.timestamp === 'string' ? new Date(data.timestamp).getTime() : data.timestamp
          };
          setChatMessages(prev => [...prev, formattedMessage]);
        });

        socket.on('reaction', (data: Reaction) => {
          setReactions(prev => [...prev, { ...data, id: Date.now().toString() }]);
          setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== data.id));
          }, 3000);
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket().finally(() => {
      isInitializing.current = false;
    });

    return () => {
      console.log('🔌 Disconnecting socket...');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomCode, userId, userName]); // Added userName to dependencies for dynamic updates if needed

  // Playback control functions
  const play = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('play', {
        roomId: roomCode,
        timestamp,
        userId
      });
    }
  };

  const pause = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('pause', {
        roomId: roomCode,
        timestamp,
        userId
      });
    }
  };

  const seek = (timestamp: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('seek', {
        roomId: roomCode,
        timestamp,
        userId
      });
    }
  };

  const setVolume = (volume: number) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('volume-change', {
        roomId: roomCode,
        volume,
        userId
      });
    }
  };

  const updateProgress = (currentTime: number) => {
    if (socketRef.current && roomCode) {
      // If host, emit progress sync to everyone
      if (socketState.isHost) {
        socketRef.current.emit('sync-progress', {
          roomId: roomCode,
          currentTime,
          userId
        });
      }
    }
  };

  const setStatus = (status: 'watching' | 'buffering' | 'lagging') => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('participant-status', {
        roomId: roomCode,
        status,
        userId
      });
    }
  };

  const setQuality = (quality: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('quality-change', {
        roomId: roomCode,
        quality,
        userId
      });
    }
  };

  // Chat functions
  const sendMessage = (message: string, userName: string) => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('chat-message', {
        roomId: roomCode,
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
        roomId: roomCode,
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
    setStatus,
    setQuality,
    
    // Chat and reactions
    sendMessage,
    sendReaction
  };
};
 
