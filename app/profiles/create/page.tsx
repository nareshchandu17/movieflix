"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronLeft, Pencil } from "lucide-react";
import AvatarCarousel from "@/features/profile/components/profiles/AvatarCarousel";
import ProfileNameInput from "@/features/profile/components/profiles/ProfileNameInput";
import KidsToggle from "@/features/profile/components/profiles/KidsToggle";
import { AVATAR_MAP } from "@/features/profile/utils/avatars";
import { useProfiles } from "@/features/profile/hooks/useProfiles";

export default function CreateProfilePage() {
  const router = useRouter();
  const { createProfile, selectProfile } = useProfiles();

  const [avatarId, setAvatarId] = useState<string>("hero"); // Default to hero so it's not blocked
  const [name, setName] = useState("");
  const [isKids, setIsKids] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);

  const canSubmit = avatarId !== null && name.trim().length >= 2 && !isSubmitting;

  const handleCreate = async () => {
    if (!canSubmit || !avatarId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const profile = await createProfile({
        name: name.trim(),
        avatarId,
        isKids,
        color: "#E50914",
      });

      setSuccess(true);

      // Auto-select the new profile and redirect
      if (profile) {
        await selectProfile(profile);
      }
      setTimeout(() => {
        router.push("/profiles/select");
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create profile";
      setError(message);
      setIsSubmitting(false);
    }
  };

  const selectedAvatar = AVATAR_MAP[avatarId];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#111] text-white flex flex-col font-sans"
    >
      {/* Header with Back Button and Centered Logo */}
      <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-50">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8a8a8a] hover:text-white transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Back</span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1
            className="text-[34px] md:text-[44px] font-black tracking-[0.2em] text-[#E50914] select-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            MOVIEFLIX
          </h1>
        </div>
        
        <div className="w-12" /> {/* Spacer for symmetry */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pt-20 pb-12">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[40px] md:text-[52px] font-medium mb-1 tracking-tight text-center"
        >
          Add Profile
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-[#8a8a8a] text-sm md:text-base mb-10 text-center"
        >
          Add a profile for another person watching Movieflix.
        </motion.p>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group/container"
        >
          {/* Subtle Ambient Red Glow on container focus */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-transparent opacity-0 group-hover/container:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-20 relative z-10">
            
            {/* Avatar Selector Section */}
            <div className="flex flex-col items-center gap-6">
              <div 
                onClick={() => setShowAvatars(prev => !prev)}
                className="relative cursor-pointer group/avatar"
              >
                <div className={`w-[160px] h-[160px] md:w-[180px] md:h-[180px] rounded-full bg-gradient-to-br ${selectedAvatar?.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center shadow-2xl transition-all duration-500 group-hover/avatar:scale-[1.02] ring-1 ring-white/10 group-hover/avatar:ring-[#E50914]/50 overflow-hidden`}>
                  <span className="text-[80px] md:text-[90px] select-none pointer-events-none z-10" style={{ lineHeight: 1 }}>
                    {selectedAvatar?.emoji || "👤"}
                  </span>
                  
                  {/* Subtle inner shadow reflection */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              <button 
                onClick={() => setShowAvatars(prev => !prev)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white font-bold uppercase tracking-[2px] hover:bg-white/10 hover:border-[#E50914]/40 hover:text-white transition-all duration-300 shadow-lg group/btn"
                type="button"
              >
                <Pencil className="w-3 h-3 text-[#E50914] group-hover/btn:scale-110 transition-transform" />
                Change Avatar
              </button>
            </div>

            {/* Inputs Container */}
            <div className="flex-1 w-full flex flex-col gap-10 pt-2">
              <ProfileNameInput
                value={name}
                onChange={(v) => {
                  setName(v);
                  if (error) setError(null);
                }}
                error={error}
              />
              
              <div className="w-full">
                <KidsToggle enabled={isKids} onChange={setIsKids} />
              </div>
            </div>
          </div>

          {/* Inline Avatar Carousel Expandable */}
          <AnimatePresence>
            {showAvatars && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 32 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden border-t border-white/10 pt-6"
              >
                <p className="text-sm font-bold text-white mb-4 pl-2">Choose an Avatar</p>
                <div className="bg-[#0a0a0a] rounded-xl overflow-hidden py-2">
                   <AvatarCarousel selected={avatarId} onSelect={setAvatarId} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-12 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              type="button"
              onClick={() => router.push("/profiles/select")}
              className="w-full sm:w-[160px] py-3 rounded-md bg-transparent text-[#777] font-bold text-[13px] uppercase tracking-[2px] transition-all border border-[#333] hover:border-white hover:text-white cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canSubmit}
              className={`
                w-full sm:w-[180px] py-3 rounded-md font-bold text-[13px] uppercase tracking-[2px] transition-all cursor-pointer active:scale-95
                flex items-center justify-center gap-2
                ${success
                  ? "bg-emerald-600 text-white"
                  : canSubmit
                    ? "bg-[#E50914] text-white hover:bg-[#f40612] shadow-[0_0_20px_rgba(229,9,20,0.3)]"
                    : "bg-[#222] text-[#444] cursor-not-allowed border border-white/5"
                }
              `}
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" />
                  Created
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </motion.div>
      </main>
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
    </motion.div>
  );
}
