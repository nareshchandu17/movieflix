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
        
        const person = await tmdbAPI.searchPerson(actorName);
        if (!person) {
          throw new Error("Actor not found");
        }
        
        setActor(person);
        
        const response = await fetch(`/api/tmdb/person/${person.id}/credits`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch actor movies");
        }
        
        const data = await response.json();
        const actorMovies = data.cast
          .filter((movie: any) => movie.poster_path)
          .slice(0, 20)
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
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-red-400 transition-colors duration-300"
        >
          <span className="text-2xl">←</span>
          <span className="text-xl font-bold">Back to Actors</span>
        </button>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            {actor.profile_path ? (
              <div className="relative w-48 h-72 md:w-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/20">
                <Image
                  src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                  alt={actor.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-72 md:w-64 md:h-96 rounded-2xl bg-gray-800 flex items-center justify-center shadow-2xl shadow-gray-500/20">
                <span className="text-gray-500 text-6xl">👤</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
              {actor.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-300">
              {actor.birthday && (
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Born:</span>
                  <span>{new Date(actor.birthday).toLocaleDateString()}</span>
                </div>
              )}
              {actor.place_of_birth && (
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Place:</span>
                  <span>{actor.place_of_birth}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-red-400">Popularity:</span>
                <span>{actor.popularity?.toFixed(1)}</span>
              </div>
            </div>

            {actor.biography && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2">Biography</h2>
                <p className="text-gray-300 leading-relaxed line-clamp-6 hover:line-clamp-none transition-all">
                  {actor.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
            Known For
          </h2>
          {movies && movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`}>
                  <div className="group relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-red-500/50 transition-all duration-300 cursor-pointer">
                    <div className="relative aspect-[2/3]">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-500 text-4xl">🎬</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white font-bold text-sm truncate mb-1">
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
