/**
 * AI Suggestions API Route - Clean and secure Gemini API integration
 */

import { rateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  getGeminiService,
  type AISuggestionResponse,
} from "@/features/ai/services/geminiService";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Get client IP for logging (safe for all environments)
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

/**
 * Create client identifier for rate limiting
 * Uses IP when available, falls back to request fingerprint
 */
function getClientIdentifier(request: NextRequest): string {
  const ip = getClientIP(request);
  
  // Use IP if available and not localhost/private
  if (ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    return `ip:${ip}`;
  }
  
  // Fallback to request fingerprint
  const userAgent = request.headers.get("user-agent") || '';
  const accept = request.headers.get("accept") || '';
  const acceptLanguage = request.headers.get("accept-language") || '';
  
  const fingerprint = createHash('sha256')
    .update(`${userAgent}:${accept}:${acceptLanguage}`)
    .digest('hex')
    .substring(0, 16);
    
  return `fingerprint:${fingerprint}`;
}


/**
 * Validate origin for CORS
 */
function validateOrigin(origin: string | null): boolean {
  // Allow requests without origin (same-origin, direct navigation)
  if (!origin) return true;

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  // If no allowlist configured, allow all origins (for development)
  if (allowedOrigins.length === 0) return true;
  
  return allowedOrigins.includes(origin);
}

/**
 * POST /api/ai-suggestions - Generate AI-powered suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Origin validation
    const origin = request.headers.get("origin");
    if (!validateOrigin(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed", success: false },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const allowed = await rateLimit(clientId, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW / 1000);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": (Math.floor(Date.now() / 1000) + Math.ceil(RATE_LIMIT_WINDOW / 1000)).toString()
          }
        }
      );
    }
    
    // Generate suggestion
    const geminiService = getGeminiService();
    const result: AISuggestionResponse = await geminiService.generateSuggestion();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate suggestion. Please try again later.", success: false },
        { status: 500 }
      );
    }

    // Success response
    const responseHeaders: Record<string, string> = {
      "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    };

    if (origin) {
      responseHeaders["Access-Control-Allow-Origin"] = origin;
    }

    return NextResponse.json(
      {
        suggestion: result.suggestion,
        success: true,
      },
      { headers: responseHeaders }
    );
    
  } catch (error) {
    console.error('AI suggestions generation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { error: "Internal server error. Please try again later.", success: false },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  if (!validateOrigin(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(null, { status: 200, headers });
}
