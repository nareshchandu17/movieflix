import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import AccountSettings from '@/models/AccountSettings';
import Profile from '@/lib/models/Profile';
import { hash } from 'bcryptjs';

// GET /api/profiles/settings - get account settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const settings = await AccountSettings.findOne({ userId: session.user.id }).lean();
    
    if (!settings) {
      // Create default settings
      const defaultSettings = await AccountSettings.create({
        userId: session.user.id,
        profile: {
          firstName: session.user.name?.split(' ')[0] || 'User',
          lastName: session.user.name?.split(' ')[1] || '',
          email: session.user.email || '',
          displayName: session.user.name || 'User'
        }
      });
      return NextResponse.json({ success: true, data: defaultSettings });
    }

    return NextResponse.json({ success: true, data: settings });

  } catch (error: unknown) {
    console.error('GET /api/profiles/settings error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PATCH /api/profiles/settings - update account settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { section, data } = body;

    const settings = await AccountSettings.findOne({ userId: session.user.id });
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings not found' },
        { status: 404 }
      );
    }

    // Update specific section
    switch (section) {
      case 'parentalControls':
        // Validate PIN if changing parental controls
        if (data.pin && settings.parentalControls.enabled) {
          const currentPin = settings.parentalControls.pin;
          if (currentPin && currentPin !== data.currentPin) {
            return NextResponse.json(
              { success: false, error: 'Current PIN is incorrect' },
              { status: 400 }
            );
          }
        }

        // Hash new PIN if provided
        if (data.pin) {
          data.pin = await hash(data.pin, 10);
        }

        settings.parentalControls = {
          ...settings.parentalControls,
          ...data
        };
        break;

      case 'language':
        settings.language = {
          ...settings.language,
          ...data
        };
        break;

      case 'playback':
        settings.playback = {
          ...settings.playback,
          ...data
        };
        break;

      case 'subtitles':
        settings.subtitles = {
          ...settings.subtitles,
          ...data
        };
        break;

      case 'notifications':
        settings.notifications = {
          ...settings.notifications,
          ...data
        };
        break;

      case 'security':
        // Handle security settings with validation
        if (data.twoFactorEnabled && !settings.security.twoFactorEnabled) {
          // TODO: Implement 2FA setup
          return NextResponse.json(
            { success: false, error: 'Two-factor authentication not yet implemented' },
            { status: 501 }
          );
        }
        settings.security = {
          ...settings.security,
          ...data,
          lastPasswordChange: new Date()
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid settings section' },
          { status: 400 }
        );
    }

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings,
      message: `${section} settings updated successfully`
    });

  } catch (error: unknown) {
    console.error('PATCH /api/profiles/settings error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST /api/profiles/settings/verify-pin - verify parental control PIN
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { pin } = await req.json();
    
    const settings = await AccountSettings.findOne({ userId: session.user.id });
    if (!settings || !settings.parentalControls.enabled) {
      return NextResponse.json(
        { success: false, error: 'Parental controls not enabled' },
        { status: 400 }
      );
    }

    const isValid = settings.parentalControls.pin === pin;
    
    return NextResponse.json({
      success: true,
      valid: isValid,
      message: isValid ? 'PIN verified successfully' : 'Invalid PIN'
    });

  } catch (error: unknown) {
    console.error('POST /api/profiles/settings/verify-pin error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
