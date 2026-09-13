import { useEffect, useState, useRef, useCallback } from "react";
import { usePresenceChannel, usePusherEvent } from "./usePusher";

interface Participant {
  userId: string;
  userName: string;
  status: string;
  socketId: string;
  isHost: boolean;
}

interface WatchPartySocket {
  socket: any | null; // Null or mock to maintain signature compatibility
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
  lastSyncTimestamp?: number;
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

export const useWatchPartyPusher = (
  roomCode: string | null,
  userId: string | null,
  userName?: string | null
) => {
  const { channel, members, myId, error: subscriptionError } = usePresenceChannel(roomCode || "");

  const [hostId, setHostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isBuffering: false,
    quality: "auto",
    lastSyncTimestamp: Date.now(),
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Reaction cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.timestamp < 5000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial room state on mount
  useEffect(() => {
    if (!roomCode) return;

    const fetchInitialRoomState = async () => {
      try {
        const response = await fetch("/api/pusher/watchparty/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: roomCode, userName: userName || "User" }),
        });

        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error || "Failed to join room");
          return;
        }

        const data = await response.json();
        // Since join endpoint returns room status:
        setPlaybackState((prev) => ({
          ...prev,
          isPlaying: data.playState === "playing",
          currentTime: data.currentTime || 0,
        }));

        // Find the host in participants to set hostId
        const host = data.participants.find((p: any) => p.isHost);
        if (host) {
          setHostId(host.userId);
        }
      } catch (err) {
        console.error("❌ Error fetching initial watch party room state:", err);
        setError("Failed to fetch initial room state");
      }
    };

    fetchInitialRoomState();
  }, [roomCode, userName]);

  // Bind Pusher presence events
  const handlePlayerControl = useCallback((data: any) => {
    setPlaybackState((prev) => {
      const isPlaying = data.action === "play" ? true : data.action === "pause" ? false : prev.isPlaying;
      return {
        ...prev,
        isPlaying,
        currentTime: data.time !== undefined ? data.time : prev.currentTime,
        lastSyncTimestamp: Date.now(),
      };
    });
  }, []);
  usePusherEvent(channel, "player-control", handlePlayerControl);

  const handleChatMessage = useCallback((data: any) => {
    const formattedMessage: ChatMessage = {
      id: data.id || Date.now().toString(),
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: typeof data.timestamp === "string" ? new Date(data.timestamp).getTime() : data.timestamp,
    };
    setChatMessages((prev) => [...prev, formattedMessage]);
  }, []);
  usePusherEvent(channel, "chat-message", handleChatMessage);

  const handleReaction = useCallback((data: any) => {
    const newReaction: Reaction = {
      id: data.id || Date.now().toString(),
      userId: data.userId,
      userName: data.userName,
      type: data.type,
      movieTimestamp: data.movieTimestamp || 0,
      timestamp: data.timestamp || Date.now(),
    };
    setReactions((prev) => [...prev, newReaction]);
  }, []);
  usePusherEvent(channel, "reaction", handleReaction);

  const handleStatusChange = useCallback((data: any) => {
    // A user changed status (e.g. buffering)
    // We could show a toast here if we want, or handle it in the UI via participants state
    if (data.status === 'buffering' && data.userId !== myId) {
       // A quick hack: force a 'pause' local state if someone else buffers
       setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, [myId]);
  usePusherEvent(channel, "status-change", handleStatusChange);

  // Map reactively from presence channel members list
  const participantsList: Participant[] = Object.entries(members).map(([mId, info]) => ({
    userId: mId,
    userName: info.userName,
    status: "watching",
    socketId: mId, // Mock socket ID using user ID to maintain UI bindings
    isHost: mId === hostId || info.isHost,
  }));

  const isConnected = !!channel && participantsList.length > 0;
  const isHost = myId !== null && hostId !== null && myId === hostId;

  const socketState: WatchPartySocket = {
    socket: null, // Keep signature compatibility
    isConnected,
    roomCode,
    participants: participantsList,
    hostId,
    isHost,
    error: error || (subscriptionError ? "Realtime subscription failed" : null),
  };

  // Playback control functions calling Next.js API routes
  const play = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, action: "play", time: timestamp }),
      });
    } catch (err) {
      console.error("❌ Failed to trigger play action:", err);
    }
  }, [roomCode]);

  const pause = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, action: "pause", time: timestamp }),
      });
    } catch (err) {
      console.error("❌ Failed to trigger pause action:", err);
    }
  }, [roomCode]);

  const seek = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, action: "seek", time: timestamp }),
      });
    } catch (err) {
      console.error("❌ Failed to trigger seek action:", err);
    }
  }, [roomCode]);

  const setVolume = useCallback((volume: number) => {
    setPlaybackState((prev) => ({ ...prev, volume }));
  }, []);

  const lastSyncTime = useRef<number>(0);
  const updateProgress = useCallback(async (currentTime: number) => {
    if (!roomCode || !isHost) return;
    
    // Throttle sync to once every 2 seconds to prevent network storms but improve sync precision
    const now = Date.now();
    if (now - lastSyncTime.current < 2000) return;
    lastSyncTime.current = now;

    try {
      await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, action: "seek", time: currentTime }),
      });
    } catch (err) {
      console.error("❌ Failed to sync progress:", err);
    }
  }, [roomCode, isHost]);

  const setStatus = useCallback(async (status: "watching" | "buffering" | "lagging") => {
    if (!roomCode) return;
    try {
      // In a real app, you would have an endpoint for status broadcast:
      // await fetch("/api/pusher/watchparty/status", { ... })
      // For now, if someone is buffering, we pause the stream
      if (status === "buffering") {
        await fetch("/api/pusher/watchparty/player-control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: roomCode, action: "pause", time: playbackState.currentTime }),
        });
        
        // Also send a system chat message
        await fetch("/api/pusher/watchparty/chat", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ roomId: roomCode, message: `${userName} is buffering. Pausing...`, isSystem: true }),
        });
      }
    } catch (err) {
      console.error("❌ Failed to set status:", err);
    }
  }, [roomCode, playbackState.currentTime, userName]);

  const setQuality = useCallback((quality: string) => {
    setPlaybackState((prev) => ({ ...prev, quality }));
  }, []);

  // Chat functions
  const sendMessage = useCallback(async (message: string, userName: string) => {
    if (!roomCode) return;
    try {
      await fetch("/api/pusher/watchparty/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, message }),
      });
    } catch (err) {
      console.error("❌ Failed to send chat message:", err);
    }
  }, [roomCode]);

  // Reaction functions
  const sendReaction = useCallback(async (reaction: string, userName: string, movieTimestamp: number) => {
    if (!roomCode) return;
    try {
      await fetch("/api/pusher/watchparty/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomCode, reaction, movieTimestamp }),
      });
    } catch (err) {
      console.error("❌ Failed to send reaction:", err);
    }
  }, [roomCode]);

  return {
    socketState,
    playbackState,
    chatMessages,
    reactions,

    play,
    pause,
    seek,
    setVolume,
    updateProgress,
    setStatus,
    setQuality,

    sendMessage,
    sendReaction,
  };
};
