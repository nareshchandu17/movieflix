"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Check, Eye } from "lucide-react";
import { useState } from "react";

interface ReactionOverlayProps {
  show: boolean;
  type: string;
  onShare: (isPublic: boolean) => void;
  onDismiss: () => void;
}

export default function ReactionOverlay({ show, type, onShare, onDismiss }: ReactionOverlayProps) {
  const [sharing, setSharing] = useState(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-24 right-8 z-[110] w-72 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                Reaction Detected
              </div>
              <button 
                onClick={onDismiss}
                className="text-white/20 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">That was intense! 😱</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                We captured your response to the <strong>{type}</strong>. Want to save this moment?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => onShare(false)}
                className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all"
              >
                Private
              </button>
              <button 
                onClick={() => onShare(true)}
                className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase">
                <Shield className="w-3 h-3" /> Encrypted
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase">
                <Eye className="w-3 h-3" /> Opt-in only
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
