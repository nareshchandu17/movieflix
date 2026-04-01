"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface UserPreferences {
  watchlist: number[];
}

interface ProfileContextType {
  userPreferences: UserPreferences;
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  updateEpisodeProgress: (seriesId: number, season: number, episode: number, progress: number) => void;
  getEpisodeProgress: (seriesId: number, season: number, episode: number) => number;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    watchlist: [],
  });

  const [episodeProgress, setEpisodeProgress] = useState<Record<string, number>>({});

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

  const updateEpisodeProgress = useCallback((seriesId: number, season: number, episode: number, progress: number) => {
    const key = `${seriesId}-${season}-${episode}`;
    setEpisodeProgress(prev => ({
      ...prev,
      [key]: progress
    }));
  }, []);

  const getEpisodeProgress = useCallback((seriesId: number, season: number, episode: number) => {
    const key = `${seriesId}-${season}-${episode}`;
    return episodeProgress[key] || 0;
  }, [episodeProgress]);

  return (
    <ProfileContext.Provider value={{
      userPreferences,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      updateEpisodeProgress,
      getEpisodeProgress
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

// Add alias for backward compatibility
export const useProfile = useProfileContext;

export default ProfileContext;
