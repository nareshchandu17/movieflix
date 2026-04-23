"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWatchPartySocket } from "@/hooks/useWatchPartySocket";
import { WatchPartyHeader } from "@/components/watch/WatchPartyHeader";
import { WatchPartyPlayer } from "@/components/watch/WatchPartyPlayer";
import { WatchPartyDashboard } from "@/components/watch/WatchPartyDashboard";
import { WatchPartySidePanel } from "@/components/watch/WatchPartySidePanel";
import { WatchPartyFooter } from "@/components/watch/WatchPartyFooter";
import { NameModal } from "@/components/watch/NameModal";

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

  useEffect(() => {
    setIsMounted(true);
    // Check if name is in session/local storage
    const storedName = localStorage.getItem('watch_party_name');
    if (storedName) {
      setUserName(storedName);
      setIsAskingName(false);
    }
  }, []);

  // Socket Hook
  const {
    socketState,
    playbackState,
    chatMessages,
    sendMessage,
    sendReaction,
    setStatus,
    play,
    pause,
    seek
  } = useWatchPartySocket(roomId || null, isAskingName ? null : userId, userName);

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
    alert('Invite link copied to clipboard!');
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
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden selection:bg-red-500/30">
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
      <div className="flex-1 flex min-h-0">

        {/* Left Section: Video + Dashboard + Footer Stats */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Internal Scrollable for Dashboard */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col">

            {/* The Cinematic Player Section */}
            <div className="relative aspect-video w-full bg-black shadow-2xl overflow-hidden">
              <WatchPartyPlayer
                watchParty={movieData}
                userId={userId}
                userName={userName || 'Guest'}
                userImage=""
                onLeave={handleLeave}
                socketState={socketState}
                playbackState={playbackState}
                play={play}
                pause={pause}
                seek={seek}
                sendMessage={(m) => sendMessage(m, userName || 'Guest')}
                sendReaction={(r) => sendReaction(r, userName || 'Guest', playbackState.currentTime)}
                setStatus={setStatus}
              />
            </div>

            {/* Dashboard: Controls, Sync info, Host details */}
            <WatchPartyDashboard
              isHost={socketState.isHost}
              isPlaying={playbackState.isPlaying}
              latency={42}
              quality={playbackState.quality || 'Auto'}
            />
          </div>

          {/* Footer: Live Stats (Bitrate, Sync Health, Buffer) */}
          <WatchPartyFooter
            participantsCount={socketState.participants.length}
            hostName={socketState.hostId ? (socketState.participants.find(p => p.socketId === socketState.hostId)?.userName || 'Host') : 'Host'}
            startTime="Just now"
            onLeave={handleLeave}
            onReport={() => {}}
          />
        </div>

        {/* Right Section: Interactive Side Panel (Chat, Participants, Activity) */}
        <div className="hidden lg:block">
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
