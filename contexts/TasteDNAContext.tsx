"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TasteDNAContextType {
  isTasteDNAOpen: boolean;
  openTasteDNA: () => void;
  closeTasteDNA: () => void;
}

const TasteDNAContext = createContext<TasteDNAContextType | undefined>(undefined);

export const useTasteDNA = () => {
  const context = useContext(TasteDNAContext);
  if (!context) {
    throw new Error("useTasteDNA must be used within a TasteDNAProvider");
  }
  return context;
};

interface TasteDNAProviderProps {
  children: ReactNode;
}

export const TasteDNAProvider: React.FC<TasteDNAProviderProps> = ({ children }) => {
  const [isTasteDNAOpen, setIsTasteDNAOpen] = useState(false);

  const openTasteDNA = () => setIsTasteDNAOpen(true);
  const closeTasteDNA = () => setIsTasteDNAOpen(false);

  return (
    <TasteDNAContext.Provider value={{ isTasteDNAOpen, openTasteDNA, closeTasteDNA }}>
      {children}
    </TasteDNAContext.Provider>
  );
};
