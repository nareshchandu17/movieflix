"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";
import ProfileNameInput from "./ProfileNameInput";
import AvatarCarousel from "./AvatarCarousel";
import KidsToggle from "./KidsToggle";
import PinSettings from "./PinSettings";
import { AVATAR_MAP } from "@/lib/avatars";
import type { Profile } from "@/types/profiles";
import { Loader2 } from "lucide-react";

interface ManageProfilesGridProps {
  profiles: Profile[];
  onDeleteProfile: (profileId: string) => Promise<void>;
  onEditProfile: (profileId: string, data: Partial<{ name: string; avatarId: string; isKids: boolean }>) => Promise<void>;
  onRefreshProfiles?: () => Promise<void>;
}

export default function ManageProfilesGrid({
  profiles,
  onDeleteProfile,
  onEditProfile,
  onRefreshProfiles,
}: ManageProfilesGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [editKids, setEditKids] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = (profile: Profile) => {
    setEditingId(profile.profileId);
    setEditName(profile.name);
    setEditAvatar(profile.avatarId);
    setEditKids(profile.isKids);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editAvatar) return;
    if (editName.trim().length < 2) {
      setEditError("Name must be at least 2 characters");
      return;
    }
    setSaving(true);
    setEditError(null);
    try {
      await onEditProfile(editingId, {
        name: editName.trim(),
        avatarId: editAvatar,
        isKids: editKids,
      });
      setEditingId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      setEditError(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (profileId: string) => {
    setDeleting(true);
    try {
      await onDeleteProfile(profileId);
      setDeleteConfirmId(null);
    } catch {
      // Error handled in parent
    } finally {
      setDeleting(false);
    }
  };

  const editingProfile = profiles.find((p) => p.profileId === editingId);

  return (
    <div className="w-full">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                {AVATAR_MAP[profiles.find((p) => p.profileId === deleteConfirmId)?.avatarId || ""]?.emoji || "👤"}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Delete {profiles.find((p) => p.profileId === deleteConfirmId)?.name}?
              </h3>
              <p className="text-sm text-[#8a8a8a] mb-6">This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(deleteConfirmId)}
                  disabled={deleting}
                  className="py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inline Edit Panel */}
      <AnimatePresence>
        {editingId && editingProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="w-full max-w-2xl mx-auto mb-10 bg-[#141414] border border-white/10 rounded-2xl p-6 overflow-hidden"
          >
            <h3 className="text-lg font-bold text-white mb-6 text-center">
              Edit Profile
            </h3>

            <AvatarCarousel selected={editAvatar} onSelect={setEditAvatar} />

            <div className="mt-6 flex flex-col items-center gap-5">
              <ProfileNameInput
                value={editName}
                onChange={setEditName}
                error={editError}
              />
              <div className="w-full max-w-[320px]">
                <KidsToggle enabled={editKids} onChange={setEditKids} />
              </div>

              {/* PIN Settings */}
              {!editKids && (
                <div className="w-full max-w-[320px]">
                  <PinSettings
                    profileId={editingProfile.profileId}
                    profileName={editName || editingProfile.name}
                    pinEnabled={!!editingProfile.pinEnabled}
                    onPinChanged={() => onRefreshProfiles?.()}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-8 py-2.5 border border-[#555] text-white rounded-lg font-semibold hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving || editName.trim().length < 2}
                className="px-8 py-2.5 bg-[#E50914] text-white rounded-lg font-semibold hover:bg-[#f40612] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Cards Grid */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-10">
        <AnimatePresence mode="popLayout">
          {profiles.map((profile, i) => (
            <ProfileCard
              key={profile.profileId}
              profile={profile}
              managing={true}
              index={i}
              isLastProfile={profiles.length <= 1}
              onEdit={() => startEdit(profile)}
              onDelete={() => setDeleteConfirmId(profile.profileId)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
