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
    async (profile: Profile) => {
      setSelectingProfile(profile);

      try {
        await selectProfile(profile);

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
    async (profile: Profile) => {
      // If PIN is enabled and it's an ADULT profile, show PIN modal
      if (isPinProtected && !profile.isKids) {
        setPendingProfile(profile);
        setIsPinModalOpen(true);
        return;
      }
      
      // Otherwise proceed normally
      await finalizeSelect(profile);
    },
    [isPinProtected, finalizeSelect]
  );

  const handlePinSuccess = useCallback(async () => {
    setIsPinModalOpen(false);
    if (pendingProfile) {
      await finalizeSelect(pendingProfile);
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

  if (!loading && profiles.length === 0 && !error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-950/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <PinModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        profileName={pendingProfile?.name || ""}
      />

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <h1
          className="text-3xl font-black tracking-wider text-[#E50914] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          MOVIEFLIX
        </h1>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[28px] md:text-[36px] font-medium text-white mb-10 md:mb-14"
        >
          Who&apos;s Watching?
        </motion.h2>

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
                />
              </motion.div>
            ) : (
              <div className="flex flex-wrap justify-center gap-8 md:gap-10">
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
              </div>
            )}

            {/* Manage / Done button */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
              onClick={() => setManaging(!managing)}
              className="mt-12 px-8 py-2.5 border border-[#555] rounded-md text-xs font-bold uppercase tracking-[3px] text-[#aaa] hover:text-white hover:border-white transition-all cursor-pointer"
            >
              {managing ? "Done" : "Manage Profiles"}
            </motion.button>
          </>
        )}
      </div>

      {/* Cinematic Selection Flash */}
      <AnimatePresence>
        {flashOut && selectingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className={`w-[120px] h-[120px] rounded-full bg-gradient-to-br ${
                  AVATAR_MAP[selectingProfile.avatarId]?.gradient || "from-gray-800 to-gray-900"
                } flex items-center justify-center shadow-2xl`}
              >
                <span className="text-[52px] select-none" style={{ lineHeight: 1 }}>
                  {AVATAR_MAP[selectingProfile.avatarId]?.emoji || "👤"}
                </span>
              </div>
              <p className="text-white text-xl font-semibold">
                {selectingProfile.name}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
