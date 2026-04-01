import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/lib/models/Plan';
import PaymentAttempt from '@/lib/models/PaymentAttempt';
import Subscription from '@/lib/models/Subscription';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Plan ID is required' 
        },
        { status: 400 }
      );
    }

    // Get user from session (you'll need to implement auth middleware)
    const userId = 'temp-user-id'; // Replace with actual user ID from session

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Plan not found' 
        },
        { status: 404 }
      );
    }

    // Create payment attempt
    const paymentAttempt = await PaymentAttempt.create({
      userId,
      planId,
      amount: plan.price,
      currency: plan.currency,
      status: 'PENDING',
      transactionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentAttempt._id,
      amount: plan.price,
      status: 'PENDING',
      message: 'Payment initiated. Complete payment to activate subscription.'
    });

  } catch (error) {
    console.error('Subscription creation failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create subscription' 
      },
      { status: 500 }
    );
  }
}
