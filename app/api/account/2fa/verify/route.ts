import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, secret } = await req.json();

    if (!token || !secret) {
      return NextResponse.json({ error: "Token and secret are required" }, { status: 400 });
    }

    // Verify token against the PROVIDED secret (not from DB yet as it's not enabled)
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1 // Allow 30s drift
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await connectDB();

    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Save secret to user and enable 2FA
    await User.findByIdAndUpdate(session.user.id, {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      twoFactorRecoveryCodes: recoveryCodes
    });

    return NextResponse.json({
      success: true,
      message: "2FA enabled successfully",
      data: {
        recoveryCodes
      }
    });
  } catch (error) {
    console.error("2FA VERIFY ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
