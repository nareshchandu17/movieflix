import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeClips } from "@/lib/scenes/youtube";
import { scenesCache } from "@/lib/scenes/cache";
import { Clip } from "@/lib/scenes/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const maxResults = parseInt(searchParams.get("maxResults") || "20");

  if (!query) {
    return NextResponse.json(
      { error: "Missing 'q' query parameter" },
      { status: 400 }
    );
  }

  const cacheKey = `scenes:${query}:${maxResults}`;

  // Check cache first
  const cached = scenesCache.get<Clip[]>(cacheKey);
  if (cached) {
    return NextResponse.json({ clips: cached, cached: true });
  }

  try {
    const clips = await searchYouTubeClips(query, maxResults);

    // Cache the results
    if (clips.length > 0) {
      scenesCache.set(cacheKey, clips);
    }

    return NextResponse.json({ clips, cached: false });
  } catch (error) {
    console.error("Scenes API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scenes", clips: [] },
      { status: 500 }
    );
  }
}
