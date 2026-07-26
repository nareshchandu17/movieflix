import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/authentication/services/auth';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs';
import User from '@/features/authentication/models/User';
import AccountSettings from '@/features/authentication/models/AccountSettings';
import { NotificationService } from '@/lib/services/NotificationService';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newEmail } = await request.json();

    if (!currentPassword || !newEmail) {
      return NextResponse.json(
        { error: 'Current password and new email are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 1. Verify User exists and check password
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has a password (not social login), verify it
    if (user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // 2. Check if new email is already taken
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 400 }
      );
    }

    // 3. Update User model
    await User.findByIdAndUpdate(session.user.id, {
      email: newEmail,
      updatedAt: new Date()
    });

    // 4. Update AccountSettings profile
    await AccountSettings.findOneAndUpdate(
      { userId: session.user.id },
      { 
        'profile.email': newEmail,
        updatedAt: new Date()
      },
      { upsert: true }
    );
    
    // 5. Send security notification
    await NotificationService.sendSecurityAlert(
      session.user.id,
      "Email Updated",
      `Your account email has been successfully changed to ${newEmail}.`
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Email updated successfully' 
    });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}
