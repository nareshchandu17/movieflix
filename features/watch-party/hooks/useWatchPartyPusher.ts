import { useEffect, useState, useRef, useCallback } from "react";
import { usePresenceChannel, usePusherEvent } from "./usePusher";
import { getCsrfHeaders } from "@/lib/csrf-client";

interface Participant {
  userId: string;
  userName: string;
  status: string;
  socketId: string;
  isHost: boolean;
  avatarUrl?: string;
}

interface RoomParticipant {
  userId: string;
  userName: string;
  avatarUrl?: string;
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
  avatarUrl?: string;
  type?: "text" | "system";
  delivery?: "sending" | "failed";
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
  const [hasJoined, setHasJoined] = useState(false);
  const {
    channel,
    members,
    myId,
    error: subscriptionError,
    isSubscribed,
    isConnected: pusherConnected,
  } = usePresenceChannel(
    roomCode && userId && hasJoined ? roomCode : ""
  );

  const [hostId, setHostId] = useState<string | null>(null);
  const [roomParticipants, setRoomParticipants] = useState<RoomParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

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
  const typingTimers = useRef(new Map<string, number>());

  useEffect(() => () => {
    typingTimers.current.forEach((timer) => window.clearTimeout(timer));
    typingTimers.current.clear();
  }, []);

  useEffect(() => {
    setTypingUsers((current) => Object.fromEntries(
      Object.entries(current).filter(([participantId]) => Boolean(members[participantId]))
    ));
  }, [members]);

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
    if (!roomCode || !userId) return;
    let cancelled = false;
    setHasJoined(false);
    setRoomParticipants([]);
    setChatMessages([]);
    setTypingUsers({});
    setHistoryCursor(null);
    setHasOlderMessages(false);
    setError(null);

