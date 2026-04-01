import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Profile from '@/lib/models/Profile';
import User from '@/models/User';
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

// GET /api/profiles - Fetch all profiles for current user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = getUserFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profiles = await Profile.find({ 
      userId, 
      isActive: true 
    }).sort({ lastWatchedAt: -1 });

    return NextResponse.json({
      success: true,
      profiles
    });

  } catch (error) {
    console.error('Failed to fetch profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Create new profile
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

    const { name, isKids, maturityLevel } = await req.json();

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile name is required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Profile name must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Check user's profile limit
    const user = await User.findById(userId);
    const existingProfiles = await Profile.countDocuments({ userId });
    
    if (existingProfiles >= (user?.profilesLimit || 5)) {
      return NextResponse.json(
        { success: false, error: 'Profile limit reached' },
        { status: 400 }
      );
    }

    // Create new profile
    const profile = await Profile.create({
      userId,
      name: name.trim(),
      isKids: isKids || false,
      maturityLevel: maturityLevel || (isKids ? '13+' : '18+'),
      avatar: isKids ? 'kids-default.png' : 'default.png'
    });

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
