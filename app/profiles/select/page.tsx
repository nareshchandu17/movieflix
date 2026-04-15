"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProfileCard from "@/components/profiles/ProfileCard";
import ManageProfilesGrid from "@/components/profiles/ManageProfilesGrid";
import { AVATAR_MAP } from "@/lib/avatars";
import { useProfiles } from "@/hooks/useProfiles";
import type { Profile } from "@/types/profiles";
import PinModal from "@/components/profiles/PinModal";

export default function ProfileSelectPage() {
  const router = useRouter();
  const { profiles, isPinProtected, loading, error, refetch, selectProfile, editProfile, deleteProfile } =
    useProfiles();

  const [managing, setManaging] = useState(false);
  const [selectingProfile, setSelectingProfile] = useState<Profile | null>(null);
  const [flashOut, setFlashOut] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);

  const finalizeSelect = useCallback(
    async (profile: Profile, verifiedPin?: string) => {
      setSelectingProfile(profile);

      try {
        // If profile has PIN, include the verified PIN in the select request
        if (profile.pinEnabled && verifiedPin) {
          // Call select API directly with PIN included
          const res = await fetch("/api/profiles/select", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: profile.profileId, pin: verifiedPin }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Failed to select profile");
        } else {
          await selectProfile(profile);
        }

        // Store unlock state in sessionStorage (re-lock on tab close — Netflix behavior)
        sessionStorage.setItem("mf_profile_unlocked", profile.profileId);

        // Cinematic flash
        setFlashOut(true);
        setTimeout(() => {
          router.push("/");
        }, 600);
      } catch {
        setSelectingProfile(null);
      }
    },
    [selectProfile, router]
  );

  const handleSelectProfile = useCallback(
    (profile: Profile) => {
      // Check if PIN is enabled — show modal immediately (no API call first)
      if (profile.pinEnabled) {
        setPendingProfile(profile);
        setIsPinModalOpen(true);
        return;
      }

      // No PIN — select directly
      finalizeSelect(profile);
    },
    [finalizeSelect]
  );

  const handlePinSuccess = useCallback(async (verifiedPin: string) => {
    setIsPinModalOpen(false);
    if (pendingProfile) {
      await finalizeSelect(pendingProfile, verifiedPin);
    }
  }, [pendingProfile, finalizeSelect]);

  const handleEditProfile = useCallback(
    async (profileId: string, data: Partial<{ name: string; avatarId: string; isKids: boolean }>) => {
      await editProfile(profileId, data);
      await refetch();
    },
    [editProfile, refetch]
  );

  const handleDeleteProfile = useCallback(
    async (profileId: string) => {
      await deleteProfile(profileId);
      await refetch();
    },
    [deleteProfile, refetch]
  );

  // Edge case: 0 profiles → redirect to create
  useEffect(() => {
    if (!loading && profiles.length === 0 && !error) {
      router.replace("/profiles/create");
    }
  }, [loading, profiles.length, error, router]);

  // Auto-selection: 1 profile or default profile → redirect to home
  useEffect(() => {
    if (!loading && !error && profiles.length > 0) {
      // If only one profile, auto-select and redirect
      if (profiles.length === 1) {
        selectProfile(profiles[0]);
        return;
      }
      
      // If multiple profiles and default exists, auto-select and redirect
      const defaultProfile = profiles.find(p => p.isDefault);
      if (defaultProfile) {
        selectProfile(defaultProfile);
        return;
      }
    }
  }, [loading, error, profiles, selectProfile]);

  if (!loading && profiles.length === 0 && !error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* ── Cinematic Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0b0b0b] to-black" />
        
        {/* Animated ambient orbs */}
        <motion.div 
          className="absolute top-[15%] left-[20%] w-[700px] h-[700px] bg-[#E50914]/[0.04] rounded-full blur-[180px]"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-indigo-950/[0.06] rounded-full blur-[180px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Center glow behind profiles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(229,9,20,0.03), transparent)" }} />
        
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />
      </div>

      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        profileName={pendingProfile?.name || ""}
        profileId={pendingProfile?.profileId}
      />

      {/* ── Logo ── */}
      <motion.div 
        className="absolute top-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1
          className="text-3xl md:text-4xl font-black tracking-[0.15em] text-[#E50914] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          MOVIEFLIX
        </h1>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4">
        {/* Title + Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-[32px] md:text-[42px] font-bold text-white tracking-tight mb-3">
            Who&apos;s Watching?
          </h2>
          <p className="text-[14px] text-[#555] font-medium tracking-wide">
            Choose a profile to continue
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-[#E50914] animate-spin" />
            <p className="text-sm text-[#555]">Loading profiles…</p>
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-6 py-2 bg-[#E50914] text-white rounded-lg text-sm font-bold hover:bg-[#f40612] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Profile Grid */}
        {!loading && !error && profiles.length > 0 && (
          <>
            {managing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <ManageProfilesGrid
                  profiles={profiles}
                  onDeleteProfile={handleDeleteProfile}
                  onEditProfile={handleEditProfile}
                  onRefreshProfiles={refetch}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {profiles.map((profile, i) => (
                  <ProfileCard
                    key={profile.profileId}
                    profile={profile}
                    index={i}
                    onSelect={() => handleSelectProfile(profile)}
                  />
                ))}

                {/* Add Profile card */}
                {profiles.length < 5 && (
                  <ProfileCard
                    isAddCard
                    index={profiles.length}
                    onAdd={() => router.push("/profiles/create")}
                  />
                )}
              </motion.div>
            )}

            {/* Manage / Done button */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.45 }}
              onClick={() => setManaging(!managing)}
              className="mt-14 md:mt-16 px-10 py-3 border border-white/15 rounded-xl text-[11px] font-bold uppercase tracking-[3px] text-[#777] hover:text-white hover:border-white/40 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              {managing ? "Done" : "Manage Profiles"}
            </motion.button>
          </>
        )}
      </div>

      {/* ── Cinematic Selection Flash ── */}
      <AnimatePresence>
        {flashOut && selectingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          >
            {/* Radial glow behind selected avatar */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 3, opacity: 0.15 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute w-[200px] h-[200px] rounded-full bg-gradient-to-br ${
                AVATAR_MAP[selectingProfile.avatarId]?.gradient || "from-gray-800 to-gray-900"
              } blur-[80px]`}
            />
            
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-5 relative z-10"
            >
              <motion.div
                className={`w-[140px] h-[140px] rounded-full bg-gradient-to-br ${
                  AVATAR_MAP[selectingProfile.avatarId]?.gradient || "from-gray-800 to-gray-900"
                } flex items-center justify-center shadow-[0_0_60px_-10px_rgba(229,9,20,0.3)] ring-[3px] ring-[#E50914]/40`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-[64px] select-none" style={{ lineHeight: 1 }}>
                  {AVATAR_MAP[selectingProfile.avatarId]?.emoji || "👤"}
                </span>
              </motion.div>
              <motion.p 
                className="text-white text-xl font-bold tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {selectingProfile.name}
              </motion.p>

              {/* Loading spinner under name */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Loader2 className="w-5 h-5 text-[#E50914]/60 animate-spin" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
