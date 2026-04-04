import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import { Action } from "@/lib/models/Action";
import { fetchAPI } from "@/lib/api";
import { TMDBMovieResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    console.log("🎬 Action API called");
    
    // Check environment variables first
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI not found in environment");
      console.log("🔧 Using default MongoDB connection");
    }
    
    console.log("🔌 Connecting to database...");
    try {
      await dbConnect();
      console.log("✅ Database connected successfully");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      console.log("🌐 Proceeding with TMDB API fallback...");
      
      // Skip MongoDB and go directly to TMDB
      return await fetchFromTMDB(request);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    console.log(`📊 Fetching page ${page}, limit ${limit}`);

    const skip = (page - 1) * limit;

    // Try to fetch from MongoDB first
    console.log("🔍 Checking MongoDB for action movies...");
    try {
      let actions = await Action.find()
        .skip(skip)
        .limit(limit)
        .lean();

      let total = await Action.countDocuments();
      
      console.log(`📽️ Found ${actions.length} movies in MongoDB, total: ${total}`);

      // If no data in MongoDB, fallback to TMDB API
      if (actions.length === 0) {
        console.log("🌐 No action movies in MongoDB, fetching from TMDB...");
        return await fetchFromTMDB(request);
      }

      console.log("✅ Returning MongoDB data");
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
      console.log("🌐 Falling back to TMDB API...");
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
  
  if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    console.error("❌ TMDB API key not found");
    throw new Error("TMDB API key not configured");
  }
  
  const baseUrl = 'https://api.themoviedb.org/3/discover/movie';
  const params = new URLSearchParams({
    with_genres: '28',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    page: page.toString(),
    limit: limit.toString(),
    api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
  });

  console.log("🎬 Fetching from TMDB...");
  const tmdbResponse = await fetchAPI<TMDBMovieResponse>(`${baseUrl}?${params}`);
  console.log(`✅ TMDB returned ${tmdbResponse.results?.length || 0} movies`);
  
  return NextResponse.json({
    results: tmdbResponse.results || [],
    page,
    limit,
    total: tmdbResponse.total_results || 0,
    totalPages: Math.ceil((tmdbResponse.total_results || 0) / limit),
  });
}
