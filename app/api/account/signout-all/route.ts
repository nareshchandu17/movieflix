import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LoginActivity from '@/models/LoginActivity';

export async function DELETE() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sign out from all devices except current
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
