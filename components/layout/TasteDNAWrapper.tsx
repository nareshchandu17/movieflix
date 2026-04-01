"use client";

import { useTasteDNA } from "@/contexts/TasteDNAContext";
import TasteDNA from "@/components/profile/TasteDNA";

export default function TasteDNAWrapper() {
  const { isTasteDNAOpen, closeTasteDNA } = useTasteDNA();
  
  return (
    <TasteDNA 
      isOpen={isTasteDNAOpen} 
      onClose={closeTasteDNA} 
    />
  );
}
