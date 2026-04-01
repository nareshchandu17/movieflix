import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Action } from "@/lib/models/Action";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Fetch action movies with pagination
    const actions = await Action.find()
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Action.countDocuments();

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
  } catch (error) {
    console.error("Error fetching action movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch action movies" },
      { status: 500 }
    );
  }
}
