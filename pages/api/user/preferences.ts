import { NextApiRequest, NextApiResponse } from 'next';
import { UserPreferences } from '@/models/UserPreferences';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET, POST, PUT, DELETE methods
  if (!ALLOWED_METHODS.includes(req.method as any)) {
    return res.status(405).json({ 
      success: false,
      error: "Method not allowed" 
    });
  }

  try {
    // Verify user authentication
    const session = await getServerSession(req, res, authOptions) as any;
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const userId = session.user.email;
    let profileId = req.body.profileId || (req.query.profileId as string);

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "Profile ID is required"
      });
    }

    switch (req.method) {
      case 'GET':
        return handleGet(userId, profileId, res);
      case 'POST':
        return handlePost(userId, profileId, req.body, res);
      case 'PUT':
        return handlePut(userId, profileId, req.body, res);
      case 'DELETE':
        return handleDelete(userId, profileId, req.body, res);
      default:
        return res.status(405).json({
          success: false,
          error: "Method not allowed"
        });
    }
  } catch (error) {
    console.error("User preferences API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

// GET user preferences
async function handleGet(userId: string, profileId: string, res: NextApiResponse) {
  try {
    let preferences = await UserPreferences.findOne({ userId, profileId });
    
    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = await UserPreferences.create({
        userId,
        profileId,
        watchlist: [],
        watchHistory: [],
        episodeProgress: [],
        settings: {
          autoplay: true,
          subtitles: false,
          subtitleLanguage: 'en',
          audioLanguage: 'en',
          videoQuality: 'auto'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch preferences"
    });
  }
}

// POST - Add item to watchlist or watch history
async function handlePost(userId: string, profileId: string, body: any, res: NextApiResponse) {
  try {
    const { type, data } = body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: "Type and data are required"
      });
    }

    let preferences = await UserPreferences.findOne({ userId, profileId });
    
    if (!preferences) {
      preferences = await UserPreferences.create({
        userId,
        profileId,
        watchlist: [],
        watchHistory: [],
        episodeProgress: [],
        settings: {
          autoplay: true,
          subtitles: false,
          subtitleLanguage: 'en',
          audioLanguage: 'en',
          videoQuality: 'auto'
        }
      });
    }

    switch (type) {
      case 'watchlist':
        // Check if item already exists in watchlist
        const existingWatchlistItem = preferences.watchlist.find(
          item => item.contentId === data.contentId
        );
        
        if (existingWatchlistItem) {
          return res.status(400).json({
            success: false,
            error: "Item already in watchlist"
          });
        }

        preferences.watchlist.push({
          contentId: data.contentId,
          contentType: data.contentType,
          addedAt: new Date(),
          metadata: data.metadata
        });
        break;

      case 'watchHistory':
        // Add to watch history (or update existing)
        const existingHistoryItem = preferences.watchHistory.find(
          item => item.contentId === data.contentId
        );
        
        if (existingHistoryItem) {
          existingHistoryItem.watchedAt = new Date();
          existingHistoryItem.duration = data.duration || existingHistoryItem.duration;
          existingHistoryItem.progress = data.progress || existingHistoryItem.progress;
        } else {
          preferences.watchHistory.push({
            contentId: data.contentId,
            contentType: data.contentType,
            watchedAt: new Date(),
            duration: data.duration || 0,
            progress: data.progress || 0,
            metadata: data.metadata
          });
        }
        break;

      case 'episodeProgress':
        // Update episode progress
        const existingProgress = preferences.episodeProgress.find(
          item => item.seriesId === data.seriesId && 
                  item.seasonNumber === data.seasonNumber && 
                  item.episodeId === data.episodeId
        );
        
        if (existingProgress) {
          existingProgress.progress = data.progress;
          existingProgress.lastWatchedAt = new Date();
          existingProgress.duration = data.duration || existingProgress.duration;
        } else {
          preferences.episodeProgress.push({
            seriesId: data.seriesId,
            seasonNumber: data.seasonNumber,
            episodeId: data.episodeId,
            progress: data.progress,
            lastWatchedAt: new Date(),
            duration: data.duration || 0
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid type. Must be 'watchlist', 'watchHistory', or 'episodeProgress'"
        });
    }

    await preferences.save();

    return res.status(200).json({
      success: true,
      data: preferences,
      message: `${type} updated successfully`
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update preferences"
    });
  }
}

// PUT - Update settings or bulk operations
async function handlePut(userId: string, profileId: string, body: any, res: NextApiResponse) {
  try {
    const { type, data } = body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: "Type and data are required"
      });
    }

    let preferences = await UserPreferences.findOne({ userId, profileId });
    
    if (!preferences) {
      preferences = await UserPreferences.create({
        userId,
        profileId,
        watchlist: [],
        watchHistory: [],
        episodeProgress: [],
        settings: {
          autoplay: true,
          subtitles: false,
          subtitleLanguage: 'en',
          audioLanguage: 'en',
          videoQuality: 'auto'
        }
      });
    }

    switch (type) {
      case 'settings':
        preferences.settings = { ...preferences.settings, ...data };
        break;


      default:
        return res.status(400).json({
          success: false,
          error: "Invalid type. Must be 'settings'"
        });
    }

    await preferences.save();

    return res.status(200).json({
      success: true,
      data: preferences,
      message: `${type} updated successfully`
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update preferences"
    });
  }
}

// DELETE - Remove items from watchlist or other data
async function handleDelete(userId: string, profileId: string, body: any, res: NextApiResponse) {
  try {
    const { type, contentId } = body;

    if (!type || !contentId) {
      return res.status(400).json({
        success: false,
        error: "Type and contentId are required"
      });
    }

    const preferences = await UserPreferences.findOne({ userId, profileId });
    
    if (!preferences) {
      return res.status(404).json({
        success: false,
        error: "Preferences not found"
      });
    }

    switch (type) {
      case 'watchlist':
        preferences.watchlist = preferences.watchlist.filter(
          item => item.contentId !== contentId
        );
        break;

      case 'watchHistory':
        preferences.watchHistory = preferences.watchHistory.filter(
          item => item.contentId !== contentId
        );
        break;

      case 'episodeProgress':
        if (body.seriesId && body.seasonNumber) {
          preferences.episodeProgress = preferences.episodeProgress.filter(
            item => !(item.seriesId === body.seriesId && 
                     item.seasonNumber === body.seasonNumber && 
                     item.episodeId === contentId)
          );
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid type. Must be 'watchlist', 'watchHistory', or 'episodeProgress'"
        });
    }

    await preferences.save();

    return res.status(200).json({
      success: true,
      data: preferences,
      message: `${type} item removed successfully`
    });
  } catch (error) {
    console.error("Error deleting from user preferences:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete item"
    });
  }
}
