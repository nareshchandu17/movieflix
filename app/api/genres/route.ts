import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { withContentFilter } from "@/lib/contentFilterMiddleware";

// Fallback genres in case TMDB API is unavailable
const fallbackGenres = {
  genres: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
  ]
};

async function genresHandler(request: NextRequest) {
  try {
    console.log("Fetching genres from TMDB API...");
    
    // Test API connectivity first
    const healthCheck = await api.healthCheck();
    if (!healthCheck.healthy) {
      console.error("TMDB API health check failed:", healthCheck.error);
      console.log("Using fallback genres instead");
      return NextResponse.json(fallbackGenres);
    }
    
    const data = await api.getGenres();
    console.log("Successfully fetched genres:", data);
    
    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    
    // Return fallback genres instead of error
    console.log("Using fallback genres due to API error");
    return NextResponse.json({
      success: true,
      data: fallbackGenres
    });
  }
}

// Export the handler with content filtering applied
export const GET = withContentFilter(genresHandler);
