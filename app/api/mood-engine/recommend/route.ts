import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { matchMoodToMovies } from "@/lib/moodEngine";
import Movie from "@/models/Movie";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, intensity, runtime, familiarity } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Mood description is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const recommendations = await matchMoodToMovies(userId, text, {
      intensity,
      runtime,
      familiarity
    });

    // Populate full movie details
    const populatedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const movie = await Movie.findById(rec.contentId).lean();
        return {
          ...rec,
          movie
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      recommendations: populatedRecommendations 
    });

  } catch (error) {
    console.error("Mood recommendation failed:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
