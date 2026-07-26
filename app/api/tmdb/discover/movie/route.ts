import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { z } from "zod";

// Zod schema for discover parameters validation
const DiscoverMovieSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  with_genres: z.string().optional(),
  sort_by: z.string().optional(),
  year: z.string().optional(),
  "vote_average.gte": z.string().optional(),
  "certification.lte": z.string().optional(),
  with_original_language: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
    const allowed = await rateLimit(ip, 60, 60); // 60 requests per minute
    if (!allowed) {
      return createErrorResponse("Rate limit exceeded", 429, "RATE_LIMITED");
    }

    const { searchParams } = new URL(request.url);
    const apiKey = process.env.TMDB_API_KEY;
    
    if (!apiKey) {
      return createErrorResponse("TMDB API key is missing", 500, "CONFIG_ERROR");
    }

    // Validate and transform search parameters
    const params = Object.fromEntries(searchParams.entries());
    const validated = DiscoverMovieSchema.safeParse(params);
    
    if (!validated.success) {
      return createErrorResponse(
        validated.error.issues[0].message,
        400,
        "VALIDATION_ERROR"
      );
    }

    // Build query string with validated parameters
    const queryString = new URLSearchParams();
    Object.entries(validated.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&${queryString}`;
    const response = await fetch(url, { 
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    console.error("TMDB discover movies error:", error);
    return createErrorResponse(
      "Failed to discover movies",
      500,
      "API_ERROR",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
