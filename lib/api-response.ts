import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
  success: true;
  timestamp: string;
}

export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      details,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
