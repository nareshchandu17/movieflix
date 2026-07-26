/**
 * @file profile-validation.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import connectDB from '@/lib/db';
import Profile from '@/features/profile/models/Profile';

export async function getProfile(profileId: string, userId: string) {
  try {
    await connectDB();
    
    const profile = await Profile.findOne({ 
      profileId: profileId,
      userId: userId 
    }).lean();
    
    return profile;
  } catch (error) {
    console.error('Error validating profile:', error);
    return null;
  }
}

