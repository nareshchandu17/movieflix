"use client";

import { motion } from "framer-motion";
import { Pencil, X, Plus, Lock } from "lucide-react";
import { AVATAR_MAP } from "@/lib/avatars";
import type { Profile } from "@/types/profiles";

interface ProfileCardProps {
  profile?: Profile;
  isAddCard?: boolean;
  managing?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  index?: number;
  isLastProfile?: boolean;
}

export default function ProfileCard({
  profile,
  isAddCard = false,
  managing = false,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
  index = 0,
  isLastProfile = false,
}: ProfileCardProps) {

  // ── Add Profile variant ───────────────
  if (isAddCard) {
    return (
      <motion.button
        type="button"
        onClick={onAdd}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-4 cursor-pointer group focus:outline-none"
      >
        {/* Card container */}
        <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-xl p-6 border border-white/5 group-hover:border-[#E50914] group-hover:bg-white/[0.06] transition-all duration-300">
          <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full border-2 border-dashed border-[#333] flex items-center justify-center transition-all duration-500 group-hover:border-white/20">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Plus className="w-12 h-12 text-[#444] group-hover:text-white/80 transition-colors duration-300" />
            </motion.div>
          </div>

          {/* Subtle glow on hover */}
          <div className="absolute inset-0 rounded-xl group-hover:ring-2 group-hover:ring-[#E50914] transition-all duration-300 pointer-events-none" />
        </div>

        <span className="text-[14px] font-medium text-[#777] group-hover:text-white transition-colors duration-300 tracking-wide mt-2">
          Add Profile
        </span>
      </motion.button>
    );
  }

  if (!profile) return null;

  const avatar = AVATAR_MAP[profile.avatarId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay: index * 0.1 + 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col items-center gap-4"
      layout
    >
      {/* Main clickable area */}
      <motion.button
        type="button"
        onClick={managing ? onEdit : onSelect}
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`
          relative cursor-pointer focus:outline-none group
          ${managing ? "animate-[wiggle_0.5s_ease-in-out_infinite]" : ""}
        `}
      >
        {/* Card container with square design */}
        <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 border border-white/5 group-hover:border-[#E50914] group-hover:bg-white/[0.06] transition-all duration-300">
          {/* Avatar Area */}
          <div
            className={`
              w-[120px] h-[120px] md:w-[150px] md:h-[150px]
              rounded-lg bg-gradient-to-br ${avatar?.gradient || "from-gray-800 to-gray-900"}
              flex items-center justify-center
              transition-all duration-300
              relative overflow-hidden
            `}
          >
            <span className="text-[56px] md:text-[64px] select-none z-10" style={{ lineHeight: 1 }}>
              {avatar?.emoji || "👤"}
            </span>

            {/* Ambient inner glow */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          </div>

          {/* Red Border Overlay on Hover */}
          <div className="absolute inset-0 rounded-xl group-hover:ring-2 group-hover:ring-[#E50914] transition-all duration-300 pointer-events-none" />

          {/* Kids badge */}
          {profile.isKids && (
            <div className="absolute bottom-4 right-4 px-2.5 py-1 bg-yellow-400 rounded-full flex items-center gap-1 shadow-lg border-2 border-black/40">
              <span className="text-[10px] font-bold text-black uppercase">Kids</span>
            </div>
          )}

          {/* PIN lock badge */}
          {profile.pinEnabled && !managing && (
            <div className="absolute top-4 right-4 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/[0.08] group-hover:bg-[#E50914]/20 group-hover:border-[#E50914]/30 transition-all duration-300">
              <Lock className="w-3.5 h-3.5 text-white/60 group-hover:text-[#E50914] transition-colors duration-300" />
            </div>
          )}

          {/* Manage mode: edit pencil overlay */}
          {managing && (
            <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Pencil className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </motion.button>

      {/* Delete badge (manage mode, not on last profile) */}
      {managing && !isLastProfile && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="absolute -top-2 -right-2 w-[30px] h-[30px] bg-red-600 rounded-full flex items-center justify-center border-2 border-[#0a0a0a] cursor-pointer hover:bg-red-500 transition-colors z-10 shadow-lg"
        >
          <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.button>
      )}

      {/* Profile name */}
      <motion.span
        className={`text-[14px] font-medium transition-colors duration-300 tracking-wide ${
          managing ? "text-white" : "text-[#777] group-hover:text-white"
        }`}
        layout
      >
        {profile.name}
      </motion.span>
    </motion.div>
  );
}
