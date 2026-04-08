"use client";

import { motion } from "framer-motion";
import { Pencil, X, Plus } from "lucide-react";
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.1, y: -6 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-3 cursor-pointer group focus:outline-none"
      >
        <div className="w-[112px] h-[112px] md:w-[128px] md:h-[128px] rounded-full border-2 border-dashed border-[#333] flex items-center justify-center transition-colors group-hover:border-white">
          <Plus className="w-8 h-8 text-[#555] group-hover:text-white transition-colors" />
        </div>
        <span className="text-sm text-[#8a8a8a] group-hover:text-white transition-colors">
          Add Profile
        </span>
      </motion.button>
    );
  }

  if (!profile) return null;

  const avatar = AVATAR_MAP[profile.avatarId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col items-center gap-3"
      layout
    >
      {/* Main clickable area */}
      <motion.button
        type="button"
        onClick={managing ? onEdit : onSelect}
        whileHover={{ scale: 1.1, y: -6 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`
          relative cursor-pointer focus:outline-none group
          ${managing ? "animate-[wiggle_0.5s_ease-in-out_infinite]" : ""}
        `}
      >
        {/* Avatar circle */}
        <div
          className={`
            w-[112px] h-[112px] md:w-[128px] md:h-[128px]
            rounded-full bg-gradient-to-br ${avatar?.gradient || "from-gray-800 to-gray-900"}
            flex items-center justify-center
            border-2 border-transparent
            group-hover:border-white/40
            transition-all duration-300
            shadow-xl group-hover:shadow-2xl
          `}
        >
          <span className="text-[48px] select-none" style={{ lineHeight: 1 }}>
            {avatar?.emoji || "👤"}
          </span>
        </div>

        {/* Kids badge */}
        {profile.isKids && (
          <div className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-yellow-400 rounded-full flex items-center justify-center text-[11px] shadow-md border-2 border-black">
            ⭐
          </div>
        )}

        {/* Manage mode: edit pencil overlay */}
        {managing && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="w-6 h-6 text-white" />
          </div>
        )}
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
          className="absolute -top-1 -right-1 w-[28px] h-[28px] bg-red-600 rounded-full flex items-center justify-center border-2 border-black cursor-pointer hover:bg-red-500 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.button>
      )}

      {/* Profile name */}
      <motion.span
        className={`text-sm transition-colors duration-200 ${
          managing ? "text-white" : "text-[#8a8a8a] group-hover:text-white"
        }`}
        layout
      >
        {profile.name}
      </motion.span>
    </motion.div>
  );
}
