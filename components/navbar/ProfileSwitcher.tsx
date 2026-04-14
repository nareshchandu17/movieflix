"use client";

import { useState, useCallback } from "react";
import { AVATAR_MAP } from "@/lib/avatars";
import { useProfile } from "@/contexts/ProfileContext";
import { ChevronDown, Plus, UserCircle, Settings, SwitchCamera, Sparkles, Download, LogOut, User, Dna } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import PinModal from "@/components/profiles/PinModal";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Profile } from "@/types/profiles";

export default function ProfileSwitcher() {
  const { profiles, activeProfile, selectProfile, switchProfile, isPinProtected } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);
  const router = useRouter();

  const handleProfileClick = useCallback(async (profile: Profile) => {
    if (profile.profileId === activeProfile?.profileId) {
      setIsOpen(false);
      return;
    }

    // Always try to select profile - backend will handle PIN validation
    try {
      await selectProfile(profile);
      setIsOpen(false);
      router.refresh(); // Refresh to update server components/middleware
    } catch (error: any) {
      // If PIN is required, show PIN modal
      if (error.message?.includes('PIN') || error.message?.includes('pin')) {
        setPendingProfile(profile);
        setIsPinModalOpen(true);
        setIsOpen(false);
      }
      // Other errors are handled in context
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

  // Fallback if no profile is active, but we should still show the switcher if profiles exist
  const currentAvatar = activeProfile ? AVATAR_MAP[activeProfile.avatarId] : null;

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
        profileId={pendingProfile?.profileId}
      />

      {/* Active Profile Trigger — Circle Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-all"
        aria-label="Profile Switcher"
      >
        <div 
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentAvatar?.gradient || "from-gray-700 to-gray-800"} flex items-center justify-center border-2 border-white/20 group-hover:border-white/50 transition-all shadow-lg active:scale-95 ring-2 ring-transparent group-hover:ring-white/10`}
        >
          {currentAvatar ? (
            <span className="text-xl leading-none">{currentAvatar.emoji}</span>
          ) : (
            <UserCircle className="w-6 h-6 text-white/70" />
          )}
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
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-60 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] z-[1200] overflow-hidden"
            >
              {/* ── Current Profile Header ── */}
              <div className="p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${currentAvatar?.gradient || "from-gray-700 to-gray-800"} flex items-center justify-center border-2 border-white/20 shadow-lg flex-shrink-0`}
                  >
                    {currentAvatar ? (
                      <span className="text-2xl leading-none">{currentAvatar.emoji}</span>
                    ) : (
                      <UserCircle className="w-7 h-7 text-white/70" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{activeProfile?.name || "Guest"}</p>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Current Profile</p>
                  </div>
                </div>
              </div>

              {/* ── Switch / Add Profile ── */}
              <div className="px-2 pb-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    switchProfile();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <SwitchCamera className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Switch Profile</span>
                </button>

                <Link
                  href="/profiles/create"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Add Profile</span>
                </Link>

                {/* Other profiles as compact switchers */}
                {profiles
                  .filter(p => !activeProfile || p.profileId !== activeProfile.profileId)
                  .length > 0 && (
                  <div className="flex gap-2 px-3 pt-2 pb-1">
                    {profiles
                      .filter(p => !activeProfile || p.profileId !== activeProfile.profileId)
                      .slice(0, 4)
                      .map(profile => {
                        const avatar = AVATAR_MAP[profile.avatarId];
                        return (
                          <button
                            key={profile.profileId}
                            onClick={() => handleProfileClick(profile)}
                            className="relative group/avatar"
                            title={profile.name}
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar?.gradient} flex items-center justify-center border border-white/10 group-hover/avatar:border-white/40 group-hover/avatar:scale-110 transition-all`}>
                              <span className="text-sm">{avatar?.emoji}</span>
                            </div>
                            {profile.pinEnabled && (
                              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-black" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="mx-3 my-1 border-t border-white/[0.06]" />

              {/* ── Navigation Links ── */}
              <div className="px-2 py-1 space-y-0.5">
                <Link
                  href="/taste-dna"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-cyan/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Dna className="w-4 h-4 text-cyan group-hover:text-cyan transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Taste DNA</span>
                </Link>

                <Link
                  href="/mood-engine"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-purple-500/10 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">AI Mood Engine</span>
                </Link>

                <Link
                  href="/for-you"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">For You</span>
                </Link>

                <Link
                  href="/downloads"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Download className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Downloads</span>
                </Link>
              </div>

              {/* ── Divider ── */}
              <div className="mx-3 my-1 border-t border-white/[0.06]" />

              {/* ── Account & Settings ── */}
              <div className="px-2 py-1">
                <Link
                  href="/account"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Account & Settings</span>
                </Link>
              </div>

              {/* ── Divider ── */}
              <div className="mx-3 my-1 border-t border-white/[0.06]" />

              {/* ── Sign Out ── */}
              <div className="px-2 pt-1 pb-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-red-500/60 group-hover:text-red-500 transition-colors" />
                  <span className="text-sm text-red-500/70 group-hover:text-red-500 transition-colors">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
