import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { ActiveStream } from "@/models/ActiveStream";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { deviceId } = await req.json();
    const user = await User.findById(session.user.id);

    // 1. Subscription Check
    if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "past_due") {
      return NextResponse.json({ error: "SUBSCRIPTION_REQUIRED" }, { status: 403 });
    }

    // 2. Concurrent Stream Check
    const activeThreshold = new Date(Date.now() - 60000); // 60 sec
    const activeStreamsCount = await ActiveStream.countDocuments({
      userId: user._id,
      lastHeartbeat: { $gt: activeThreshold }
    });

    const limits = { mobile: 1, basic: 2, premium: 4 };
    const maxStreams = (limits as any)[user.subscription] || 0;

    if (activeStreamsCount >= maxStreams) {
      // Check if current device is already streaming (re-entry)
      const existing = await ActiveStream.findOne({ userId: user._id, deviceId });
      if (!existing) return NextResponse.json({ error: "STREAM_LIMIT_EXCEEDED" }, { status: 429 });
    }

    // 3. Resolution Mapping
    const resolutions = { mobile: "480p", basic: "1080p", premium: "4K" };
    const allowedResolution = (resolutions as any)[user.subscription] || "480p";

    // 4. Register/Update Stream
    await ActiveStream.findOneAndUpdate(
      { userId: user._id, deviceId },
      { lastHeartbeat: new Date() },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      allowedResolution,
      isGracePeriod: user.subscriptionStatus === "past_due"
    });

  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
