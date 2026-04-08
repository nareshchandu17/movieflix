import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import AccountSettings from '@/models/AccountSettings';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { pin } = await req.json();
    if (!pin) {
      return NextResponse.json({ success: false, error: 'PIN is required' }, { status: 400 });
    }

    await connectDB();

    const settings = await AccountSettings.findOne({ userId: session.user.id }).lean();
    
    if (!settings?.parentalControls?.enabled || !settings?.parentalControls?.pin) {
      // If PIN isn't enabled or set, any attempt is "valid" or PIN protection is off
      return NextResponse.json({ success: true });
    }

    if (settings.parentalControls.pin === pin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect PIN' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
