import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: movieId } = await params;
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key is missing" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB movie details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
