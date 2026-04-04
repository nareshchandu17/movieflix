import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import AccountSettings from '@/models/AccountSettings';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user account settings
    let settings = await AccountSettings.findOne({ userId: session.user.id })
      .populate('userId', 'name email avatar')
      .lean();

    if (!settings) {
      // Create default settings if not exists
      const user = await User.findById(session.user.id);
      settings = await AccountSettings.create({
        userId: session.user.id,
        profile: {
          firstName: user?.name?.split(' ')[0] || 'User',
          lastName: user?.name?.split(' ')[1] || '',
          email: user?.email || '',
          displayName: user?.name || 'User'
        }
      });
      
      settings = await AccountSettings.findById(settings._id)
        .populate('userId', 'name email avatar')
        .lean();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching account settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Update account settings
    const settings = await AccountSettings.findOneAndUpdate(
      { userId: session.user.id },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating account settings:', error);
    return NextResponse.json(
      { error: 'Failed to update account settings' },
      { status: 500 }
    );
  }
}
