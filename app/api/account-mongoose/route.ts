import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Subscription, PaymentMethod, Profile, Device, NotificationPreference } from '@/lib/mongoose';

// Mock authentication - in a real app, this would come from next-auth
const mockUser = {
  email: 'john.doe@example.com',
  id: '1'
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    if (!mockUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with populated data
    const user = await User.findOne({ email: mockUser.email } as any)
      .populate('subscription')
      .populate('paymentMethods')
      .populate('profiles')
      .populate('devices')
      .populate('notificationPreferences');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        memberSince: user.memberSince,
        settings: user.settings,
        isActive: user.isActive,
        isVerified: user.isVerified
      },
      subscription: user.subscription,
      paymentMethods: user.paymentMethods,
      profiles: user.profiles,
      devices: user.devices,
      notifications: user.notificationPreferences
    });
  } catch (error) {
    console.error('Error fetching account data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    if (!mockUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Update user profile
    if (data.profile) {
      await User.findOneAndUpdate(
        { email: mockUser.email } as any,
        { 
          ...data.profile,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
    }

    // Update subscription
    if (data.subscription) {
      await Subscription.findOneAndUpdate(
        { userId: mockUser.id } as any,
        { 
          ...data.subscription,
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
    }

    // Update notification preferences
    if (data.notifications) {
      for (const [category, isEnabled] of Object.entries(data.notifications)) {
        await NotificationPreference.findOneAndUpdate(
          { userId: mockUser.id, category } as any,
          { isEnabled },
          { new: true, upsert: true }
        );
      }
    }

    return NextResponse.json({ 
      message: 'Account updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    if (!mockUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Add new payment method
    if (data.paymentMethod) {
      await PaymentMethod.create({
        userId: mockUser.id,
        ...data.paymentMethod,
        isDefault: data.paymentMethod.isDefault || false
      });
    }

    // Add new profile
    if (data.profile) {
      await Profile.create({
        userId: mockUser.id,
        ...data.profile
      });
    }

    // Add new device
    if (data.device) {
      await Device.create({
        userId: mockUser.id,
        ...data.device
      });
    }

    return NextResponse.json({ 
      message: 'Item added successfully',
      success: true
    });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    if (!mockUser?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id parameter' }, { status: 400 });
    }

    switch (type) {
      case 'paymentMethod':
        await PaymentMethod.deleteOne({ 
          id: id,
          userId: mockUser.id
        });
        break;
      
      case 'profile':
        await Profile.deleteOne({ 
          id: id,
          userId: mockUser.id
        });
        break;
      
      case 'device':
        await Device.deleteOne({ 
          id: id,
          userId: mockUser.id
        });
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Item deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
