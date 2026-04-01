import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, rating, userMood } = await request.json();

    if (!contentId || rating === undefined) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 });
    }

    // In a real app, we would store this in a 'MoodFeedback' collection
    // to reinforce the model or adjust future weights for this user.
    console.log(`Mood Feedback received for User ${ (session.user as any).id }:`, {
      contentId,
      rating,
      userMood
    });

    return NextResponse.json({ success: true, message: "Feedback recorded" });

  } catch (error) {
    console.error("Feedback recording failed:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
