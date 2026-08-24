"use client";

import { useProfileLoading } from '@/features/profile/components/ProfileLoadingContext';
import { useProfile } from '@/features/profile/components/ProfileContext';
import PinModal from './profiles/PinModal';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

export default function ProfileLoadingBlocker() {
  const { isLoading, isReady } = useProfileLoading();
  const { activeProfile, selectProfile } = useProfile();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Determine if the profile is PIN protected but not verified in this session
  // We check our mf_verified cookie via the session (if we stored it there)
  // Or handle it purely via the active profile + session state
  const isLocked = useMemo(() => {
    if (!activeProfile?.pin) return false;
    
    // If the profile has a pin, check if it's in the verified list for this session
    const verifiedProfiles = (session?.user as any)?.verifiedProfiles || [];
    return !verifiedProfiles.includes(activeProfile.profileId);
  }, [activeProfile, session]);

  // Determine if we should show the full screen blocking UI
  // Only block the UI completely if we are on the root page (before entering)
  // or if we are explicitly on a profile selection page.
  const shouldBlockFullUI = pathname === '/' || pathname?.startsWith('/profiles');

  // Show loading screen while profiles are loading
  if (isLoading || status === "loading") {
    if (!shouldBlockFullUI) {
      // Don't render full screen block on regular app pages, let skeletons handle it
      return null;
    }
    
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">Loading profiles...</p>
        </div>
      </div>
    );
  }

  // If the profile is locked (requires PIN and not verified), show PIN Modal OVER the content
  // We don't return null if isLocked is true even if isReady is true
  if (isLocked && activeProfile) {
    return (
      <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center">
        <PinModal 
          isOpen={true}
          onClose={() => {}} // Cannot close until verified
          onSuccess={async () => {
             // Re-fetch profiles or refresh session to clear the lock
             window.location.reload(); 
          }}
          profileName={activeProfile.name}
          profileId={activeProfile.profileId}
        />
      </div>
    );
  }

  // Show nothing when ready (allow normal content)
  if (isReady) {
    return null;
  }

  if (shouldBlockFullUI) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return null;
}
