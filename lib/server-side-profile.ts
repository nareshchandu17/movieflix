/**
 * @file server-side-profile.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { getActiveProfile } from './active-profile-manager';
import Profile from './models/Profile';
import connectDB from './db';
import { cookies } from 'next/headers';

export interface ServerSideProfileState {
  isAuthenticated: boolean;
  userId?: string;
  activeProfile?: {
    profileId: string;
    name: string;
    avatarId: string;
    isKids: boolean;
    isDefault: boolean;
    color: string;
    maturityRating: string;
  } | null;
  profiles?: Array<{
    profileId: string;
    name: string;
    avatarId: string;
    isKids: boolean;
    isDefault: boolean;
    color: string;
  }>;
  needsProfileSelection: boolean;
  loading: boolean;
}

export async function getServerSideProfileState(): Promise<ServerSideProfileState> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        isAuthenticated: false,
        needsProfileSelection: false,
        loading: false
      };
    }

    await connectDB();
    
    // Get active profile ID from cookie (session-based)
    const cookieStore = await cookies();
    const activeProfileId = cookieStore.get('mf_active_profile')?.value;
    
    // Get active profile details using the ID from session
    const activeProfile = await getActiveProfile(session.user.id, activeProfileId);
    
    // Get all profiles for this user
    const allProfiles = await Profile.find({ 
      userId: session.user.id 
    }).select('profileId name avatarId isKids isDefault color maturityRating').lean();

    const serializedProfiles = allProfiles.map(p => ({
      profileId: p.profileId,
      name: p.name,
      avatarId: p.avatarId,
      isKids: p.isKids,
      isDefault: p.isDefault,
      color: p.color,
      maturityRating: p.maturityRating
    }));

    const serializedActiveProfile = activeProfile ? {
      profileId: activeProfile.profileId,
      name: activeProfile.name,
      avatarId: activeProfile.avatarId,
      isKids: activeProfile.isKids,
      isDefault: activeProfile.isDefault,
      color: activeProfile.color,
      maturityRating: activeProfile.maturityRating
    } : null;

    // Determine if profile selection is needed
    const needsProfileSelection = !activeProfile && allProfiles.length > 0;

    return {
      isAuthenticated: true,
      userId: session.user.id,
      activeProfile: serializedActiveProfile,
      profiles: serializedProfiles,
      needsProfileSelection,
      loading: false
    };
    
  } catch (error) {
    console.error('Error in getServerSideProfileState:', error);
    return {
      isAuthenticated: false,
      needsProfileSelection: false,
      loading: false
    };
  }
}
