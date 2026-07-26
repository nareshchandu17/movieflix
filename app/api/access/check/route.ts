import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subscription from '@/features/payments/models/Subscription';
import Plan from '@/features/payments/models/Plan';
import User from '@/features/authentication/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get user from session (replace with actual auth)
    const userId = 'temp-user-id'; // Replace with actual user ID from session

    if (!userId) {
      return NextResponse.json(
        { 
          hasAccess: false,
          reason: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    // Find active subscription
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'ACTIVE' 
    }).populate('planId');

    if (!subscription) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'No active subscription',
        requiredPlan: 'BASIC'
      });
    }

    const plan = subscription.planId as any;
    
    // Define access policies
    const accessPolicy = {
      plan: plan.name,
      hasAccess: true,
      allowedFeatures: plan.features || [],
      restrictedFeatures: [],
      expiresAt: subscription.currentPeriodEnd
    };

    // Apply restrictions for BASIC plan
    if (plan.name === 'BASIC') {
      accessPolicy.restrictedFeatures = ['watchParty', 'aiFeatures'] as never[];
      accessPolicy.allowedFeatures = ['trailers', 'basicContent'] as never[];
    }

    return NextResponse.json({
      success: true,
      access: accessPolicy
    });

  } catch (error) {
    console.error('Access check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check access' 
      },
      { status: 500 }
    );
  }
}
