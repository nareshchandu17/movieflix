import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Profile from "@/lib/models/Profile";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { profileId, pin } = await req.json();
    const profile = await Profile.findOne({ profileId, userId: session.user.id });

    if (!profile) return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });

    if (profile.pin && profile.pin !== pin) {
      return NextResponse.json({ error: "INVALID_PIN" }, { status: 403 });
    }

    // Success - In a real app, you would update the JWT/Session here
    // For this minimal logic, we return success.
    return NextResponse.json({ success: true, profileId });

  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
