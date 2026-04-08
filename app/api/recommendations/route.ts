import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import WatchHistory from "@/models/WatchHistory";
import Movie from "@/models/Movie";
import Series from "@/models/Series";
import { withContentFilter } from "@/lib/contentFilterMiddleware";

async function recommendationsHandler(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const history = await WatchHistory.find({ userId: session.user.id }).sort({ lastWatched: -1 }).limit(10);
    
    // Extract recent watched content IDs to avoid recommending them again
    const watchedIds = history.map(h => h.contentId);

    // 1. Content-Based Filtering: Build user profile based on history
    let preferredGenres = new Set(user.preferences?.genres || []);
    let preferredActors = new Set<string>();

    for (const item of history) {
        const contentModel = item.contentType === 'Movie' ? Movie : Series;
        const content = await contentModel.findById(item.contentId);
        
        if (content) {
            content.genres.forEach((g: string) => preferredGenres.add(g));
            content.actors.forEach((a: string) => preferredActors.add(a));
        }
    }

    // Convert sets back to arrays, and fallback to generic popular genres if none
    const genresArray = Array.from(preferredGenres).length > 0 ? Array.from(preferredGenres) : ['Action', 'Comedy', 'Drama', 'Sci-Fi'];
    const actorsArray = Array.from(preferredActors);

    // Fetch recommendations based on genres or actors, excluding already watched items
    const movieRecs = await Movie.find({
        _id: { $nin: watchedIds },
        $or: [
            { genres: { $in: genresArray } },
            { actors: { $in: actorsArray } }
        ]
    }).limit(10);

    const seriesRecs = await Series.find({
        _id: { $nin: watchedIds },
        $or: [
            { genres: { $in: genresArray } },
            { actors: { $in: actorsArray } }
        ]
    }).limit(10);

    // 2. Simple Collaborative Filtering stub
    // Find what similar users watched (users who watched the same things)
    const similarUsersHistory = await WatchHistory.find({
        userId: { $ne: session.user.id },
        contentId: { $in: watchedIds }
    }).limit(50);
    
    const potentialCollabIds = similarUsersHistory.map(h => h.contentId).filter(id => !watchedIds.includes(id));
    
    // Grab some of those collaborative recommendations
    const collabMovies = await Movie.find({ _id: { $in: potentialCollabIds } }).limit(5);

    // Combine and shuffle
    const combinedRecs = [...movieRecs, ...seriesRecs, ...collabMovies]
        .map(item => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);

    // Ensure uniqueness based on ID
    const uniqueRecs = Array.from(new Map(combinedRecs.map(item => [item._id.toString(), item])).values());

    return NextResponse.json({ 
      success: true,
      data: uniqueRecs.slice(0, 15)
    }, { status: 200 });

  } catch (error) {
    console.error("Recommendations GET error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate recommendations" 
    }, { status: 500 });
  }
}

// Export the handler with content filtering applied
export const GET = withContentFilter(recommendationsHandler);
