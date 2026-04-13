"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ProfileLoadingContextType {
  isLoading: boolean;
  isReady: boolean;
  setIsLoading: (loading: boolean) => void;
  blockUI: () => void;
  unblockUI: () => void;
}

const ProfileLoadingContext = createContext<ProfileLoadingContextType | undefined>(undefined);

export const ProfileLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const blockUI = useCallback(() => {
    setIsLoading(true);
    setIsReady(false);
  }, []);

  const unblockUI = useCallback(() => {
    setIsLoading(false);
    setIsReady(true);
  }, []);

  return (
    <ProfileLoadingContext.Provider value={{
      isLoading,
      isReady,
      setIsLoading,
      blockUI,
      unblockUI
    }}>
      {children}
    </ProfileLoadingContext.Provider>
  );
};

export const useProfileLoading = () => {
  const context = useContext(ProfileLoadingContext);
  if (context === undefined) {
    throw new Error('useProfileLoading must be used within a ProfileLoadingProvider');
  }
  return context;
};
