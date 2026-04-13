import connectDB from './db';
import User from '@/models/User';
import Profile from './models/Profile';

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
    
    // Update user's active profile and last used profile in database
    await User.findByIdAndUpdate(
      userId,
      { 
        activeProfile: profileId,
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

export async function getActiveProfile(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('activeProfile');
    if (!user || !user.activeProfile) {
      return null;
    }
    
    // Validate the profile still exists and belongs to user
    const profile = await Profile.findOne({ 
      profileId: user.activeProfile,
      userId: userId 
    });
    
    // If profile doesn't exist anymore, clear the active profile
    if (!profile) {
      await User.findByIdAndUpdate(userId, { activeProfile: null });
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Error getting active profile:', error);
    return null;
  }
}

export async function getLastUsedProfile(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('lastUsedProfile');
    if (!user || !user.lastUsedProfile) {
      return null;
    }
    
    // Validate the profile still exists and belongs to user
    const profile = await Profile.findOne({ 
      profileId: user.lastUsedProfile,
      userId: userId 
    });
    
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
    await connectDB();
    await User.findByIdAndUpdate(userId, { activeProfile: null });
  } catch (error) {
    console.error('Error clearing active profile:', error);
    throw error;
  }
}
