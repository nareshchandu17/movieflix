import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Plan from '@/lib/models/Plan';

export async function GET() {
  try {
    await connectDB();
    
    const plans = await Plan.find({ isActive: true })
      .sort({ price: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch plans' 
      },
      { status: 500 }
    );
  }
}
