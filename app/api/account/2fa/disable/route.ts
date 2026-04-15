import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      twoFactorSecret: null,
      twoFactorEnabled: false,
      twoFactorRecoveryCodes: []
    });

    return NextResponse.json({
      success: true,
      message: "2FA disabled successfully"
    });
  } catch (error) {
    console.error("2FA DISABLE ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
