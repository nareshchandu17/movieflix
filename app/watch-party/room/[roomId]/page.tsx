"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useWatchPartyPusher } from "@/features/watch-party/hooks/useWatchPartyPusher";
import { WatchPartyHeader } from "@/features/watch/components/watch/WatchPartyHeader";
import { WatchPartyPlayer } from "@/features/watch/components/watch/WatchPartyPlayer";
import { WatchPartyDashboard } from "@/features/watch/components/watch/WatchPartyDashboard";
import { WatchPartySidePanel } from "@/features/watch/components/watch/WatchPartySidePanel";
import { WatchPartyFooter } from "@/features/watch/components/watch/WatchPartyFooter";
import { NameModal } from "@/features/watch/components/watch/NameModal";
import { toast } from "sonner";
import { getCsrfHeaders } from "@/lib/csrf-client";

const MIN_VIDEO_PANE_WIDTH = 480;
const MIN_CHAT_PANEL_WIDTH = 320;
const MAX_CHAT_PANEL_WIDTH = 520;
const DIVIDER_WIDTH = 12;

const getMaxChatPanelWidth = (workspaceWidth: number) => {
  const availableWidth = workspaceWidth - DIVIDER_WIDTH - MIN_VIDEO_PANE_WIDTH;
  return Math.min(MAX_CHAT_PANEL_WIDTH, Math.max(MIN_CHAT_PANEL_WIDTH, availableWidth));
};

const clampChatPanelWidth = (width: number, workspaceWidth: number) => {
  const maxWidth = getMaxChatPanelWidth(workspaceWidth);
  return Math.min(Math.max(width, MIN_CHAT_PANEL_WIDTH), maxWidth);
};

interface WatchPartyData {
  _id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  movieBackdrop?: string;
  videoUrl?: string;
  roomCode: string;
  hostId: string;
  createdAt?: string;
  participants: Array<{
    userId: string;
    userName: string;
    userImage: string;
  }>;
}

