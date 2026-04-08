import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Profile from "@/lib/models/Profile";
import { PlayerRoot } from "@/components/player/PlayerRoot";
import RestrictedScreen from "@/components/player/RestrictedScreen";

async function getMovieFromDB(id: string) {
  try {
    await connectDB();
    const movie = await Movie.findById(id).lean();
    return movie;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

async function getActiveProfile(profileId: string | undefined, userId: string) {
  if (!profileId) return null;
  try {
    const profile = await Profile.findOne({ profileId, userId }).lean();
    return profile;
  } catch (e) {
    return null;
  }
}

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const movieData = await getMovieFromDB(id);
  
  if (!movieData) {
    notFound();
  }

  // Enforcement check
  const cookieStore = await cookies();
  const profileId = cookieStore.get("mf_active_profile")?.value;
  const profile = await getActiveProfile(profileId, session.user.id);

  if (profile?.isKids) {
    const restrictedRatings = ["R", "TV-MA", "NC-17"];
    if (restrictedRatings.includes(movieData.certification)) {
      return (
        <RestrictedScreen 
          title={movieData.title} 
          rating={movieData.certification} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <PlayerRoot 
        contentId={id}
        url={movieData.videoUrl}
        title={movieData.title}
        type="movie"
      />
    </div>
  );
}
