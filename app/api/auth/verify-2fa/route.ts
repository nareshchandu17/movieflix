import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { DataLeakPrevention } from "@/lib/auth-security";
import speakeasy from 'speakeasy';
import { z } from "zod";

// Request validation schema
const verify2FASchema = z.object({
  tempToken: z.string().min(1, "Temporary token is required"),
  code: z.string().length(6, "2FA code must be 6 digits"),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = verify2FASchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request format",
          details: validation.error.issues.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { tempToken, code } = validation.data;

    // Decode temporary token
    let tempData;
    try {
      tempData = JSON.parse(Buffer.from(tempToken, 'base64').toString());
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid temporary token" },
        { status: 400 }
      );
    }

    // Validate token structure and expiration
    if (!tempData.userId || !tempData.email || !tempData.requiresTwoFactor) {
      return NextResponse.json(
        { success: false, error: "Invalid temporary token structure" },
        { status: 400 }
      );
    }

    // Check token expiration (15 minutes)
    const now = Date.now();
    const tokenAge = now - tempData.timestamp;
    const maxAge = 15 * 60 * 1000; // 15 minutes

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { success: false, error: "Temporary token has expired" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findById(tempData.userId).select('+twoFactorSecret +twoFactorEnabled');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { success: false, error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 1 step before/after
      time: Math.floor(tempData.timestamp / 1000)
    });

    if (!verified) {
      DataLeakPrevention.safeLog('warn', `Failed 2FA verification`, { 
        userId: user._id.toString(),
        email: user.email,
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      });
      
      return NextResponse.json(
        { success: false, error: "Invalid 2FA code" },
        { status: 401 }
      );
    }

    // Successful 2FA verification
    DataLeakPrevention.safeLog('info', `Successful 2FA verification`, { 
      userId: user._id.toString(),
      email: user.email,
      ip: req.headers.get('x-forwarded-for') || 'unknown' 
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "2FA verification successful",
      user: DataLeakPrevention.sanitizeUserData(user.toObject())
    });

  } catch (error) {
    DataLeakPrevention.safeLog('error', '2FA verification error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error during 2FA verification" 
      },
      { status: 500 }
    );
  }
}