export default function WatchPartyPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { data: session, status: sessionStatus } = useSession();

  const [userName, setUserName] = useState<string | null>(null);
  const userId = session?.user?.id ?? null;
  const [isAskingName, setIsAskingName] = useState(true);
  const [movieData, setMovieData] = useState<WatchPartyData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [roomApiResponseMs, setRoomApiResponseMs] = useState<number | null>(null);
  const [chatPanelWidth, setChatPanelWidth] = useState(400);
  const [workspaceWidth, setWorkspaceWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ pointerId: number; clientX: number; panelWidth: number } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Check if name is in session/local storage
    const storedName = localStorage.getItem('watch_party_name');
    const displayName = session?.user?.name || storedName;
    if (displayName) {
      setUserName(displayName);
      setIsAskingName(false);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || sessionStatus !== "authenticated" || !userId || isAskingName) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setWorkspaceWidth(width);
      if (width >= 1024) {
        setChatPanelWidth((currentWidth) => clampChatPanelWidth(currentWidth, width));
      }
    });

    observer.observe(workspace);
    return () => observer.disconnect();
  }, [sessionStatus, userId, isAskingName, roomId]);

  useEffect(() => {
    if (!isResizing) return;

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
    };
  }, [isResizing]);

  useEffect(() => {
    if (!roomId || !userId) return;
    let active = true;
    setRoomApiResponseMs(null);
    const measureRoomApiResponse = async () => {
      const start = performance.now();
      try {
        const response = await fetch(`/api/watchparty?roomCode=${encodeURIComponent(roomId)}`, {
          cache: "no-store",
        });
        if (active && response.ok) setRoomApiResponseMs(Math.round(performance.now() - start));
        else if (active) setRoomApiResponseMs(null);
      } catch {
        if (active) setRoomApiResponseMs(null);
      }
    };
    void measureRoomApiResponse();
    const interval = setInterval(() => void measureRoomApiResponse(), 30_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, userId]);

  // Pusher Hook
  const {
    socketState,
    playbackState,
    chatMessages,
    historyLoading,
    hasOlderMessages,
    typingUsers,
    loadOlderMessages,
    retryMessage,
    setTyping,
    reactions,
    sendMessage,
    sendReaction,
    setStatus,
    play,
    pause,
    seek,
    updateProgress
  } = useWatchPartyPusher(
    roomId || null,
    isAskingName ? null : userId,
    userName
  );
  const onlineParticipants = socketState.participants.filter(
    (participant) => participant.status === "online"
  );

  // Fetch Movie Context
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await fetch(`/api/watchparty?roomCode=${encodeURIComponent(roomId)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setMovieData(data.watchParty);
        }
      } catch (err) {
        console.error("Failed to fetch room context", err);
      }
    };

    if (roomId && userId) fetchMovieData();
  }, [roomId, userId]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setIsAskingName(false);
    localStorage.setItem('watch_party_name', name);
  };

  const handleLeave = async () => {
    if (userId) {
      try {
        await fetch("/api/pusher/watchparty/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
          body: JSON.stringify({ roomId }),
        });
      } catch (error) {
        console.error("Failed to leave Watch Party:", error);
      }
    }
    router.push('/watch-party');
  };

  const handleInvite = async () => {
    const url = `${window.location.origin}/watch-party?roomCode=${encodeURIComponent(roomId)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Invite link copied to clipboard!");
    } catch {
      toast.error("Could not copy the invite link.");
    }
  };

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (workspaceWidth < 1024 || event.button !== 0) return;

    event.preventDefault();
    resizeStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      panelWidth: chatPanelWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
  };

  const handleResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const resizeStart = resizeStartRef.current;
    if (!resizeStart || resizeStart.pointerId !== event.pointerId) return;

    const currentWorkspaceWidth = workspaceRef.current?.clientWidth ?? workspaceWidth;
    setChatPanelWidth(
      clampChatPanelWidth(
        resizeStart.panelWidth - (event.clientX - resizeStart.clientX),
        currentWorkspaceWidth
      )
    );
  };

  const handleResizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (resizeStartRef.current?.pointerId !== event.pointerId) return;
    resizeStartRef.current = null;
    setIsResizing(false);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (workspaceWidth < 1024) return;

    const step = event.shiftKey ? 48 : 16;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setChatPanelWidth((width) => clampChatPanelWidth(width + step, workspaceWidth));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setChatPanelWidth((width) => clampChatPanelWidth(width - step, workspaceWidth));
    } else if (event.key === "Home") {
      event.preventDefault();
      setChatPanelWidth(clampChatPanelWidth(MAX_CHAT_PANEL_WIDTH, workspaceWidth));
    } else if (event.key === "End") {
      event.preventDefault();
      setChatPanelWidth(MIN_CHAT_PANEL_WIDTH);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 text-center">
          <h1 className="text-xl font-semibold">Sign in to join this Watch Party</h1>
          <p className="mt-2 text-sm text-white/65">
            Room presence and chat are available to authenticated participants only.
          </p>
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: window.location.href })}
            className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-500"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (isAskingName) {
    return <NameModal onSubmit={handleNameSubmit} movieData={movieData || undefined} />;
  }

  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-red-500/30">
      {/* 1. Header (Premium Top Bar) */}
      <WatchPartyHeader
        title={movieData?.movieTitle || "Watch Party"}
        poster={movieData?.moviePoster}
        participants={onlineParticipants}
        participantsCount={onlineParticipants.length}
        isConnected={socketState.isConnected}
        roomApiResponseMs={socketState.isConnected ? roomApiResponseMs : null}
        onLeave={handleLeave}
        onInvite={handleInvite}
        roomCode={roomId}
      />

      {/* 2. Main Body Grid */}
      <div ref={workspaceRef} className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain lg:overflow-hidden">

        {/* Left Section: Video + Dashboard + Footer Stats */}
        <div id="watch-party-video-pane" className="w-full lg:min-w-[480px] lg:flex-1 flex flex-col min-h-0 shrink-0 bg-black">

          {/* Internal Scrollable for Dashboard */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col scrollbar-hide">

            {/* The Cinematic Player Section */}
            <div className="relative flex-none w-full bg-black shadow-2xl overflow-hidden aspect-video max-h-[60vh] lg:max-h-none lg:h-full lg:flex-1">
              <WatchPartyPlayer
                watchParty={movieData}
                userId={session.user.id}
                userName={userName || 'Guest'}
                onLeave={handleLeave}
                socketState={socketState}
                playbackState={playbackState}
                roomApiResponseMs={socketState.isConnected ? roomApiResponseMs : null}
                reactions={reactions}
                play={play}
                pause={pause}
                seek={seek}
                updateProgress={updateProgress}
                sendMessage={(m) => sendMessage(m)}
                sendReaction={(r) => sendReaction(r, userName || 'Guest', playbackState.currentTime)}
                setStatus={setStatus}
              />
            </div>

            {/* Dashboard: room status and host details */}
            <div className="hidden lg:block shrink-0">
               <WatchPartyDashboard
                 isHost={socketState.isHost}
                 isPlaying={playbackState.isPlaying}
                 isConnected={socketState.isConnected}
                 roomApiResponseMs={socketState.isConnected ? roomApiResponseMs : null}
                 onPlay={() => play(playbackState.currentTime)}
                 onPause={() => pause(playbackState.currentTime)}
                 movieTitle={movieData?.movieTitle}
                 hasVideoSource={Boolean(movieData?.videoUrl)}
                 hostName={socketState.hostId ? (socketState.participants.find(p => p.socketId === socketState.hostId)?.userName || 'Host') : 'Host'}
               />
            </div>
          </div>

          {/* Footer: Live Stats (Bitrate, Sync Health, Buffer) */}
          <div className="hidden lg:block shrink-0">
             <WatchPartyFooter
               participantsCount={onlineParticipants.length}
               hostName={socketState.hostId ? (socketState.participants.find(p => p.socketId === socketState.hostId)?.userName || 'Host') : 'Host'}
               startTime={movieData?.createdAt
                 ? new Date(movieData.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                 : "Unavailable"}
               onLeave={handleLeave}
               onReport={() => { }}
             />
          </div>
        </div>

        <div
          role="separator"
          aria-label="Resize video and chat panels"
          aria-orientation="vertical"
          aria-controls="watch-party-video-pane watch-party-chat-pane"
          aria-valuemin={Math.max(MIN_VIDEO_PANE_WIDTH, workspaceWidth - MAX_CHAT_PANEL_WIDTH - DIVIDER_WIDTH)}
          aria-valuemax={Math.max(MIN_VIDEO_PANE_WIDTH, workspaceWidth - MIN_CHAT_PANEL_WIDTH - DIVIDER_WIDTH)}
          aria-valuenow={workspaceWidth
            ? Math.min(
              Math.max(workspaceWidth - chatPanelWidth - DIVIDER_WIDTH, Math.max(MIN_VIDEO_PANE_WIDTH, workspaceWidth - MAX_CHAT_PANEL_WIDTH - DIVIDER_WIDTH)),
              Math.max(MIN_VIDEO_PANE_WIDTH, workspaceWidth - MIN_CHAT_PANEL_WIDTH - DIVIDER_WIDTH)
            )
            : MIN_VIDEO_PANE_WIDTH}
          aria-valuetext={`${workspaceWidth ? workspaceWidth - chatPanelWidth - DIVIDER_WIDTH : 0} pixels for video`}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          onLostPointerCapture={handleResizeEnd}
          onKeyDown={handleResizeKeyDown}
          className="group relative hidden w-3 flex-none cursor-col-resize touch-none items-center justify-center bg-[#0A0A0A] outline-none transition-colors hover:bg-zinc-900 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 lg:flex"
        >
          <span className="h-10 w-[3px] rounded-full bg-zinc-600 transition-colors group-hover:bg-red-500 group-focus-visible:bg-red-500" />
        </div>

        {/* Right Section: Interactive Side Panel (Chat, Participants, Activity) */}
        <div
          id="watch-party-chat-pane"
          className="w-full flex-1 lg:w-[400px] lg:h-full lg:flex-none border-t lg:border-t-0 lg:border-l border-white/10 shrink-0 bg-[#0A0A0A] flex flex-col min-h-[300px] lg:min-h-0"
          style={workspaceWidth >= 1024 ? { width: chatPanelWidth, flexBasis: chatPanelWidth } : undefined}
        >
          <WatchPartySidePanel
            messages={chatMessages}
            participants={socketState.participants}
            currentUser={{
              id: session.user.id,
              name: userName || 'Guest',
              avatarUrl: session.user.image || undefined,
            }}
            onSendMessage={(msg: string) => sendMessage(msg)}
            onRetryMessage={retryMessage}
            onLoadOlderMessages={loadOlderMessages}
            onTypingChange={setTyping}
            hasOlderMessages={hasOlderMessages}
            isLoadingHistory={historyLoading}
            typingUsers={typingUsers}
            connectionError={socketState.error}
            isConnected={socketState.isConnected}
          />
        </div>
      </div>
    </div>
  );
}
