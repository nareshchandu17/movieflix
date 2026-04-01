import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PaymentAttempt from '@/lib/models/PaymentAttempt';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { paymentId, failureReason } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Payment ID is required' 
        },
        { status: 400 }
      );
    }

    // Find and update payment attempt
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
    payment.status = 'FAILED';
    payment.failureReason = failureReason || 'Payment failed';
    payment.processedAt = new Date();
    await payment.save();

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded',
      retryAllowed: true
    });

  } catch (error) {
    console.error('Payment failure processing failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process payment failure' 
      },
      { status: 500 }
    );
  }
}
