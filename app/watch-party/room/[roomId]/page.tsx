"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWatchPartyPusher } from "@/features/watch-party/hooks/useWatchPartyPusher";
import { WatchPartyHeader } from "@/features/watch/components/watch/WatchPartyHeader";
import { WatchPartyPlayer } from "@/features/watch/components/watch/WatchPartyPlayer";
import { WatchPartyDashboard } from "@/features/watch/components/watch/WatchPartyDashboard";
import { WatchPartySidePanel } from "@/features/watch/components/watch/WatchPartySidePanel";
import { WatchPartyFooter } from "@/features/watch/components/watch/WatchPartyFooter";
import { NameModal } from "@/features/watch/components/watch/NameModal";
import { toast, Toaster } from "sonner";

interface WatchPartyData {
  _id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  roomCode: string;
  circleId: string;
  hostId: string;
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

  const [userName, setUserName] = useState<string | null>(null);
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [isAskingName, setIsAskingName] = useState(true);
  const [movieData, setMovieData] = useState<WatchPartyData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    setIsMounted(true);
    // Check if name is in session/local storage
    const storedName = localStorage.getItem('watch_party_name');
    if (storedName) {
      setUserName(storedName);
      setIsAskingName(false);
    }
    
    // Simulate ping latency calculation
    const pingInterval = setInterval(() => {
       setLatency(Math.floor(Math.random() * 20) + 30); // 30-50ms ping
    }, 5000);
    return () => clearInterval(pingInterval);
  }, []);

  // Pusher Hook
  const {
    socketState,
    playbackState,
    chatMessages,
    reactions,
    sendMessage,
    sendReaction,
    setStatus,
    play,
    pause,
    seek,
    updateProgress
  } = useWatchPartyPusher(roomId || null, isAskingName ? null : userId, userName);

  // Fetch Movie Context
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await fetch(`/api/watchparty?roomCode=${roomId}`);
        const data = await res.json();
        if (data.success) {
          setMovieData(data.watchParty);
        }
      } catch (err) {
        console.error("Failed to fetch room context", err);
      }
    };

    if (roomId) fetchMovieData();
  }, [roomId]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setIsAskingName(false);
    localStorage.setItem('watch_party_name', name);
  };

  const handleLeave = () => {
    router.push('/watch-party');
  };

  const handleInvite = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied to clipboard!');
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAskingName) {
    return <NameModal onSubmit={handleNameSubmit} movieData={movieData || undefined} />;
  }

  return (
    <div className="h-[100dvh] bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-red-500/30">
      <Toaster theme="dark" position="top-right" />
      {/* 1. Header (Premium Top Bar) */}
      <WatchPartyHeader
        title={movieData?.movieTitle || "Watch Party"}
        subtitle="Live Interaction"
        participantsCount={socketState.participants.length}
        onLeave={handleLeave}
        onInvite={handleInvite}
        isHost={socketState.isHost}
        roomCode={roomId}
      />

      {/* 2. Main Body Grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* Left Section: Video + Dashboard + Footer Stats */}
        <div className="w-full lg:flex-1 flex flex-col min-h-0 shrink-0 bg-black">

          {/* Internal Scrollable for Dashboard */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col scrollbar-hide">

            {/* The Cinematic Player Section */}
            <div className="relative flex-none w-full bg-black shadow-2xl overflow-hidden aspect-video max-h-[60vh] lg:max-h-none lg:h-full lg:flex-1">
              <WatchPartyPlayer
                watchParty={movieData}
                userId={userId}
                userName={userName || 'Guest'}
                userImage=""
                onLeave={handleLeave}
                socketState={socketState}
                playbackState={playbackState}
                reactions={reactions}
                play={play}
                pause={pause}
                seek={seek}
                updateProgress={updateProgress}
                sendMessage={(m) => sendMessage(m, userName || 'Guest')}
                sendReaction={(r) => sendReaction(r, userName || 'Guest', playbackState.currentTime)}
                setStatus={setStatus}
              />
            </div>

            {/* Dashboard: Controls, Sync info, Host details */}
            <div className="hidden lg:block shrink-0">
               <WatchPartyDashboard
                 isHost={socketState.isHost}
                 isPlaying={playbackState.isPlaying}
                 latency={socketState.isConnected ? latency : 0}
                 quality={playbackState.quality || 'Auto'}
                 onPlay={() => play(playbackState.currentTime)}
                 onPause={() => pause(playbackState.currentTime)}
                 movieTitle={movieData?.movieTitle}
               />
            </div>
          </div>

          {/* Footer: Live Stats (Bitrate, Sync Health, Buffer) */}
          <div className="hidden lg:block shrink-0">
             <WatchPartyFooter
               participantsCount={socketState.participants.length}
               hostName={socketState.hostId ? (socketState.participants.find(p => p.socketId === socketState.hostId)?.userName || 'Host') : 'Host'}
               startTime="Just now"
               onLeave={handleLeave}
               onReport={() => { }}
             />
          </div>
        </div>

        {/* Right Section: Interactive Side Panel (Chat, Participants, Activity) */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex-1 lg:h-full border-t lg:border-t-0 lg:border-l border-white/10 shrink-0 bg-[#0A0A0A] flex flex-col min-h-[300px]">
          <WatchPartySidePanel
            messages={chatMessages}
            participants={socketState.participants}
            currentUser={{ id: userId, name: userName || 'Guest' }}
            onSendMessage={(msg: string) => sendMessage(msg, userName || 'Guest')}
            isConnected={socketState.isConnected}
          />
        </div>
      </div>
    </div>
  );
}
