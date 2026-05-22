import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let socketId = "";
    let channelName = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      socketId = body.socket_id;
      channelName = body.channel_name;
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      socketId = params.get("socket_id") || "";
      channelName = params.get("channel_name") || "";
    }

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
    }

    // Authorization checks based on channel prefixes
    if (channelName.startsWith("presence-")) {
      // Watch Party presence channel: presence-room-{roomId}
      const userData = {
        user_id: session.user.id,
        user_info: {
          userName: session.user.name || "Anonymous",
          isHost: false, // Default, will be updated based on DB in join route if needed
        },
      };
      const authResponse = pusherServer.authorizeChannel(socketId, channelName, userData);
      return NextResponse.json(authResponse);
    } else if (channelName.startsWith("private-signal-")) {
      // WebRTC signaling: private-signal-{userId}
      const expectedUserId = channelName.substring("private-signal-".length);
      if (expectedUserId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden: Signal channel ID mismatch" }, { status: 403 });
      }
      const authResponse = pusherServer.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    } else if (channelName.startsWith("private-user-")) {
      // Per-user notifications/updates: private-user-{userId}
      const expectedUserId = channelName.substring("private-user-".length);
      if (expectedUserId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden: User channel ID mismatch" }, { status: 403 });
      }
      const authResponse = pusherServer.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    } else {
      // Only private and presence channels are allowed, any other channel is rejected
      return NextResponse.json({ error: "Forbidden: Invalid channel type" }, { status: 403 });
    }
  } catch (error) {
    console.error("❌ Pusher auth error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
