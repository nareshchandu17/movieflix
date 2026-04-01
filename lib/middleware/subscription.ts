import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subscription from '@/lib/models/Subscription';

export async function requirePremium(req: NextRequest) {
  try {
    await connectDB();
    
    // Get user from session (replace with actual auth implementation)
    const userId = (req as any).user?.id || 'temp-user-id';

    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Check for active premium subscription
    const subscription = await Subscription.findOne({ 
      userId, 
      status: 'ACTIVE' 
    }).populate({
      path: 'planId',
      select: 'name'
    });

    if (!subscription || (subscription.planId as any).name !== 'PREMIUM') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Premium subscription required',
          code: 'UPGRADE_REQUIRED'
        },
        { status: 403 }
      );
    }

    // User has premium access
    return NextResponse.json({
      success: true,
      hasPremium: true
    });

  } catch (error) {
    console.error('Premium check failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Usage example in API routes:
// import { requirePremium } from '@/lib/middleware/subscription';
// 
// export async function GET(req) {
//   const premiumCheck = await requirePremium(req);
//   if (!premiumCheck.success) {
//     return premiumCheck; // Returns the error response
//   }
//   // Continue with premium logic
// }
