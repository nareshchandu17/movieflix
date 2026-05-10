import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: personId } = await params;
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${apiKey}&language=en-US`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB person credits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch person credits" },
      { status: 500 }
    );
  }
}
