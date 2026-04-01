"use client";

import { useEffect, useState } from "react";
import ActorCard from "./ActorCard";
import { tmdbAPI } from "@/lib/api/tmdb";
import { ACTORS_DATA } from "@/lib/data/actorsData";

interface Actor {
  name: string;
  profileURL: string;
  id: number;
}

const ActorsPage: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const fetchAllActors = async () => {
      try {
        setLoading(true);
        const actorsData = await tmdbAPI.getMultipleActors(ACTORS_DATA);
        setActors(actorsData);
      } catch (err) {
        setError("Failed to load actors");
        console.error("Error fetching actors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllActors();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition > scrollHeight * 0.8) {
        setVisibleCount(prev => Math.min(prev + 20, actors.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [actors.length]);

  // Group actors by industry
  const hollywoodActors = actors.slice(0, 60);
  const bollywoodActors = actors.slice(60, 85);
  const tollywoodActors = actors.slice(85, 95);
  const kollywoodActors = actors.slice(95);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
        </div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Global Actors Collection
            </h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
              Explore the world's most talented actors from Hollywood, Bollywood, Tollywood, and Kollywood. 
              From legendary performances to modern icons, discover the faces that bring stories to life.
            </p>

            {/* Industry Stats */}
            <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
              <span className="px-3 py-1 bg-white/10 rounded-full">Hollywood: 60</span>
              <span className="px-3 py-1 bg-white/10 rounded-full">Bollywood: 25</span>
              <span className="px-3 py-1 bg-white/10 rounded-full">Tollywood: 10</span>
              <span className="px-3 py-1 bg-white/10 rounded-full">Kollywood: 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actors Grid by Industry */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Hollywood Actors */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-0.5 bg-gradient-to-r from-red-500 to-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Hollywood Legends</h2>
              <p className="text-gray-400 text-sm">International cinema icons</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {loading ? (
                // Loading Grid
                Array.from({ length: 24 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700/50" />
                    <div className="w-24 h-4 bg-gray-800 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                ))
              ) : (
                hollywoodActors.slice(0, visibleCount).map((actor, index) => (
                  <div
                    key={actor.id}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <ActorCard
                      name={actor.name}
                      profileURL={actor.profileURL}
                      id={actor.id}
                      size="large"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bollywood Actors */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Bollywood Superstars</h2>
              <p className="text-gray-400 text-sm">Indian cinema legends</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {loading ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700/50" />
                    <div className="w-24 h-4 bg-gray-800 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                ))
              ) : (
                bollywoodActors.slice(0, Math.max(0, visibleCount - 60)).map((actor, index) => (
                  <div
                    key={actor.id}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <ActorCard
                      name={actor.name}
                      profileURL={actor.profileURL}
                      id={actor.id}
                      size="large"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tollywood Actors */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-2 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white">Tollywood Titans</h2>
              <p className="text-gray-400 text-sm">South Indian cinema icons</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700/50" />
                    <div className="w-24 h-4 bg-gray-800 animate-pulse rounded" />
                    <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                  </div>
                ))
              ) : (
                tollywoodActors.slice(0, Math.max(0, visibleCount - 85)).map((actor, index) => (
                  <div
                    key={actor.id}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <ActorCard
                      name={actor.name}
                      profileURL={actor.profileURL}
                      id={actor.id}
                      size="large"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kollywood Actors */}
          {kollywoodActors.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-2 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-white">Kollywood Stars</h2>
                <p className="text-gray-400 text-sm">Malayalam cinema legends</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-3">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-800 animate-pulse border-2 border-gray-700/50" />
                      <div className="w-24 h-4 bg-gray-800 animate-pulse rounded" />
                      <div className="w-16 h-3 bg-gray-800 animate-pulse rounded" />
                    </div>
                  ))
                ) : (
                  kollywoodActors.slice(0, Math.max(0, visibleCount - 95)).map((actor, index) => (
                    <div
                      key={actor.id}
                      className="opacity-0 animate-fade-in"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <ActorCard
                        name={actor.name}
                        profileURL={actor.profileURL}
                        id={actor.id}
                        size="large"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Load More Indicator */}
          {!loading && visibleCount < actors.length && (
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Loading more actors...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ActorsPage;
