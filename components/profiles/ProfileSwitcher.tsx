"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AVATAR_MAP } from "@/lib/avatars";
import type { Profile } from "@/types/profiles";

interface ProfileSwitcherProps {
  profiles: Profile[];
  activeProfile: Profile | null;
  onSwitch: (profile: Profile) => void;
  onManage?: () => void;
  onAnalytics?: (profile: Profile) => void;
}

export default function ProfileSwitcher({
  profiles,
  activeProfile,
  onSwitch,
  onManage,
  onAnalytics,
}: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeAvatar = activeProfile ? AVATAR_MAP[activeProfile.avatarId] : null;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer focus:outline-none group"
      >
        <div
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeAvatar?.gradient || "from-gray-700 to-gray-900"} flex items-center justify-center text-base overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors`}
        >
          {activeAvatar?.emoji || "👤"}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-12 w-[220px] bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]"
          >
            {/* Current profile */}
            {activeProfile && (
              <div className="px-4 py-3 bg-white/5 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeAvatar?.gradient || ""} flex items-center justify-center text-lg`}
                >
                  {activeAvatar?.emoji || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {activeProfile.name}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                    Active
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-white/5" />

            {/* Other profiles */}
            <div className="py-1 max-h-[200px] overflow-y-auto">
              {profiles
                .filter((p) => p.profileId !== activeProfile?.profileId)
                .map((profile) => {
                  const av = AVATAR_MAP[profile.avatarId];
                  return (
                    <button
                      key={profile.profileId}
                      type="button"
                      onClick={() => {
                        onSwitch(profile);
                        setOpen(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${av?.gradient || "from-gray-700 to-gray-900"} flex items-center justify-center text-sm`}
                      >
                        {av?.emoji || "👤"}
                      </div>
                      <span className="text-sm text-[#aaa] hover:text-white transition-colors truncate">
                        {profile.name}
                      </span>
                      {profile.isKids && (
                        <span className="text-[9px] ml-auto">⭐</span>
                      )}
                      {onAnalytics && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnalytics(profile);
                          }}
                          className="p-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Analytics"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 01-1-1H2a1 1 0 01-1 1v2zM5 6a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 01-1-1H5a1 1 0 01-1-1v1zM2 15a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 01-1-1H2a1 1 0 01-1-1v2z"/>
                          </svg>
                        </button>
                      )}
                      {onManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManage();
                          }}
                          className="p-1 bg-gray-500/20 hover:bg-gray-500/30 rounded text-gray-400 hover:text-gray-300 transition-colors"
                          title="Manage Profile"
                        >
                          <Settings className="w-3 h-3" />
                        </button>
                      )}
                    </button>
                  );
                })}
            </div>

            <div className="border-t border-white/5" />

            {/* Actions */}
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/profiles/select");
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[#aaa] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Manage Profiles</span>
              </button>

              {profiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/profiles/create");
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-[#aaa] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add Profile</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
