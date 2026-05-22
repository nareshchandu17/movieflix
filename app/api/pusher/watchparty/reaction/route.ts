import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { triggerRoomEvent } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, reaction, movieTimestamp } = await req.json();

    if (!roomId || !reaction) {
      return NextResponse.json({ error: "Missing roomId or reaction" }, { status: 400 });
    }

    // Trigger Pusher reaction event ephemerally (no DB storage required)
    await triggerRoomEvent(roomId, "reaction", {
      id: Math.random().toString(),
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      type: reaction,
      movieTimestamp: movieTimestamp || 0,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party reaction error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
