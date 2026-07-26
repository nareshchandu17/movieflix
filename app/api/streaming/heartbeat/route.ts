import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import { ActiveStream } from "@/features/history/models/ActiveStream";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { deviceId } = await req.json();

    const stream = await ActiveStream.findOneAndUpdate(
      { userId: session.user.id, deviceId },
      { lastHeartbeat: new Date() },
      { new: true }
    );

    if (!stream) return NextResponse.json({ error: "STREAM_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
