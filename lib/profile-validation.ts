import connectDB from './db';
import Profile from './models/Profile';

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
