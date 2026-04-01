import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSkipSafeSummary } from "@/lib/narrativeEngine";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, contentType, skippedFrom, skippedTo } = await request.json();

    if (!contentId || !skippedFrom || !skippedTo) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await getSkipSafeSummary({
      contentId,
      contentType,
      skippedFrom,
      skippedTo
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Catch-up summary failed:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
