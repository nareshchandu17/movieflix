/**
 * @file active-profile-manager.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import connectDB from '@/lib/db';
import User from '@/features/authentication/models/User';
import Profile from '@/features/profile/models/Profile';

export async function setActiveProfile(userId: string, profileId: string) {
  try {
    await connectDB();
    
    // Validate that the profile belongs to the user
    const profile = await Profile.findOne({ 
      profileId: profileId,
      userId: userId 
    });
    
    if (!profile) {
      throw new Error('Profile not found or does not belong to user');
    }
    
    // Update only the last used profile in database for cross-device memory
    // activeProfile is now strictly session-based (cookies)
    await User.findByIdAndUpdate(
      userId,
      { 
        lastUsedProfile: profileId
      },
      { returnDocument: 'after' }
    );
    
    return profile;
  } catch (error) {
    console.error('Error setting active profile:', error);
    throw error;
  }
}

export async function getActiveProfile(userId: string, requestedProfileId?: string) {
  try {
    await connectDB();
    
    // If we have a requested profile ID (from session/cookie), use it
    // Otherwise, session is considered inactive for profile-based content
    if (!requestedProfileId) {
      return null;
    }
    
    // Validate the profile still exists and belongs to user
    const profile = await Profile.findOne({ 
      profileId: requestedProfileId,
      userId: userId 
    }).lean();
    
    return profile;
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
}

export async function getLastUsedProfile(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('lastUsedProfile').lean();
    if (!user || !user.lastUsedProfile) {
      return null;
    }
    
    // Validate the profile still exists and belongs to user
    const profile = await Profile.findOne({ 
      profileId: user.lastUsedProfile,
      userId: userId 
    }).lean();
    
    // If profile doesn't exist anymore, clear the last used profile
    if (!profile) {
      await User.findByIdAndUpdate(userId, { lastUsedProfile: null });
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error getting last used profile:', error);
    return null;
  }
}

export async function clearActiveProfile(userId: string) {
  try {
    // With session-based profiles, clearing active profile is handled by 
    // removing the session cookie in the API route.
    // We can also clear the lastUsedProfile if we want a completely clean slate.
    await connectDB();
    await User.findByIdAndUpdate(userId, { lastUsedProfile: null });
  } catch (error) {
    console.error('Error clearing profile context:', error);
    throw error;
  }
}

