import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Device from '@/models/Device';
import LoginActivity from '@/models/LoginActivity';

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get devices
    const devices = await Device.find({ userId: session.user.id })
      .sort({ lastActive: -1 })
      .lean();

    // Get login activity
    const loginActivity = await LoginActivity.find({ userId: session.user.id })
      .sort({ loginTime: -1 })
      .limit(10)
      .lean();

    // Calculate stats
    const activeDevices = devices.filter(d => d.isActive).length;
    const deviceLimit = 5;
    const totalDownloadSlots = devices.reduce((sum, device) => sum + device.downloadSlots, 0);
    const maxDownloadSlots = devices.reduce((sum, device) => sum + device.maxDownloadSlots, 0);

    return NextResponse.json({
      success: true,
      data: {
        devices,
        loginActivity,
        stats: {
          activeDevices,
          deviceLimit,
          downloadSlots: `${totalDownloadSlots} / ${maxDownloadSlots}`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId } = await request.json();

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Remove device
    await Device.findOneAndDelete({
      _id: deviceId,
      userId: session.user.id
    });

    // Update login activity
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
      message: 'Device removed successfully' 
    });
  } catch (error) {
    console.error('Error removing device:', error);
    return NextResponse.json(
      { error: 'Failed to remove device' },
      { status: 500 }
    );
  }
}
