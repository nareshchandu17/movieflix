import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/authentication/services/auth";
import Device from "@/features/authentication/models/Device";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const devices = await Device.getUserDevices(session.user.id, true);
    return NextResponse.json({ success: true, devices });
  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { deviceId, deviceName, deviceType = "web", browser, os, location } = await req.json();

    await Device.registerDevice(session.user.id, {
      deviceId: deviceId || `web-${Date.now()}`,
      deviceName: deviceName || `${browser || "Web"} on ${os || "PC"}`,
      deviceType,
      deviceInfo: { browser, os },
      location,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
