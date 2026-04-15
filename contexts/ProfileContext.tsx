"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';
import type { Profile, CreateProfilePayload } from '@/types/profiles';
import { toast } from 'sonner';
import { useProfileLoading } from './ProfileLoadingContext';

interface UserPreferences {
  watchlist: number[];
}

interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  isPinProtected: boolean;
  loading: boolean;
  error: string | null;
  userPreferences: UserPreferences;
  
  // Actions
  fetchProfiles: () => Promise<void>;
  selectProfile: (profile: Profile) => Promise<void>;
  createProfile: (payload: CreateProfilePayload) => Promise<Profile | null>;
  editProfile: (profileId: string, data: Partial<CreateProfilePayload>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  switchProfile: () => Promise<void>;
  
  // Analytics
  getProfileAnalytics: (profileId: string) => Promise<any>;
  updateProfileAnalytics: (profileId: string, data: any) => Promise<void>;
  
  // Parental Controls
  getParentalSettings: () => Promise<any>;
  updateParentalSettings: (settings: any) => Promise<void>;
  verifyPin: (pin: string) => Promise<{ valid: boolean; message: string }>;
  
  // Content Filtering
  getContentFilter: () => Promise<any>;
  isContentAllowed: (content: any) => Promise<{ allowed: boolean; reasons: string[] }>;
  
  // Utility
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isPinProtected, setIsPinProtected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { blockUI, unblockUI } = useProfileLoading();
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    watchlist: [],
  });

  const fetchProfiles = useCallback(async () => {
    // Block UI to prevent race condition and flicker
    blockUI();
    setLoading(true);
    setError(null);
    
    try {
      // Fetch profiles and active profile in parallel
      const [profilesRes, activeRes] = await Promise.all([
        fetch("/api/profiles"),
        fetch("/api/profiles/active")
      ]);

      if (!profilesRes.ok) {
        setError(profilesRes.status === 401 ? null : "Failed to load profiles");
        return;
      }

      const profilesData = await profilesRes.json();
      const activeData = activeRes.ok ? await activeRes.json() : { success: false };

      if (profilesData.success) {
        setProfiles(profilesData.data);
        setIsPinProtected(!!profilesData.isPinProtected);
        
        // Netflix-level approach: Backend first, Cookie fallback + Session Sync
        let activeProfileFound = null;

        // 1. Try backend active profile (source of truth)
        if (activeData.success && activeData.activeProfile) {
          activeProfileFound = profilesData.data.find((p: Profile) => p.profileId === activeData.activeProfile.profileId);
        }

        // 2. Try last used profile for session sync
        if (!activeProfileFound) {
          const lastUsedRes = await fetch("/api/profiles/last-used");
          const lastUsedData = lastUsedRes.ok ? await lastUsedRes.json() : { success: false };
          if (lastUsedData.success && lastUsedData.lastUsedProfile) {
            activeProfileFound = profilesData.data.find((p: Profile) => p.profileId === lastUsedData.lastUsedProfile.profileId);
            // If found, set it as active profile
            if (activeProfileFound) {
              await selectProfile(activeProfileFound);
            }
          }
        }

        // 3. Fallback to cookie (migration scenario)
        if (!activeProfileFound) {
          const activeId = Cookies.get('mf_active_profile');
          if (activeId) {
            activeProfileFound = profilesData.data.find((p: Profile) => p.profileId === activeId);
          }
        }

        setActiveProfile(activeProfileFound || null);
      } else {
        setError(profilesData.error || "Failed to load profiles");
      }
    } catch {
      setError("Couldn't connect to profile service.");
    } finally {
      setLoading(false);
      // Unblock UI only after everything is ready
      unblockUI();
    }
  }, [blockUI, unblockUI]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const selectProfile = useCallback(async (profile: Profile) => {
    try {
      const res = await fetch("/api/profiles/select", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.profileId }),
      });
      if (!res.ok) throw new Error(res.status === 401 ? "Please sign in" : "Failed to select profile");
      const data = await res.json();
      if (data.success) {
        setActiveProfile(profile);
        // Cookie is automatically set by API (backend-first approach)
      } else {
        throw new Error(data.error || "Failed to select profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to select profile");
      throw err;
    }
  }, []);

  // Auto-selection logic (Netflix-level UX)
  useEffect(() => {
    const autoSelectProfile = async () => {
      if (profiles.length > 0 && !activeProfile && !loading) {
        // If only one profile, auto-select it
        if (profiles.length === 1) {
          await selectProfile(profiles[0]);
        } 
        // If multiple profiles, look for default
        else {
          const defaultProfile = profiles.find((p: Profile) => p.isDefault);
          if (defaultProfile) {
            await selectProfile(defaultProfile);
          }
        }
      }
    };

    autoSelectProfile();
  }, [profiles, activeProfile, loading, selectProfile]);

  const createProfile = useCallback(async (payload: CreateProfilePayload) => {
    try {
      const res = await fetch("/api/profiles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(prev => [...prev, data.data]);
        return data.data;
      } else {
        toast.error(data.error || "Failed to create profile");
        return null;
      }
    } catch {
      toast.error("Network error creating profile");
      return null;
    }
  }, []);

  const editProfile = useCallback(async (profileId: string, data: Partial<CreateProfilePayload>) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setProfiles(prev => prev.map(p => p.profileId === profileId ? { ...p, ...result.data } : p));
        if (activeProfile?.profileId === profileId) {
          setActiveProfile(prev => prev ? { ...prev, ...result.data } : null);
        }
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  }, [activeProfile]);

  const deleteProfile = useCallback(async (profileId: string) => {
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setProfiles(prev => prev.filter(p => p.profileId !== profileId));
        if (activeProfile?.profileId === profileId) {
          // Clear from backend (source of truth)
          await fetch("/api/profiles/active", { method: "DELETE" });
          setActiveProfile(null);
          // Cookie is automatically cleared by the API
        }
      }
    } catch {
      toast.error("Failed to delete profile");
    }
  }, [activeProfile]);

  const switchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles/switch", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setActiveProfile(null);
        // Redirect to profile selection page
        window.location.href = "/profiles/select";
      } else {
        throw new Error(result.error || "Failed to switch profile");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to switch profile");
      throw err;
    }
  }, []);

  // Watchlist logic (stubbed for now, should ideally be profile-specific in DB)
  const addToWatchlist = useCallback((id: number) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: [...new Set([...prev.watchlist, id])]
    }));
  }, []);

  const removeFromWatchlist = useCallback((id: number) => {
    setUserPreferences(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter(item => item !== id)
    }));
  }, []);

  const isInWatchlist = useCallback((id: number) => {
    return userPreferences.watchlist.includes(id);
  }, [userPreferences.watchlist]);

  // Analytics functions
  const getProfileAnalytics = useCallback(async (profileId: string) => {
    try {
      const response = await fetch(`/api/profiles/analytics/${profileId}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to fetch profile analytics:', error);
      return null;
    }
  }, []);

  const updateProfileAnalytics = useCallback(async (profileId: string, data: any) => {
    try {
      const response = await fetch(`/api/profiles/analytics/${profileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update analytics');
      }
    } catch (error) {
      console.error('Failed to update profile analytics:', error);
      throw error;
    }
  }, []);

  // Parental controls functions
  const getParentalSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/profiles/settings');
      const data = await response.json();
      return data.success ? data.data.parentalControls : null;
    } catch (error) {
      console.error('Failed to fetch parental settings:', error);
      return null;
    }
  }, []);

  const updateParentalSettings = useCallback(async (settings: any) => {
    try {
      const response = await fetch('/api/profiles/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'parentalControls',
          data: settings
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update parental settings');
      }
      return result.data;
    } catch (error) {
      console.error('Failed to update parental settings:', error);
      throw error;
    }
  }, []);

  const verifyPin = useCallback(async (pin: string) => {
    try {
      const response = await fetch('/api/profiles/settings/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const result = await response.json();
      return {
        valid: result.valid || false,
        message: result.message || 'Verification failed'
      };
    } catch (error) {
      console.error('Failed to verify PIN:', error);
      return { valid: false, message: 'Verification failed' };
    }
  }, []);

  // Content filtering functions
  const getContentFilter = useCallback(async () => {
    if (!activeProfile) return null;
    
    try {
      const response = await fetch('/api/profiles/settings');
      const data = await response.json();
      if (data.success && data.data.parentalControls) {
        return {
          enabled: data.data.parentalControls.enabled,
          maturityRating: data.data.parentalControls.maturityRating,
          isKids: activeProfile.isKids
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get content filter:', error);
      return null;
    }
  }, [activeProfile]);

  const isContentAllowed = useCallback(async (content: any) => {
    if (!activeProfile) return { allowed: true, reasons: [] };
    
    try {
      const response = await fetch('/api/profiles/settings');
      const data = await response.json();
      if (data.success && data.data.parentalControls?.enabled) {
        // Simple check - in production, use the contentFilter utility
        const isAdultContent = content.adult || 
          (content.vote_average && content.vote_average > 7.0);
        
        const maxRating = data.data.parentalControls.maturityRating;
        const ratingMap = { 'ALL': 5, 'G': 4, 'PG': 3, 'PG-13': 2, 'R': 1, 'TV-MA': 0 };
        
        if (activeProfile.isKids) {
          return { allowed: false, reasons: ['Kids profile has content restrictions'] };
        }
        
        if (isAdultContent && ratingMap[maxRating] < 2) {
          return { allowed: false, reasons: ['Content exceeds maturity rating limit'] };
        }
      }
      
      return { allowed: true, reasons: [] };
    } catch (error) {
      console.error('Failed to check content allowance:', error);
      return { allowed: true, reasons: [] };
    }
  }, [activeProfile]);

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      isPinProtected,
      loading,
      error,
      userPreferences,
      fetchProfiles,
      selectProfile,
      createProfile,
      editProfile,
      deleteProfile,
      switchProfile,
      getProfileAnalytics,
      updateProfileAnalytics,
      getParentalSettings,
      updateParentalSettings,
      verifyPin,
      getContentFilter,
      isContentAllowed,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

export const useProfile = useProfileContext;
export default ProfileContext;
