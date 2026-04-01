"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Users, Tv, Sparkles, ArrowRight } from "lucide-react";
import { useRoom } from "@/contexts/RoomContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Landing = () => {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const { createRoom, joinRoom } = useRoom();
  const router = useRouter();

  const handleCreate = () => {
    if (!userName.trim()) return;
    const roomId = createRoom(userName.trim());
    router.push(`/watch-party/room/${roomId}`);
  };

  const handleJoin = () => {
    if (!userName.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim().toUpperCase(), userName.trim());
    router.push(`/watch-party/room/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[hsl(240,20%,4%)] relative overflow-hidden flex items-center justify-center" >
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-500/8 blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle mb-8 text-sm text-white/80"
          >
            <Sparkles className="w-4 h-4 text-red-500" />
            Watch Together, Anywhere
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight mb-4">
            <span className="text-red-400 drop-shadow-lg drop-shadow-red-500/50">Watch</span>
            <span className="text-red-500 drop-shadow-lg drop-shadow-red-500/50"> Party</span>
          </h1>
          <p className="text-white/90 text-lg max-w-md mx-auto" style={{ textWrap: 'balance' }}>
            Stream movies together in perfect sync. Create a room, invite friends, and enjoy the show.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {mode === "idle" && (
            <div className="space-y-4">
              <button
                onClick={() => setMode("create")}
                className="group w-full glass rounded-xl p-6 text-left transition-all duration-300 hover:border-red-500/30 hover:glow-primary-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Tv className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white text-lg">Start Watch Party</h3>
                    <p className="text-sm text-white/80">Create a room and invite friends</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="group w-full glass rounded-xl p-6 text-left transition-all duration-300 hover:border-red-500/30 hover:glow-primary-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                    <Users className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white text-lg">Join Party</h3>
                    <p className="text-sm text-white/80">Enter a room code to join</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </div>
          )}

          {mode === "create" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-8 space-y-5"
            >
              <div>
                <h3 className="font-display font-semibold text-white text-lg mb-1">Create a Room</h3>
                <p className="text-sm text-white/80">Enter your name to get started</p>
              </div>
              <Input
                placeholder="Your display name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="glass border-border/50 h-12 text-foreground placeholder:text-muted-foreground focus:border-red-500/50 focus:ring-red-500/20"
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setMode("idle")} className="flex-1 h-12 text-white/80 hover:text-white">
                  Back
                </Button>
                <Button onClick={handleCreate} disabled={!userName.trim()} className="flex-1 h-12 bg-red-500 text-white hover:bg-red-600 glow-primary-sm font-semibold">
                  <Play className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "join" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-8 space-y-5"
            >
              <div>
                <h3 className="font-display font-semibold text-white text-lg mb-1">Join a Party</h3>
                <p className="text-sm text-white/80">Enter the room code and your name</p>
              </div>
              <Input
                placeholder="Room code (e.g. ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="glass border-border/50 h-12 text-foreground placeholder:text-muted-foreground focus:border-red-500/50 focus:ring-red-500/20 font-mono tracking-widest"
                maxLength={6}
              />
              <Input
                placeholder="Your display name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="glass border-border/50 h-12 text-foreground placeholder:text-muted-foreground focus:border-red-500/50 focus:ring-red-500/20"
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setMode("idle")} className="flex-1 h-12 text-white/80 hover:text-white">
                  Back
                </Button>
                <Button onClick={handleJoin} disabled={!userName.trim() || !roomCode.trim()} className="flex-1 h-12 bg-red-500 text-white hover:bg-red-600 glow-primary-sm font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-8 mt-12 text-sm text-white/80"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            <span>1.2k watching now</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>342 active rooms</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
