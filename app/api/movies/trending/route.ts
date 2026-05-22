import { NextResponse } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import { rateLimit } from "@/lib/rateLimit";
import { logError, logInfo } from "@/lib/logger";

/**
 * Example Production API Route
 * demonstrating Rate Limiting, Caching, and Error Fallbacks.
 */
export async function GET(req: Request) {
  try {
    // 1. Identify Client (IP fallback for localhost)
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

    // 2. Apply Rate Limiting (20 requests per minute)
    const allowed = await rateLimit(ip, 20, 60);
    if (!allowed) {
      logInfo(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const cacheKey = "movies:trending:v1";

    // 3. Try Cache Retrieval
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      logInfo("Serving trending movies from cache");
      return NextResponse.json(cachedData);
    }

    // 4. Cache Miss - Fetch from Data Source (TMDB Mock or API)
    logInfo("Cache miss - fetching trending movies from TMDB API");
    
    // Using existing TMDB Key from env
    const apiKey = process.env.TMDB_API_KEY;
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`,
      { next: { revalidate: 3600 } } // Next.js internal fetch cache as backup
    );

    if (!tmdbRes.ok) {
      throw new Error(`TMDB API returned status: ${tmdbRes.status}`);
    }

    const data = await tmdbRes.json();

    // 5. Populate Cache (TTL: 1 hour)
    await setCache(cacheKey, data, 3600);
    logInfo("Trending movies cached successfully");

    return NextResponse.json(data);

  } catch (err: any) {
    // 6. Global Error Fallback
    logError("Trending Movies API Route Failure", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
