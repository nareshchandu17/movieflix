import { getServerSession } from "next-auth";
export const dynamic = "force-dynamic";
import { authOptions } from "@/features/authentication/services/auth";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Movie from "@/features/movie/models/Movie";
import Series from "@/features/series/models/Series";
import Profile from "@/features/profile/models/Profile";
import { PlayerRoot } from "@/features/watch/components/player/PlayerRoot";
import RestrictedScreen from "@/features/watch/components/player/RestrictedScreen";
import { api } from "@/lib/api";

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
  
  // Basic validation: if ID is not a valid ObjectId and not a numeric TMDB ID, it's likely a 404
  const isObjectId = mongoose.isValidObjectId(id);
  const tmdbId = parseInt(id);
  const isValidTmdbId = !isNaN(tmdbId) && tmdbId > 0;

  if (!isObjectId && !isValidTmdbId) {
    notFound();
  }
  
  let { data: contentData, type: resolvedType } = await getContentFromDB(id, type);
  
  // Identify if the current URL is a placeholder/mock
  const isMockUrl = contentData?.videoUrl && (
    contentData.videoUrl.includes('commondatastorage') || 
    contentData.videoUrl.includes('sample-videos') ||
    contentData.videoUrl === 'https://example.com/video.mp4'
  );

  // If metadata is missing OR video URL is missing/mock (and we aren't looking for a specific episode), try TMDB fallback
  if (!contentData || (!contentData.videoUrl && !season && !episode) || isMockUrl) {
    const mType = (resolvedType === 'series' || type === 'tv' || type === 'series') ? 'tv' : 'movie';
    
    // Use tmdbId from contentData if available, otherwise use params.id
    const effectiveTmdbId = contentData?.tmdbId || tmdbId;

    try {
      if (effectiveTmdbId) {
        const [details, videoData, providersData] = await Promise.all([
          api.getDetails(mType, effectiveTmdbId),
          api.getVideos(mType, effectiveTmdbId).catch(() => ({ results: [] })),
          api.getWatchProviders(mType, effectiveTmdbId).catch(() => ({ results: {} }))
        ]);

        const usProviders = (providersData as any)?.results?.US || {};
        contentData.providers = usProviders;

        const videos = (videoData as any).results || [];
        const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
                     || videos.find((v: any) => v.site === 'YouTube');
        
        const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "";

        if (contentData) {
          // Update existing DB record metadata with trailer
          contentData.videoUrl = trailerUrl;
          contentData.tmdbDetails = details;
          if (!contentData.certification) {
            if (mType === 'tv') {
              contentData.certification = (details as any).content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating;
            } else {
              contentData.certification = (details as any).release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification;
            }
          }
        } else {
          // Create new content object from TMDB
          if (mType === 'tv') {
            contentData = { 
              title: (details as any).name || (details as any).original_name, 
              videoUrl: trailerUrl,
              certification: (details as any).content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating
            } as any;
            resolvedType = 'series';
          } else {
            contentData = { 
              title: (details as any).title || (details as any).original_title, 
              videoUrl: trailerUrl,
              certification: (details as any).release_dates?.results?.find((r: any) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification
            } as any;
            resolvedType = 'movie';
          }
        }
      }
    } catch (e: any) {
      if (contentData) {
        console.warn("[WatchPage] Optional TMDB Metadata Update Failed:", e.message);
      } else {
        console.error("[WatchPage] Critical TMDB Fetch Error:", e.message);
        
        if (e.status === 404 || e.code === 'NOT_FOUND') {
          notFound();
        }

        // Return an error UI rather than an empty player
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
            <div className="max-w-md text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Content Unavailable</h1>
              <p className="text-gray-400 text-lg">
                We're having trouble reaching the movie database right now. Please check your connection or try again in a few moments.
              </p>
              <div className="flex flex-col gap-4">
                <a 
                  href={`/watch/${id}`}
                  className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all text-center"
                >
                  Refresh Page
                </a>
                <p className="text-xs text-gray-500 italic">
                  Note: If this persists, the TMDB service may be temporarily down.
                </p>
                <Link
                  href="/"
                  className="px-8 py-3 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800 transition-all border border-zinc-800"
                >
                  Return Home
                </Link>
              </div>
              <p className="text-zinc-600 text-sm">
                Error Trace: {e.message || "Network Timeout"}
              </p>
            </div>
          </div>
        );
        
        contentData = { 
          title: `Content ${id}`, 
          videoUrl: "", 
          description: "Metadata currently unavailable due to network issues."
        } as any;
        resolvedType = (type === 'tv' || type === 'series') ? 'series' : 'movie';
      }
    }
  }

  // Enforcement check
  const cookieStore = await cookies();
  const profileId = cookieStore.get("mf_active_profile")?.value;
  const profile = await getActiveProfile(profileId, session.user.id);

  if (profile?.isKids) {
    const restrictedRatings = ["R", "TV-MA", "NC-17"];
    if (restrictedRatings.includes(contentData?.certification || '')) {
      return (
        <RestrictedScreen 
          title={contentData?.title || "Restricted Content"} 
          rating={contentData?.certification} 
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

  // The user requested to hardcode all videos to the local watchparty.mp4 for testing
  const finalVideoUrl = "/watchparty.mp4";

  return (
    <div className="min-h-screen bg-black">
      <PlayerRoot 
        contentId={id}
        url={finalVideoUrl}
        title={displayTitle}
        type={resolvedType as 'movie' | 'series'}
        contentData={JSON.parse(JSON.stringify(contentData))}
      />
    </div>
  );
}
