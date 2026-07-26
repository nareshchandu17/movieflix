/**
 * @file profileMiddleware.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/authentication/services/auth';
import connectDB from '@/lib/db';
import Profile, { IProfile } from '@/features/profile/models/Profile';
import AccountSettings from '@/features/authentication/models/AccountSettings';
import { createDefaultFilter, filterContentArray } from './contentFilter';

export interface ProfileFilterResult {
  filtered: any[];
  blocked: any[];
  profile?: IProfile | null;
  filter?: any;
}

/**
 * Middleware to apply profile-based content filtering
 */
export async function applyProfileFilter(
  request: NextRequest,
  content: any[]
): Promise<ProfileFilterResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { filtered: content, blocked: [] };
    }

    await connectDB();

    // Get active profile from cookie or default
    const activeProfileId = request.cookies.get('mf_active_profile')?.value;
    let activeProfile: IProfile | null = null;

    if (activeProfileId) {
      activeProfile = await Profile.findOne({ 
        userId: session.user.id, 
        profileId: activeProfileId 
      });
    }

    if (!activeProfile) {
      // Get default profile
      activeProfile = await Profile.findOne({ 
        userId: session.user.id, 
        isDefault: true 
      });
    }

    if (!activeProfile) {
      return { filtered: content, blocked: [] };
    }

    // Get account settings for parental controls
    const accountSettings = await AccountSettings.findOne({ 
      userId: session.user.id 
    });

    // Create content filter based on profile
    const contentFilter = createDefaultFilter({
      isKids: activeProfile.isKids,
      maturityRating: activeProfile.maturityRating,
      parentalControls: accountSettings?.parentalControls
    });

    // Apply filter to content
    const { filtered, blocked } = filterContentArray(content as any, contentFilter);

    return {
      filtered,
      blocked,
      profile: activeProfile,
      filter: contentFilter
    };

  } catch (error) {
    console.error('Profile filter error:', error);
    return { filtered: content, blocked: [] };
  }
}

/**
 * Check if content is accessible for current profile
 */
export async function checkContentAccess(
  request: NextRequest,
  contentId: string | number,
  contentType: 'movie' | 'series'
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { allowed: true, reasons: [] };
    }

    await connectDB();

    // Get active profile
    const activeProfileId = request.cookies.get('mf_active_profile')?.value;
    let activeProfile: IProfile | null = null;

    if (activeProfileId) {
      activeProfile = await Profile.findOne({ 
        userId: session.user.id, 
        profileId: activeProfileId 
      });
    }

    if (!activeProfile) {
      activeProfile = await Profile.findOne({ 
        userId: session.user.id, 
        isDefault: true 
      });
    }

    if (!activeProfile) {
      return { allowed: true, reasons: [] };
    }

    // Get account settings
    const accountSettings = await AccountSettings.findOne({ 
      userId: session.user.id 
    });

    // Create content filter
    const contentFilter = createDefaultFilter({
      isKids: activeProfile.isKids,
      maturityRating: activeProfile.maturityRating,
      parentalControls: accountSettings?.parentalControls
    });

    // For detailed content check, we'd need to fetch full content details
    // This is a simplified check - in production, you'd fetch from TMDB
    return { 
      allowed: true, 
      reasons: [],
      requiresPin: accountSettings?.parentalControls?.enabled && !activeProfile.isKids
    };

  } catch (error) {
    console.error('Content access check error:', error);
    return { allowed: true, reasons: [] };
  }
}

/**
 * API wrapper for filtering content
 */
export function withProfileFilter(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Apply profile filter to the response
    const result = await handler(request, ...args);
    
    // If the result contains content that should be filtered
    if (result.data && Array.isArray(result.data)) {
      const filtered = await applyProfileFilter(request, result.data);
      result.data = filtered.filtered;
      
      // Add metadata about filtering
      result.meta = {
        ...result.meta,
        contentFiltered: filtered.blocked.length > 0,
        blockedCount: filtered.blocked.length,
        activeProfile: filtered.profile?.name || 'Unknown'
      };
    }

    return result;
  };
}
