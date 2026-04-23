import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserPreferences } from '@/models/UserPreferences';
import Profile from '@/models/Profile';
import { getGeminiService } from '@/lib/geminiService';
import dbConnect from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Verify Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get Profile ID
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ success: false, error: 'Profile ID is required' }, { status: 400 });
    }

    const userId = session.user.email;

    // 3. Find User Preferences & Profile
    const [preferences, profile] = await Promise.all([
      UserPreferences.findOne({ userId, profileId }),
      Profile.findOne({ profileId })
    ]);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // 4. Cache Check
    const forceRefresh = searchParams.get('refresh') === 'true';
    const hasCache = preferences?.tasteDNA && preferences.tasteDNA.persona;
    const isStale = preferences?.tasteDNA?.lastGenerated
      ? (new Date().getTime() - new Date(preferences.tasteDNA.lastGenerated).getTime() > 24 * 60 * 60 * 1000)
      : true;

    if (hasCache && !forceRefresh && !isStale) {
      return NextResponse.json({
        success: true,
        data: preferences.tasteDNA,
        cached: true
      });
    }

    // 5. Generate New Taste DNA
    const gemini = getGeminiService();
    const watchHistory = preferences?.watchHistory || [];

    // Generate DNA
    const tasteDNAData = await gemini.generateTasteDNA(profile.name, watchHistory);

    // 6. Save to Cache
    const updatedPreferences = await UserPreferences.findOneAndUpdate(
      { userId, profileId },
      {
        $set: {
          tasteDNA: {
            ...tasteDNAData,
            lastGenerated: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedPreferences.tasteDNA,
      cached: false
    });

  } catch (error: any) {
    console.error('Taste DNA API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
