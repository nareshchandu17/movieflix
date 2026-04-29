import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as jwt from "jsonwebtoken";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
    }

    // Create a temporary token for WebSocket authentication
    // We include the user ID and potentially the active profile ID
    const socketToken = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        // If profile selection is integrated, we would add profileId here
        // For now, we assume the server can infer the primary profile or use the userId
        profileId: session.user.id, // Fallback to userId if profile system is simple
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token: socketToken });
  } catch (error) {
    console.error("Socket token generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
