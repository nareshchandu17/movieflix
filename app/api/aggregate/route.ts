import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "movie" | "tv";
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  const numericId = parseInt(id, 10);

  try {
    // Parallel fetch with Level 1-3 caching already active inside api calls
    const [details, videos, credits] = await Promise.all([
      api.getDetails(type, numericId),
      api.getVideos(type, numericId),
      api.getCredits(type, numericId),
    ]);

    const result = {
      ...details,
      videos: videos.results || [],
      credits: credits,
    };

    // Return with Cache-Control headers for browser/CDN caching
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      }
    });
  } catch (error: any) {
    console.error("[Aggregate API] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to aggregate data", message: error.message },
      { status: 500 }
    );
  }
}
