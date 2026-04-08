"use client";

import { useState, useCallback } from "react";
import { AVATAR_MAP } from "@/lib/avatars";
import { useProfile } from "@/contexts/ProfileContext";
import { ChevronDown, Plus, UserCircle, Edit3, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PinModal from "@/components/profiles/PinModal";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/profiles";

export default function ProfileSwitcher() {
  const { profiles, activeProfile, selectProfile, isPinProtected } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);
  const router = useRouter();

  const handleProfileClick = useCallback(async (profile: Profile) => {
    if (profile.profileId === activeProfile?.profileId) {
      setIsOpen(false);
      return;
    }

    // Check for PIN
    if (profile.pin) {
      setPendingProfile(profile);
      setIsPinModalOpen(true);
      setIsOpen(false);
      return;
    }

    // Otherwise select directly
    try {
      await selectProfile(profile);
      setIsOpen(false);
      router.refresh(); // Refresh to update server components/middleware
    } catch {
      // Error handled in context
    }
  }, [activeProfile, selectProfile, router]);

  const handlePinSuccess = useCallback(async () => {
    setIsPinModalOpen(false);
    if (pendingProfile) {
      await selectProfile(pendingProfile);
      router.refresh();
      setPendingProfile(null);
    }
  }, [pendingProfile, selectProfile, router]);

  if (!activeProfile) return null;

  const currentAvatar = AVATAR_MAP[activeProfile.avatarId];

  return (
    <div className="relative">
      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingProfile(null);
        }}
        onSuccess={handlePinSuccess}
        profileName={pendingProfile?.name || ""}
      />

      {/* Active Profile Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 rounded-lg hover:bg-white/5 transition-all"
      >
        <div 
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currentAvatar?.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-all`}
        >
          <span className="text-xl leading-none">{currentAvatar?.emoji || "👤"}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[1100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl z-[1200] overflow-hidden"
            >
              <div className="p-3 space-y-2">
                {/* Other Profiles */}
                {profiles.filter(p => p.profileId !== activeProfile.profileId).map(profile => {
                  const avatar = AVATAR_MAP[profile.avatarId];
                  return (
                    <button
                      key={profile.profileId}
                      onClick={() => handleProfileClick(profile)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatar?.gradient} flex items-center justify-center border border-white/10 group-hover:border-white/30`}>
                        <span className="text-base">{avatar?.emoji}</span>
                      </div>
                      <span className="text-sm font-medium text-white/80 group-hover:text-white">{profile.name}</span>
                      {profile.pin && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                      )}
                    </button>
                  );
                })}

                {/* Management Options */}
                <div className="my-2 border-t border-white/10" />

                <Link
                  href="/account"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group text-white/70 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Manage Profiles</span>
                </Link>

                <Link
                  href="/profiles/create"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition group text-white/70 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Add Profile</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
