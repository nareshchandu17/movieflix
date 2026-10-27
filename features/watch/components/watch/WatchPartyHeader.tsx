"use client";

import { useState } from "react";
import { Share2, AlertTriangle, LogOut, MessageSquare, X, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "sonner";

interface WatchPartyHeaderProps {
  title: string;
  poster?: string;
  participants: Array<{
    userId: string;
    userName: string;
    avatarUrl?: string;
    isHost: boolean;
  }>;
  participantsCount: number;
  isConnected: boolean;
  roomApiResponseMs: number | null;
  onLeave: () => void;
  onInvite: () => void;
  roomCode: string;
}

export const WatchPartyHeader = ({
  title,
  poster,
  participants,
  isConnected,
  roomApiResponseMs,
  onLeave,
  onInvite,
  participantsCount,
  roomCode
}: WatchPartyHeaderProps) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast.success("Room code copied to clipboard.");
    } catch {
      toast.error("Could not copy the room code.");
    }
  };

  return (
    <div className="relative z-[100] flex w-full flex-col items-stretch gap-3 border-b border-white/5 bg-[#0A0A0A] px-4 py-3 md:px-8 lg:h-[84px] lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:px-10 lg:py-0">
      {/* Left: Movie Info */}
      <div className="flex min-w-0 items-center gap-3 lg:flex-none">
        <div className="relative hidden h-12 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900 sm:block">
          {poster ? (
            <Image src={poster} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] font-semibold text-zinc-600">No poster</div>
          )}
        </div>
        <div className="flex min-w-0 max-w-full flex-col">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 flex-1 truncate text-sm font-bold uppercase leading-tight tracking-tight text-white md:text-xl">
              {title}
            </h1>
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] py-1 pl-2 pr-1.5">
              <span className="text-[9px] md:text-[10px] font-medium text-zinc-500">Room code:</span>
              <code className="text-[10px] md:text-xs font-semibold tracking-wider text-zinc-200">{roomCode}</code>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                aria-label={`Copy room code ${roomCode}`}
                title="Copy room code"
                className="ml-0.5 rounded p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Copy size={12} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
             <div className="flex items-center gap-1.5 md:gap-2">
                <MessageSquare size={12} className="text-zinc-500 md:w-3.5 md:h-3.5" />
                <span className="text-[10px] md:text-xs font-medium text-zinc-500 hidden sm:inline">Party Chat</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-zinc-800 hidden sm:block" />
             <span className="text-[10px] md:text-xs font-medium text-zinc-500 truncate">
               {participantsCount} {participantsCount === 1 ? "participant" : "participants"} online
             </span>
          </div>
        </div>
      </div>

      {/* Center: Sync Status & Avatars */}
      <div className="relative flex w-full min-w-0 flex-wrap items-center justify-between gap-3 lg:absolute lg:left-1/2 lg:top-1/2 lg:w-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:flex-nowrap lg:justify-center lg:gap-6">
        <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/5 bg-zinc-900/80 px-3 py-2 sm:gap-4">
          <div className="flex -space-x-3">
            {participants.slice(0, 3).map((participant) => (
              <div
                key={participant.userId}
                className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-zinc-900 bg-zinc-800 sm:h-8 sm:w-8"
                title={`${participant.userName}${participant.isHost ? " · Host" : ""}`}
              >
                {participant.avatarUrl ? (
                  <Image src={participant.avatarUrl} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white/80">
                    {(participant.userName.trim()[0] || "?").toUpperCase()}
                  </span>
                )}
              </div>
            ))}
            {participantsCount > 3 && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-800 text-[10px] font-bold text-white/80 sm:h-8 sm:w-8">
                +{participantsCount - 3}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col pr-1 sm:pr-2">
            <span className="max-w-[120px] truncate text-[11px] font-bold uppercase leading-tight text-white">{title}</span>
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isConnected ? "text-emerald-500" : "text-amber-400"}`}>
              <span className={`h-1 w-1 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`} />
              {isConnected ? "Connected" : "Reconnecting"}
            </span>
            {isConnected && (
              <span className="text-[9px] font-medium text-zinc-500">
                {roomApiResponseMs === null ? "API response not measured" : `Room API response · ${roomApiResponseMs}ms`}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onInvite}
          className="flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-sm font-bold text-white/90 transition-all hover:bg-zinc-800 active:scale-95 sm:h-11 sm:gap-2.5 sm:px-6"
        >
          <Share2 size={18} className="text-zinc-400" />
          Invite
        </button>
      </div>

      {/* Right: Actions */}
      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 lg:justify-end lg:gap-8 lg:pl-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReportModal(!showReportModal)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${showReportModal ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
          >
            <AlertTriangle size={16} />
            Report Issue
          </button>

          <AnimatePresence>
            {showReportModal && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-72 bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-[110]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Report Issue</h3>
                  <button onClick={() => setShowReportModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <textarea 
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the problem..."
                  className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-zinc-700 resize-none focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
                />
                <button 
                  onClick={() => { setShowReportModal(false); setReportText(""); }}
                  className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest transition-all"
                >
                  Submit Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          type="button"
          onClick={() => setShowLeaveConfirm(true)}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-all active:scale-95 group"
        >
          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          Leave Party
        </button>
      </div>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 mx-auto">
                <LogOut className="text-red-500" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Leave Party?</h2>
              <p className="text-sm text-zinc-500 text-center mb-8">
                Are you sure you want to exit the watch party? You'll need an invite to join back.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={onLeave}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/20"
                >
                  Yes, Leave
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
