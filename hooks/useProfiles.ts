"use client";

import { useProfileContext } from "@/contexts/ProfileContext";
import type { Profile, CreateProfilePayload } from "@/types/profiles";

interface UseProfilesReturn {
  profiles: Profile[];
  activeProfile: Profile | null;
  isPinProtected: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectProfile: (profile: Profile) => Promise<void>;
  createProfile: (payload: CreateProfilePayload) => Promise<Profile | null>;
  editProfile: (profileId: string, data: Partial<CreateProfilePayload>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
}

export function useProfiles(): UseProfilesReturn {
  const {
    profiles,
    activeProfile,
    isPinProtected,
    loading,
    error,
    fetchProfiles,
    selectProfile,
    createProfile,
    editProfile,
    deleteProfile,
  } = useProfileContext();

  return {
    profiles,
    activeProfile,
    isPinProtected,
    loading,
    error,
    refetch: fetchProfiles,
    selectProfile,
    createProfile,
    editProfile,
    deleteProfile,
  };
}

