import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Movie from "@/models/Movie";
import Series from "@/models/Series";
import Profile from "@/lib/models/Profile";
import { PlayerRoot } from "@/components/player/PlayerRoot";
import RestrictedScreen from "@/components/player/RestrictedScreen";

async function getContentFromDB(id: string, type: string = 'movie') {
  try {
    await connectDB();
    
    const isObjectId = mongoose.isValidObjectId(id);
    
    if (type === 'tv' || type === 'series') {
      // Find series by ObjectId or tmdbId
      const series = isObjectId 
        ? await Series.findById(id).lean() 
        : await Series.findOne({ tmdbId: parseInt(id) }).lean();
      return { data: series, type: 'series' };
    } else {
      // Find movie by ObjectId or tmdbId
      const movie = isObjectId 
        ? await Movie.findById(id).lean() 
        : await Movie.findOne({ tmdbId: parseInt(id) }).lean();
      return { data: movie, type: 'movie' };
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    return { data: null, type: 'movie' };
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

export default async function WatchPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ type?: string; season?: string; episode?: string }>
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const { type, season, episode } = await searchParams;
  
  const { data: contentData, type: resolvedType } = await getContentFromDB(id, type);
  
  if (!contentData) {
    notFound();
  }

  // Enforcement check
  const cookieStore = await cookies();
  const profileId = cookieStore.get("mf_active_profile")?.value;
  const profile = await getActiveProfile(profileId, session.user.id);

  if (profile?.isKids) {
    const restrictedRatings = ["R", "TV-MA", "NC-17"];
    if (restrictedRatings.includes(contentData.certification || '')) {
      return (
        <RestrictedScreen 
          title={contentData.title} 
          rating={contentData.certification} 
        />
      );
    }
  }

  // Handle video URL and title for episodes
  let videoUrl = contentData.videoUrl;
  let displayTitle = contentData.title;

  if (resolvedType === 'series' && season && episode) {
    const sNum = parseInt(season);
    const eNum = parseInt(episode);
    
    const seasonData = contentData.seasons?.find((s: any) => s.seasonNumber === sNum);
    const episodeData = seasonData?.episodes?.find((e: any) => e.episodeNumber === eNum);
    
    if (episodeData) {
      if (episodeData.videoUrl) videoUrl = episodeData.videoUrl;
      displayTitle = `${contentData.title} - S${sNum}E${eNum}: ${episodeData.title}`;
    }
  }

  if (!videoUrl) {
    // Fallback or error if no video URL found
    console.warn(`No video URL for content ${id}`);
  }

  return (
    <div className="min-h-screen bg-black">
      <PlayerRoot 
        contentId={id}
        url={videoUrl || ""}
        title={displayTitle}
        type={resolvedType as 'movie' | 'series'}
      />
    </div>
  );
}
