"use client";

import { useState } from "react";
import { ChevronLeft, UserPlus, Users, Share2, AlertTriangle, LogOut, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface WatchPartyHeaderProps {
  title: string;
  subtitle?: string;
  participantsCount: number;
  onLeave: () => void;
  onInvite: () => void;
  isHost: boolean;
  roomCode: string;
}

export const WatchPartyHeader = ({
  title,
  subtitle = "S1 E2 • The Kingsroad",
  onLeave,
  onInvite,
  participantsCount,
  roomCode
}: WatchPartyHeaderProps) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  return (
    <div className="w-full h-[84px] bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-10 z-[100] relative">
      {/* Left: Movie Info */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white tracking-tight leading-tight uppercase">
            {title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
             <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-zinc-500" />
                <span className="text-xs font-medium text-zinc-500">Party Chat</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-zinc-800" />
             <span className="text-xs font-medium text-zinc-500">{participantsCount} members connected</span>
          </div>
        </div>
      </div>

      {/* Center: Sync Status & Avatars */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
        <div className="bg-zinc-900/80 border border-white/5 rounded-full py-2 px-3 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 relative overflow-hidden"
              >
                <Image
                  src={`https://i.pravatar.cc/100?u=user${i}`}
                  alt="User"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-emerald-500 z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col pr-2">
            <span className="text-[11px] font-bold text-white leading-tight uppercase truncate max-w-[120px]">{title}</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              In Sync
            </span>
          </div>
        </div>

        <button
          onClick={onInvite}
          className="h-11 px-6 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center gap-2.5 hover:bg-zinc-800 transition-all font-bold text-sm text-white/90 active:scale-95"
        >
          <Share2 size={18} className="text-zinc-400" />
          Invite
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-8 relative">
        <div className="relative">
          <button 
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
