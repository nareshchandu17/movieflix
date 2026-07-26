"use client";
import React, { useEffect, useState, Suspense, lazy } from "react";
import { TMDBMovieDetail, TMDBCast, TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import MediaPoster from "@/features/shared/components/display/MediaPoster";
import MediaMeta from "@/features/movie/components/info/MediaMeta";
import MediaPlayer from "@/features/shared/components/display/MediaPlayer";
import DidYouKnowSection from "@/features/movie/components/info/DidYouKnowSection";
import { InfoLoading } from "@/features/shared/components/loading/PageLoading";
import InfoNotFound from "@/features/shared/components/not-found/InfoNotFound";
import MediaDetailLayout from "@/features/shared/components/layout/MediaDetailLayout";
import { MovieReactionsSection } from "@/features/social/components/fan-reactions/MovieReactionsSection";

// Code splitting for large components
const MovieDetailHeader = lazy(() => import("./MovieDetailHeader"));
const MovieComments = lazy(() => import("./MovieComments"));

interface MovieDetailConsolidatedProps {
  id: number;
}

const MovieDetailConsolidated: React.FC<MovieDetailConsolidatedProps> = ({ id }) => {
  const [movieData, setMovieData] = useState<TMDBMovieDetail | null>(null);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareButtonPosition, setShareButtonPosition] = useState({ top: 0, left: 0 });

  // Calculate movie insights
  const calculateMovieInsights = (movie: TMDBMovieDetail) => {
    const audienceLove = Math.min(95, Math.max(20, Math.round((movie.vote_average || 5) * 10 + (movie.vote_count || 0) / 10000)));

    const rewatchValue = Math.min(5, Math.max(1,
      ((movie.vote_average || 5) / 10) * 2 +
      (movie.popularity || 10) / 50 +
      (movie.runtime ? (movie.runtime > 120 ? 0.5 : movie.runtime > 90 ? 1 : 1.5) : 1)
    ));

    const genres = movie.genres || [];
    const hasAction = genres.some(g => g.name.toLowerCase().includes('action'));
    const hasThriller = genres.some(g => g.name.toLowerCase().includes('thriller'));
    const hasHorror = genres.some(g => g.name.toLowerCase().includes('horror'));
    const rating = movie.vote_average || 5;

    let intensity: 'Low' | 'Medium' | 'High' = 'Medium';
    if (hasAction || hasThriller || hasHorror || rating > 7) {
      intensity = 'High';
    } else if (rating > 6 || hasAction) {
      intensity = 'Medium';
    } else {
      intensity = 'Low';
    }

    let bestWatchTime: 'Day' | 'Night' | 'Weekend' = 'Night';
    if (hasHorror || hasThriller || (hasAction && rating > 7)) {
      bestWatchTime = 'Night';
    } else if (genres.some(g => g.name.toLowerCase().includes('comedy') || g.name.toLowerCase().includes('family'))) {
      bestWatchTime = 'Day';
    }

    const movieMood: string[] = [];
    if (hasHorror || hasThriller) movieMood.push('Dark');
    if (hasAction) movieMood.push('Thrilling');
    if (rating > 7.5) movieMood.push('Engaging');
    if (genres.some(g => g.name.toLowerCase().includes('romance'))) movieMood.push('Romantic');
    if (genres.some(g => g.name.toLowerCase().includes('comedy'))) movieMood.push('Light-hearted');
    if (movieMood.length === 0) movieMood.push('Dramatic');

    const sceneComposition: { name: string; value: number; color: string }[] = [
      { name: 'Action', value: hasAction ? 35 + Math.random() * 20 : 5 + Math.random() * 10, color: '#FF2E63' },
      { name: 'Drama', value: 25 + Math.random() * 15, color: '#8B5CF6' },
      { name: 'Comedy', value: genres.some(g => g.name.toLowerCase().includes('comedy')) ? 15 + Math.random() * 10 : 5 + Math.random() * 5, color: '#F59E0B' },
      { name: 'Romance', value: genres.some(g => g.name.toLowerCase().includes('romance')) ? 10 + Math.random() * 10 : 3 + Math.random() * 5, color: '#EC4899' },
      { name: 'Dialogue', value: 20 + Math.random() * 10, color: '#22D3EE' },
    ];

    const total = sceneComposition.reduce((sum, scene) => sum + scene.value, 0);
    sceneComposition.forEach(scene => {
      scene.value = Math.round((scene.value / total) * 100);
    });

    return {
      audienceLove,
      rewatchValue: Math.round(rewatchValue * 10) / 10,
      intensity,
      bestWatchTime,
      movieMood: movieMood.slice(0, 3),
      sceneComposition
    };
  };

  const [movieInsights, setMovieInsights] = useState({
    audienceLove: 63,
    rewatchValue: 4.2,
    intensity: 'High' as 'Low' | 'Medium' | 'High',
    bestWatchTime: 'Night' as 'Day' | 'Night' | 'Weekend',
    movieMood: ['Dark', 'Thrilling', 'Engaging'] as string[],
    sceneComposition: [
      { name: 'Action', value: 42, color: '#FF2E63' },
      { name: 'Drama', value: 28, color: '#8B5CF6' },
      { name: 'Comedy', value: 10, color: '#F59E0B' },
      { name: 'Romance', value: 7, color: '#EC4899' },
      { name: 'Dialogue', value: 13, color: '#22D3EE' },
    ] as { name: string; value: number; color: string }[]
  });

  useEffect(() => {
    let isMounted = true;

    const fetchMovieData = async () => {
      const parsedId = parseInt(id.toString(), 10);
      if (isNaN(parsedId) || parsedId <= 0 || !/^\d+$/.test(id?.toString().trim() || "")) {
        setNotFound(true);
        setMovieData(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [movie, credits, similar, videos] = await Promise.all([
          api.getDetails("movie", parsedId) as Promise<TMDBMovieDetail>,
          api.getCredits("movie", parsedId),
          api.getSimilar("movie", parsedId),
          api.getVideos("movie", parsedId)
        ]);

        if (!isMounted) return;

        setMovieData(movie);
        setCast(credits.cast.slice(0, 15));
        const similarMoviesFiltered = similar.results.filter(item => 'title' in item) as TMDBMovie[];
        setSimilarMovies(similarMoviesFiltered.slice(0, 15));

        const trailer = videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        const insights = calculateMovieInsights(movie);
        setMovieInsights(insights);

        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;

        const error_ = error as Error & { status?: number; code?: string };

        if (error_.status === 404 || error_.code === "NOT_FOUND") {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    };

    fetchMovieData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToWatchlist = () => {
    if (movieData) {
      toast.success("Added to watchlist");
    }
  };

  const handleShare = async (platform: string) => {
    if (!movieData) return;

    const url = window.location.href;
    const title = movieData.title;
    const text = `Check out "${title}" on MovieFlix!`;

    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
          setShowShareMenu(false);
          return;
        } catch (err) {
          toast.error('Failed to copy link');
          return;
        }
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  if (notFound) {
    return <InfoNotFound />;
  }

  if (isLoading || !movieData) {
    return <InfoLoading>Loading Movie Details</InfoLoading>;
  }

  const title = movieData.title || movieData.original_title || "Unknown Title";
  const releaseYear = movieData.release_date ? movieData.release_date.slice(0, 4) : undefined;

  const mediaForWatchlist = movieData ? {
    id: movieData.id,
    title: movieData.title,
    overview: movieData.overview,
    poster_path: movieData.poster_path,
    backdrop_path: movieData.backdrop_path,
    release_date: movieData.release_date,
    vote_average: movieData.vote_average,
    vote_count: movieData.vote_count,
    popularity: movieData.popularity,
    genre_ids: (movieData.genres?.map((g) => g.id).filter((id): id is number => typeof id === 'number')) || [],
    adult: movieData.adult,
    original_language: movieData.original_language,
    original_title: movieData.original_title,
    video: false,
  } : null;

  return (
    <MediaDetailLayout className="pt-16">
      <Suspense fallback={<InfoLoading>Loading movie details...</InfoLoading>}>
        <MovieDetailHeader
          movie={movieData}
          trailerKey={trailerKey}
          onAddToWatchlist={handleAddToWatchlist}
          onShare={handleShare}
          showShareMenu={showShareMenu}
          shareButtonPosition={shareButtonPosition}
          setShowShareMenu={setShowShareMenu}
          setShareButtonPosition={setShareButtonPosition}
          movieInsights={movieInsights}
        />
      </Suspense>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Fan Reactions Section */}
        <MovieReactionsSection movieId={id} />

        {/* Video Player Section */}
        <MediaPlayer mediaId={id} title={title} type="movie" />

        {/* Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <MediaPoster
              posterPath={movieData.poster_path}
              title={title}
              className="mx-auto lg:mx-0"
            />
          </div>

          <div className="lg:col-span-3">
            <MediaMeta
              type="movie"
              title={title}
              year={releaseYear}
              rating={movieData.vote_average}
              ratingCount={movieData.vote_count}
              runtime={movieData.runtime}
              genres={movieData.genres?.map(g => g.name) || []}
              overview={movieData.overview}
              media={mediaForWatchlist!}
            />
          </div>
        </div>

        {/* Did You Know Section */}
        <DidYouKnowSection title={title} movieData={movieData} />

        {/* Comments Section */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <h2 className="text-2xl font-bold text-white mb-6">Comments & Reviews</h2>
          <Suspense fallback={<InfoLoading>Loading comments...</InfoLoading>}>
            <MovieComments movieId={id} />
          </Suspense>
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default MovieDetailConsolidated;

