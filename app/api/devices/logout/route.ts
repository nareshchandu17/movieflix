import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import { UserDevice } from "@/features/authentication/models/UserDevice";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { deviceId } = await req.json();

    // Remove the device record
    await UserDevice.findOneAndDelete({ deviceId, userId: session.user.id });

    // Note: To truly invalidate a NextAuth session, you would typically 
    // need to store a "denylist" of deviceIds in Redis or the DB 
    // that the JWT callback checks against. For this minimal logic,
    // we simply remove the tracking record.

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
