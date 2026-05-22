import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key is missing" }, { status: 500 });
  }

  try {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&${searchParams}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TMDB discover movies error:", error);
    return NextResponse.json(
      { error: "Failed to discover movies" },
      { status: 500 }
    );
  }
}
