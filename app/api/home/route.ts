import { NextRequest } from "next/server";
import { createGatewayResponse, createGatewayError } from "@/lib/gateway/response";
import { gatewayRateLimit, RATE_LIMIT_POLICIES } from "@/lib/gateway/rate-limiter";
import { GatewayClients } from "@/lib/gateway/clients";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // 1. Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const limit = await gatewayRateLimit(ip, RATE_LIMIT_POLICIES.HOME);
  
  if (!limit.allowed) {
    return createGatewayError("Rate limit exceeded", 429);
  }

  try {
    // 2. Parallel Aggregation of Home Sections
    const [trending, popularMovies, popularTV, topRated] = await Promise.all([
      GatewayClients.tmdb.getTrending("all", "day"),
      GatewayClients.tmdb.getPopular("movie"),
      GatewayClients.tmdb.getPopular("tv"),
      GatewayClients.tmdb.getTopRated("movie"),
    ]);

    const data = {
      hero: trending.results.slice(0, 5),
      sections: [
        { title: "Trending Today", results: trending.results },
        { title: "Popular Movies", results: popularMovies.results },
        { title: "Popular TV Shows", results: popularTV.results },
        { title: "Top Rated", results: topRated.results },
      ],
    };

    const response = createGatewayResponse(data, {
      source: "live",
      latency: Date.now() - startTime,
    });

    response.headers.set("X-RateLimit-Limit", limit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limit.remaining.toString());
    
    // Cache at the Edge CDN for 60 seconds, allow stale serving for up to 5 minutes
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    return response;
  } catch (error: any) {
    console.error("[Gateway Home] Error:", error.message);
    return createGatewayError("Home service currently unavailable", 500);
  }
}
