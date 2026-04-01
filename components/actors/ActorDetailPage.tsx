"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { TMDBPerson, TMDBMovie } from "@/lib/types";
import { tmdbAPI } from "@/lib/api/tmdb";

interface ActorDetailPageProps {
  actorName: string;
}

const ActorDetailPage: React.FC<ActorDetailPageProps> = ({ actorName }) => {
  const [actor, setActor] = useState<TMDBPerson | null>(null);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        setLoading(true);
        
        // Search for the actor
        const person = await tmdbAPI.searchPerson(actorName);
        if (!person) {
          throw new Error("Actor not found");
        }
        
        setActor(person);
        
        // Fetch actor's movies using TMDB API
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch actor movies");
        }
        
        const data = await response.json();
        const actorMovies = data.cast
          .filter((movie: any) => movie.poster_path)
          .slice(0, 20) // Limit to 20 movies
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            genre_ids: movie.genre_ids,
            adult: movie.adult,
            original_language: movie.original_language,
            original_title: movie.original_title,
            popularity: movie.popularity,
            video: movie.video,
          }));
        
        setMovies(actorMovies);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load actor details");
        console.error("Error fetching actor details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActorDetails();
  }, [actorName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700/50" />
          <div className="w-48 h-6 mx-auto mb-2 bg-gray-800 animate-pulse rounded" />
          <div className="w-64 h-4 mx-auto bg-gray-800 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-400 text-lg">{error || "Actor not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors duration-300"
        >
          <span className="text-2xl">←</span>
          <span className="text-xl font-bold">Back to Actors</span>
        </button>
      </div>

      {/* Actor Information */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Actor Image */}
            <div className="flex-shrink-0">
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl shadow-red-500/20">
                <Image
                  src={tmdbAPI.getProfileURL(actor.profile_path)}
                  alt={actor.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Actor Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">{actor.name}</h1>
                <p className="text-xl text-gray-400 mb-4">{actor.known_for_department}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 rounded" />
                  <span>{movies.length} Movies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  <span>Popular Actor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span>Active</span>
                </div>
              </div>

              {/* Biography */}
              {actor.biography && (
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">Biography</h3>
                  <p className="text-gray-300 leading-relaxed line-clamp-4">
                    {actor.biography}
                  </p>
                </div>
              )}

              {/* Known For */}
              {actor.known_for && actor.known_for.length > 0 && (
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-3">Known For</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {actor.known_for.slice(0, 3).map((work) => (
                      <div key={work.id} className="flex items-center gap-3">
                        <Image
                          src={tmdbAPI.getProfileURL(work.poster_path)}
                          alt={work.title || work.name}
                          width={60}
                          height={90}
                          className="w-12 h-16 object-cover rounded-lg"
                          unoptimized
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm line-clamp-1">
                            {work.title || work.name}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {work.title ? "Movie" : "TV Show"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Movies</h2>
            <p className="text-gray-400">Complete filmography of {actor.name}</p>
          </div>

          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="block"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-white/10 transition-all duration-300 hover:scale-105 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20">
                    <Image
                      src={tmdbAPI.getProfileURL(movie.poster_path)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Movie Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        {movie.vote_average > 0 && (
                          <span className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded" />
                            <span>⭐ {movie.vote_average.toFixed(1)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No movies found for this actor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActorDetailPage;
