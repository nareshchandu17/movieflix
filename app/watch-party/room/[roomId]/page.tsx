"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Copy, LogOut, Wifi, WifiOff, Crown, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useRoom } from "@/contexts/RoomContext";
import { socket } from "@/lib/socket/client";
import { PlayerRoot } from "@/components/player/PlayerRoot";
import { usePlayerState } from "@/hooks/usePlayerState";
import { Button } from "@/components/ui/button";

const WatchRoom = () => {
  const params = useParams();
  const roomId = params?.roomId as string;
  const { rooms, leaveRoom } = useRoom();
  const router = useRouter();
  
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isInternalChangeRef = useRef(false);

  const room = rooms.get(roomId);
  // In a real app, if room is not in context (e.g. on refresh), you'd fetch it from API
  // For this demo, we'll fallback to a mock user if room missing
  const currentUser = room?.participants[0] || "Guest-" + Math.floor(Math.random() * 1000);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Movie Data
  useEffect(() => {
    async function fetchMovie() {
      try {
        const id = room?.movieId || "550"; // Fallback to a default movie ID
        // Mock fetch or actual TMDB fetch
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
        if (res.ok) {
           const data = await res.json();
           setMovieData({
             id,
             title: data.title,
             videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
             description: data.overview
           });
        } else {
           // Fallback mock
           setMovieData({
             id,
             title: "Big Buck Bunny",
             videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
             description: "A large rabbit deals with three bullying squirrels."
           });
        }
      } catch (err) {
        console.error("Failed to fetch movie:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [room?.movieId]);

  // Sync Bridge
  useEffect(() => {
    if (!roomId) return;

    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("play", () => {
      isInternalChangeRef.current = true;
      if (!usePlayerState.getState().playing) {
        usePlayerState.getState().togglePlay();
      }
      setTimeout(() => { isInternalChangeRef.current = false; }, 100);
    });

    socket.on("pause", () => {
      isInternalChangeRef.current = true;
      if (usePlayerState.getState().playing) {
        usePlayerState.getState().togglePlay();
      }
      setTimeout(() => { isInternalChangeRef.current = false; }, 100);
    });

    socket.on("seek", (time) => {
      isInternalChangeRef.current = true;
      usePlayerState.getState().seek(time);
      setTimeout(() => { isInternalChangeRef.current = false; }, 100);
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.disconnect();
    };
  }, [roomId]);

  // Handle Internal Player Events and emit to socket
  useEffect(() => {
    const unsub = usePlayerState.subscribe(
      (state) => state.playing,
      (playing) => {
        if (isInternalChangeRef.current) return;
        socket.emit(playing ? "play" : "pause", roomId);
      }
    );
    
    // For seek, we'd need a way to detect manual seek vs sync seek.
    // For now, we'll rely on the existing socket logic in page components if needed.
    
    return () => unsub();
  }, [roomId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watch-party/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmLeave = () => {
    if (room && currentUser) leaveRoom(room.id, currentUser);
    router.push("/watch-party");
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    socket.emit("chat-message", {
      roomId,
      message: chatInput,
      user: currentUser,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setChatInput("");
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold tracking-widest uppercase opacity-50">Buffering Party Environment...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* 🎬 MOVIE TITLE TOP BAR */}
      <div className="w-full h-14 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 rounded-full border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Watching</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {movieData?.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Room ID Display */}
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Room ID</span>
               <span className="font-mono text-sm font-bold text-white tracking-widest">{roomId}</span>
             </div>
             <button
               onClick={handleCopyLink}
               className={`p-2.5 rounded-xl transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}
             >
               {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
             </button>
          </div>
          
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* PLAYER SECTION */}
        <div className="flex-1 relative bg-black flex flex-col items-center justify-center group/player">
           <PlayerRoot 
             contentId={movieData?.id || "550"}
             url={movieData?.videoUrl}
             title={movieData?.title}
             roomId={roomId}
             isWatchParty={true}
           />
           
           {/* Participants Bar (Floating) */}
           <div className="absolute bottom-32 left-8 flex items-center gap-3 z-50 pointer-events-none">
             {room?.participants.map((p, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="group pointer-events-auto relative"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[hsl(240,20%,12%)] border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-xl">
                    {p.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 rounded-md text-[10px] uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/5">
                    {p}
                  </div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* CHAT SECTION */}
        <div className="w-[400px] border-l border-white/5 flex flex-col bg-[#080808]">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                   <MessageSquare className="w-4 h-4 text-white/40" />
                 </div>
                 <h2 className="font-bold tracking-tight">Party Chat</h2>
              </div>
              <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {isConnected ? "Connected" : "Disconnected"}
              </div>
           </div>
           
           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                   <MessageSquare className="w-12 h-12 mb-4" strokeWidth={1} />
                   <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex flex-col ${msg.user === currentUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 px-1">
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{msg.user}</span>
                       <span className="text-[9px] text-white/10 font-bold">{msg.timestamp}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] ${msg.user === currentUser ? 'bg-red-600 text-white rounded-tr-sm shadow-xl shadow-red-600/10' : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-sm'}`}>
                      {msg.message}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={chatEndRef} />
           </div>

           {/* Input */}
           <div className="p-6 border-t border-white/5">
              <form onSubmit={handleSendMessage} className="relative">
                 <input 
                   type="text"
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Say something to the room..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/20"
                 />
                 <button 
                   type="submit"
                   disabled={!chatInput.trim()}
                   className="absolute right-2 top-2 p-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:bg-white/5 text-white rounded-xl transition-all active:scale-90"
                 >
                   <Send className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>
      </div>

      {/* Leave Modal */}
      <AnimatePresence>
        {showLeaveDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLeaveDialog(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                   <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Leave the Party?</h3>
                <p className="text-sm text-white/40 mb-8">You can rejoin anytime using the room code <span className="text-white font-mono">{roomId}</span></p>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => setShowLeaveDialog(false)} className="py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">Cancel</button>
                   <button onClick={confirmLeave} className="py-4 rounded-2xl bg-red-600 font-bold hover:bg-red-500 transition-all shadow-xl shadow-red-600/20">Leave Now</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchRoom;