    const fetchInitialRoomState = async () => {
      try {
        const response = await fetch("/api/pusher/watchparty/join", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
          body: JSON.stringify({ roomId: roomCode, userName }),
        });

        if (!response.ok) {
          const errData = await response.json();
          if (!cancelled) setError(errData.error || "Failed to join room");
          return;
        }

        const data = await response.json();
        if (cancelled) return;
        setError(data.realtimeError || null);
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
        setRoomParticipants(data.participants || []);
        setHasJoined(true);
      } catch (err) {
        console.error("❌ Error fetching initial watch party room state:", err);
        if (!cancelled) setError("Failed to fetch initial room state");
      }
    };

    fetchInitialRoomState();
    return () => {
      cancelled = true;
    };
  }, [roomCode, userId, userName]);

  const upsertMessages = useCallback((incoming: ChatMessage[]) => {
    setChatMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]));
      incoming.forEach((message) => {
        byId.set(message.id, { ...byId.get(message.id), ...message });
      });
      return [...byId.values()].sort(
        (a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id)
      );
    });
  }, []);

  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [historyCursor, setHistoryCursor] = useState<{ timestamp: number; id: string } | null>(null);

  useEffect(() => {
    if (!roomCode || !hasJoined) return;
    let cancelled = false;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await fetch(`/api/pusher/watchparty/chat?roomId=${encodeURIComponent(roomCode)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load chat history");
        if (cancelled) return;
        upsertMessages(data.messages || []);
        setHistoryCursor(
          data.nextCursor && data.nextCursorId
            ? { timestamp: data.nextCursor, id: data.nextCursorId }
            : null
        );
        setHasOlderMessages(Boolean(data.hasMore));
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load chat history");
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [roomCode, hasJoined, upsertMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomCode || !historyCursor || !hasOlderMessages || historyLoading) return;
    setHistoryLoading(true);
    try {
      const query = new URLSearchParams({
        roomId: roomCode,
        before: String(historyCursor.timestamp),
        beforeId: historyCursor.id,
      });
      const response = await fetch(`/api/pusher/watchparty/chat?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load older messages");
      upsertMessages(data.messages || []);
      setHistoryCursor(
        data.nextCursor && data.nextCursorId
          ? { timestamp: data.nextCursor, id: data.nextCursorId }
          : null
      );
      setHasOlderMessages(Boolean(data.hasMore));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load older messages");
    } finally {
      setHistoryLoading(false);
    }
  }, [roomCode, historyCursor, hasOlderMessages, historyLoading, upsertMessages]);

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
      id: data.id,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: typeof data.timestamp === "string" ? new Date(data.timestamp).getTime() : data.timestamp,
      avatarUrl: data.avatarUrl || "",
      type: data.type === "system" ? "system" : "text",
    };
    if (formattedMessage.id && Number.isFinite(formattedMessage.timestamp)) {
      upsertMessages([formattedMessage]);
    }
  }, [upsertMessages]);
  usePusherEvent(channel, "chat-message", handleChatMessage);

  const handleRoomState = useCallback((data: any) => {
    if (!Array.isArray(data?.participants)) return;
    setRoomParticipants(data.participants);
    if (typeof data.hostId === "string") setHostId(data.hostId);
  }, []);
  usePusherEvent(channel, "room-state", handleRoomState);

  const handleTyping = useCallback((data: any) => {
    if (!data?.userId || data.userId === userId) return;
    const previousTimer = typingTimers.current.get(data.userId);
    if (previousTimer) window.clearTimeout(previousTimer);
    setTypingUsers((current) => {
      const next = { ...current };
      if (data.isTyping && typeof data.userName === "string") next[data.userId] = data.userName;
      else delete next[data.userId];
      return next;
    });
    if (data.isTyping) {
      const timer = window.setTimeout(() => {
        setTypingUsers((current) => {
          if (!current[data.userId]) return current;
          const next = { ...current };
          delete next[data.userId];
          return next;
        });
        typingTimers.current.delete(data.userId);
      }, 4000);
      typingTimers.current.set(data.userId, timer);
    }
  }, [userId]);
  usePusherEvent(channel, "typing", handleTyping);

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

  // Map reactively from presence channel members list
  const participantById = new Map(
    roomParticipants.map((participant) => [participant.userId, participant])
  );
  Object.entries(members).forEach(([memberId, info]) => {
    if (!participantById.has(memberId)) {
      participantById.set(memberId, {
        userId: memberId,
        userName: info.userName,
        avatarUrl: info.avatarUrl,
        isHost: info.isHost,
      });
    }
  });
  const participantsList: Participant[] = [...participantById.values()].map((participant) => {
    const presenceMember = members[participant.userId];
    return {
      ...participant,
      userName: presenceMember?.userName || participant.userName,
      avatarUrl: presenceMember?.avatarUrl || participant.avatarUrl,
      status: presenceMember ? "online" : "offline",
      socketId: presenceMember ? participant.userId : "",
      isHost: participant.isHost || participant.userId === hostId,
    };
  });

  const isConnected = Boolean(pusherConnected && isSubscribed && channel);
  const isHost = myId !== null && hostId !== null && myId === hostId;

  const socketState: WatchPartySocket = {
    socket: null, // Keep signature compatibility
    isConnected,
    roomCode,
    participants: participantsList,
    hostId,
    isHost,
    error: error || (
      subscriptionError instanceof Error
        ? subscriptionError.message
        : subscriptionError
          ? "Realtime subscription failed"
          : null
    ),
  };

  // Playback control functions calling Next.js API routes
  const play = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      const response = await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, action: "play", time: timestamp }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Playback control failed");
      }
    } catch (err) {
      console.error("❌ Failed to trigger play action:", err);
      setError(err instanceof Error ? err.message : "Playback control failed");
    }
  }, [roomCode]);

  const pause = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      const response = await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, action: "pause", time: timestamp }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Playback control failed");
      }
    } catch (err) {
      console.error("❌ Failed to trigger pause action:", err);
      setError(err instanceof Error ? err.message : "Playback control failed");
    }
  }, [roomCode]);

  const seek = useCallback(async (timestamp: number) => {
    if (!roomCode) return;
    try {
      const response = await fetch("/api/pusher/watchparty/player-control", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, action: "seek", time: timestamp }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Playback control failed");
      }
    } catch (err) {
      console.error("❌ Failed to trigger seek action:", err);
      setError(err instanceof Error ? err.message : "Playback control failed");
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
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, action: "seek", time: currentTime }),
      });
    } catch (err) {
      console.error("❌ Failed to sync progress:", err);
    }
  }, [roomCode, isHost]);

  const setStatus = useCallback(async (status: "watching" | "buffering" | "lagging") => {
    if (status === "buffering") {
      setPlaybackState((previous) => ({ ...previous, isBuffering: true }));
    } else {
      setPlaybackState((previous) => ({ ...previous, isBuffering: false }));
    }
  }, []);

  const setQuality = useCallback((quality: string) => {
    setPlaybackState((prev) => ({ ...prev, quality }));
  }, []);

  // Chat functions
  const submitMessage = useCallback(async (pending: ChatMessage) => {
    if (!roomCode) return;
    upsertMessages([{ ...pending, delivery: "sending" }]);
    try {
      const response = await fetch("/api/pusher/watchparty/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({
          roomId: roomCode,
          message: pending.message,
          clientMessageId: pending.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message could not be sent");
      upsertMessages([{
        ...data.message,
        timestamp: typeof data.message.timestamp === "string"
          ? new Date(data.message.timestamp).getTime()
          : data.message.timestamp,
        delivery: undefined,
      }]);
    } catch (err) {
      upsertMessages([{ ...pending, delivery: "failed" }]);
      throw err;
    }
  }, [roomCode, upsertMessages]);

  const sendMessage = useCallback(async (message: string) => {
    if (!roomCode || !userId || !message.trim()) return;
    const id = crypto.randomUUID();
    const optimistic: ChatMessage = {
      id,
      userId,
      userName: userName || "You",
      message: message.trim(),
      timestamp: Date.now(),
      type: "text",
      delivery: "sending",
    };
    upsertMessages([optimistic]);
    await submitMessage(optimistic);
  }, [roomCode, userId, userName, upsertMessages, submitMessage]);

  const retryMessage = useCallback(async (messageId: string) => {
    const message = chatMessages.find((entry) => entry.id === messageId);
    if (message) await submitMessage(message);
  }, [chatMessages, submitMessage]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!roomCode || !userId || !hasJoined) return;
    try {
      const response = await fetch("/api/pusher/watchparty/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, isTyping }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Typing status unavailable");
      }
    } catch (typingError) {
      console.error("❌ Failed to update typing status:", typingError);
    }
  }, [roomCode, userId, hasJoined]);

  useEffect(() => {
    if (!pusherConnected) void setTyping(false);
  }, [pusherConnected, setTyping]);

  // Reaction functions
  const sendReaction = useCallback(async (reaction: string, userName: string, movieTimestamp: number) => {
    if (!roomCode) return;
    try {
      const response = await fetch("/api/pusher/watchparty/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        body: JSON.stringify({ roomId: roomCode, reaction, movieTimestamp }),
      });
      if (!response.ok) throw new Error("Reaction could not be sent");
    } catch (err) {
      console.error("❌ Failed to send reaction:", err);
    }
  }, [roomCode]);

  return {
    socketState,
    playbackState,
    chatMessages,
    historyLoading,
    hasOlderMessages,
    typingUsers: Object.values(typingUsers),
    loadOlderMessages,
    retryMessage,
    setTyping,
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
