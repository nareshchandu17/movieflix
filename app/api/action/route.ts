import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Action } from "@/features/admin/models/Action";
import { fetchAPI } from "@/lib/api";
import { TMDBMovieResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {

    
    // Check environment variables first
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found in environment");

    }
    

    try {
      await dbConnect();

    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);

      
      // Skip MongoDB and go directly to TMDB
      return await fetchFromTMDB(request);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    


    const skip = (page - 1) * limit;

    // Try to fetch from MongoDB first

    try {
      let actions = await Action.find()
        .skip(skip)
        .limit(limit)
        .lean();

      let total = await Action.countDocuments();
      


      // If no data in MongoDB, fallback to TMDB API
      if (actions.length === 0) {

        return await fetchFromTMDB(request);
      }


      return NextResponse.json(
        {
          results: actions,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        { status: 200 }
      );
    } catch (mongoError) {
      console.error("❌ MongoDB query failed:", mongoError);

      return await fetchFromTMDB(request);
    }
  } catch (error) {
    console.error("❌ Error fetching action movies:", error);
    
    // Ensure we always return a proper error message
    let errorMessage = "Failed to fetch action movies";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && error.message) {
      errorMessage = error.message;
    }
    
    // Fallback for empty errors
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = "Unknown error occurred while fetching action movies";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.toString(),
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error
        } : undefined
      },
      { status: 500 }
    );
  }
}

async function fetchFromTMDB(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  
  if (!process.env.TMDB_API_KEY) {
    console.error("❌ TMDB API key not found");
    throw new Error("TMDB API key is missing");
  }
  
  const baseUrl = 'https://api.themoviedb.org/3/discover/movie';
  const params = new URLSearchParams({
    with_genres: '28',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page: page.toString(),
    limit: limit.toString(),
    api_key: process.env.TMDB_API_KEY || ''
  });


  const tmdbResponse = await fetchAPI<TMDBMovieResponse>(`${baseUrl}?${params}`);

  
  return NextResponse.json({
    results: tmdbResponse.results || [],
    page,
    limit,
    total: tmdbResponse.total_results || 0,
    totalPages: Math.ceil((tmdbResponse.total_results || 0) / limit),
  });
}
