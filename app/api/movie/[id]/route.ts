import { NextRequest } from "next/server";
import { MovieDetailsSchema } from "@/lib/gateway/schemas";
import { createGatewayResponse, createGatewayError } from "@/lib/gateway/response";
import { gatewayRateLimit, RATE_LIMIT_POLICIES } from "@/lib/gateway/rate-limiter";
import { GatewayClients } from "@/lib/gateway/clients";
import { getAPIErrorMessage, hasCriticalAPIKeys } from "@/lib/api-config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const { id: paramId } = await params;
  
  // 0. API Key Validation
  if (!hasCriticalAPIKeys()) {
    return createGatewayError(getAPIErrorMessage('tmdb'), 503);
  }
  
  // 1. Validation
  const validated = MovieDetailsSchema.safeParse({
    id: paramId,
  });

  if (!validated.success) {
    return createGatewayError("Invalid movie ID", 400);
  }

  const { id } = validated.data;

  // 2. Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const limit = await gatewayRateLimit(ip, RATE_LIMIT_POLICIES.DETAILS);
  
  if (!limit.allowed) {
    return createGatewayError("Rate limit exceeded", 429);
  }

  try {
    // 3. Execution (Aggregated parallel calls)
    const details = await GatewayClients.tmdb.getDetails("movie", id);
    
    // Fetch trailer in parallel with details if possible, but here we need title from details
    const trailer = await GatewayClients.youtube.getTrailer(details.title);

    const data = {
      ...details,
      trailer,
    };

    const response = createGatewayResponse(data, {
      source: "live",
      latency: Date.now() - startTime,
    });

    response.headers.set("X-RateLimit-Limit", limit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", limit.remaining.toString());

    return response;
  } catch (error: any) {
    if (error.status === 404) {
      return createGatewayError("Movie not found", 404);
    }
    console.error("[Gateway Movie] Error:", error.message);
    return createGatewayError("Failed to fetch movie details", 500);
  }
}
