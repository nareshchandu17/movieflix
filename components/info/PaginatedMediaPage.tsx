"use client";
import React, { useState, useEffect } from "react";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import MediaCard from "../display/MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedMediaPageProps {
  title: string;
  description: string;
  mediaType: "movie" | "tv";
  category?: string;
  genreId?: number;
  itemsPerPage?: number;
}

const PaginatedMediaPage: React.FC<PaginatedMediaPageProps> = ({
  title,
  description,
  mediaType,
  category,
  genreId,
  itemsPerPage = 20,
}) => {
  const [data, setData] = useState<TMDBMovie[] | TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let response;
        
        if (genreId) {
          // Fetch by genre using discover
          response = await api.discover(mediaType, {
            page: currentPage,
            genre: genreId.toString(),
          });
        } else if (category) {
          // Fetch by category
          response = await api.getPopular(mediaType, currentPage);
        }
        
        if (response) {
          setData(response.results);
          setTotalPages(response.total_pages);
        }
      } catch (err) {
        setError("Failed to load content");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mediaType, category, genreId, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              {title}
            </h1>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            // Loading Grid
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <div key={index} className="aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                {data.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    variant="grid"
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 hover:bg-red-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-white font-medium">Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      const isNearCurrent = Math.abs(pageNum - currentPage) <= 2;
                      
                      if (!isNearCurrent && pageNum > 5 && pageNum < totalPages - 2) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                            isActive
                              ? 'bg-red-600 text-white'
                              : 'bg-black/80 text-gray-400 hover:bg-red-600/80 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 hover:bg-red-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="text-white font-medium">Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginatedMediaPage;
