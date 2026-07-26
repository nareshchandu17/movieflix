import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/authentication/services/auth";
import connectDB from "@/lib/db";
import WatchPartyRoom from "@/features/watch-party/models/WatchPartyRoom";
import { triggerRoomEvent } from "@/lib/pusher/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    await connectDB();

    const userId = session.user.id;

    // Pull the participant from the room
    const room = await WatchPartyRoom.findOneAndUpdate(
      { roomId },
      { $pull: { participants: { userId } } },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Trigger room-state event to update other members
    await triggerRoomEvent(roomId, "room-state", {
      participants: room.participants.map((p: any) => ({
        userId: p.userId,
        userName: p.userName,
        isHost: p.isHost,
      })),
    });

    // If no participants left, we can mark the room as inactive
    if (room.participants.length === 0) {
      await WatchPartyRoom.findByIdAndUpdate(room._id, { isActive: false });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Watch party room leave error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
