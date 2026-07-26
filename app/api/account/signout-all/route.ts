import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/authentication/services/auth';
import connectDB from '@/lib/db';
import LoginActivity from '@/features/authentication/models/LoginActivity';
import Device from '@/features/authentication/models/Device';
import { NotificationService } from '@/lib/services/NotificationService';

export async function DELETE() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sign out from all devices in login activity
    await LoginActivity.updateMany(
      { 
        userId: session.user.id,
        isActive: true 
      },
      { 
        isActive: false,
        logoutTime: new Date()
      }
    );
    
    // Also deactivate all devices
    await Device.updateMany(
      { userId: session.user.id },
      { isActive: false }
    );
    
    // Send security notification
    await NotificationService.sendSecurityAlert(
      session.user.id,
      "Global Sign Out",
      "You have been signed out of all active devices for security reasons."
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Signed out from all devices successfully' 
    });
  } catch (error) {
    console.error('Error signing out from all devices:', error);
    return NextResponse.json(
      { error: 'Failed to sign out from all devices' },
      { status: 500 }
    );
  }
}
