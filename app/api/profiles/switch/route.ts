import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import jwt from 'jsonwebtoken';

// Helper function to get user from token
function getUserFromToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

// POST /api/profiles/switch - Switch to a different profile
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { profileId } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    // Verify profile belongs to user
    const profile = await Profile.findOne({ 
      _id: profileId, 
      userId, 
      isActive: true 
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update last watched time
    profile.lastWatchedAt = new Date();
    await profile.save();

    // Generate new token with profileId
    const newToken = jwt.sign(
      { 
        userId, 
        profileId,
        profileName: profile.name,
        isKids: profile.isKids
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token: newToken,
      profile: {
        id: profile._id,
        name: profile.name,
        avatar: profile.avatar,
        isKids: profile.isKids,
        maturityLevel: profile.maturityLevel
      },
      message: `Switched to ${profile.name}`
    });

  } catch (error) {
    console.error('Failed to switch profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to switch profile' },
      { status: 500 }
    );
  }
}
