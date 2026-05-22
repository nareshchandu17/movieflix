/**
 * @file useProfiles.ts
 * @description Custom React state hook for managing reactive client-side workflows and events.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

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

