import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Movie from "@/features/movie/models/Movie";
import Series from "@/features/series/models/Series";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Fetch a selection of movies and series to watch
    const movies = await Movie.find({}, "title posterUrl year releaseDate genres tmdbId").limit(20).lean();
    const series = await Series.find({}, "title posterUrl year genres tmdbId").limit(20).lean();

    const items = [
      ...movies.map((m: any) => ({
        ...m,
        id: m._id.toString(),
        year: m.year ?? m.releaseDate?.getFullYear() ?? null,
        type: "movie",
      })),
      ...series.map((s: any) => ({
        ...s,
        id: s._id.toString(),
        year: s.year ?? null,
        type: "series",
      }))
    ];

    const selectedMovieId = new URL(req.url).searchParams.get("movieId");
    if (selectedMovieId && !items.some((item) => (
      item.id === selectedMovieId || item.tmdbId?.toString() === selectedMovieId
    ))) {
      const query = /^[a-f\d]{24}$/i.test(selectedMovieId)
        ? { _id: selectedMovieId }
        : /^\d+$/.test(selectedMovieId)
          ? { tmdbId: Number(selectedMovieId) }
          : null;

      if (query) {
        const selectedMovie = await Movie.findOne(query)
          .select("title posterUrl year releaseDate genres tmdbId")
          .lean();
        const selectedSeries = selectedMovie
          ? null
          : await Series.findOne(query).select("title posterUrl year genres tmdbId").lean();
        const selectedItem: any = selectedMovie || selectedSeries;

        if (selectedItem) {
          items.unshift({
            ...selectedItem,
            id: selectedItem._id.toString(),
            year: selectedItem.year ?? selectedItem.releaseDate?.getFullYear() ?? null,
            type: selectedMovie ? "movie" : "series",
          });
        }
      }
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("❌ Failed to fetch watchable items:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
