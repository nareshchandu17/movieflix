import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PaymentAttempt from '@/lib/models/PaymentAttempt';
import Subscription from '@/lib/models/Subscription';
import Plan from '@/lib/models/Plan';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment ID is required' 
        },
        { status: 400 }
      );
    }

    // Find payment attempt
    const payment = await PaymentAttempt.findById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment not found' 
        },
        { status: 404 }
      );
    }

    // Update payment status
    payment.status = 'SUCCESS';
    payment.processedAt = new Date();
    await payment.save();

    // Create subscription
    const subscription = await Subscription.create({
      userId: payment.userId,
      planId: payment.planId,
      status: 'ACTIVE',
      startDate: new Date(),
      autoRenew: true
    });

    // Get plan details for response
    const plan = await Plan.findById(payment.planId);

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        id: subscription._id,
        plan: plan?.name,
        status: 'ACTIVE',
        startDate: subscription.startDate
      }
    });

  } catch (error) {
    console.error('Payment success processing failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process payment' 
      },
      { status: 500 }
    );
  }
}
