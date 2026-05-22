import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Series from "@/models/Series";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Fetch a selection of movies and series to watch
    const movies = await Movie.find({}, "title posterUrl year genres").limit(20).lean();
    const series = await Series.find({}, "title posterUrl year genres").limit(20).lean();

    const items = [
      ...movies.map((m: any) => ({ ...m, id: m._id.toString(), type: "movie" })),
      ...series.map((s: any) => ({ ...s, id: s._id.toString(), type: "series" }))
    ];

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("❌ Failed to fetch watchable items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
