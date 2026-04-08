"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import AvatarCarousel from "@/components/profiles/AvatarCarousel";
import ProfileNameInput from "@/components/profiles/ProfileNameInput";
import KidsToggle from "@/components/profiles/KidsToggle";
import { AVATAR_MAP } from "@/lib/avatars";
import { useProfiles } from "@/hooks/useProfiles";

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
      await selectProfile(profile);
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
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <h1
          className="text-3xl font-black tracking-wider text-[#E50914] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          MOVIEFLIX
        </h1>
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
          className="w-full max-w-2xl bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            
            {/* Avatar Selector Box */}
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => setShowAvatars(prev => !prev)}
                className="relative cursor-pointer group"
              >
                <div className={`w-[140px] h-[140px] rounded-full bg-gradient-to-br ${selectedAvatar?.gradient || "from-gray-800 to-gray-900"} flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-105 ring-4 ring-transparent group-hover:ring-white/20`}>
                  <span className="text-[64px] select-none pointer-events-none" style={{ lineHeight: 1 }}>
                    {selectedAvatar?.emoji || "👤"}
                  </span>
                </div>
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-bold tracking-wide">EDIT</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAvatars(prev => !prev)}
                className="text-xs text-[#8a8a8a] hover:text-white uppercase tracking-widest font-semibold transition-colors"
                type="button"
              >
                Change Avatar
              </button>
            </div>

            {/* Inputs Container */}
            <div className="flex-1 w-full flex flex-col gap-6 pt-2">
              <ProfileNameInput
                value={name}
                onChange={(v) => {
                  setName(v);
                  if (error) setError(null);
                }}
                error={error}
              />
              
              <div className="w-full pt-2">
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
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push("/profiles/select")}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-transparent text-white font-semibold text-sm hover:bg-white/10 transition-all border border-[#555] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!canSubmit}
              className={`
                w-full sm:w-auto min-w-[140px] px-8 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer
                flex items-center justify-center gap-2
                ${success
                  ? "bg-emerald-600 text-white"
                  : canSubmit
                    ? "bg-[#E50914] text-white hover:bg-[#f40612] shadow-lg shadow-red-600/20"
                    : "bg-[#2a2a2a] text-[#555] cursor-not-allowed"
                }
              `}
            >
              {success ? (
                <>
                  <Check className="w-5 h-5" />
                  Created!
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
