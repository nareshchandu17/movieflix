"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const FilterBar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSort, setSelectedSort] = useState("trending");
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const formats = [
    { value: "all", label: "All" },
    { value: "movies", label: "Movies" },
    { value: "series", label: "Series" },
    { value: "originals", label: "Originals" }
  ];

  const genres = [
    { value: "", label: "All Genres" },
    { value: "action", label: "Action" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
    { value: "scifi", label: "Sci-Fi" },
    { value: "thriller", label: "Thriller" },
    { value: "romance", label: "Romance" },
    { value: "horror", label: "Horror" }
  ];

  const sortOptions = [
    { value: "trending", label: "Trending" },
    { value: "newest", label: "Newest" },
    { value: "for-you", label: "For You" },
    { value: "critics", label: "Critics" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > window.innerHeight * 0.7);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Initialize from URL params
    const format = searchParams?.get('format') || 'all';
    const genre = searchParams?.get('genre') || '';
    const sort = searchParams?.get('sort') || 'trending';
    
    setSelectedFormat(format);
    setSelectedGenre(genre);
    setSelectedSort(sort);
  }, [searchParams]);

  const updateFilters = (updates: { format?: string; genre?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (updates.format !== undefined) {
      updates.format === 'all' ? params.delete('format') : params.set('format', updates.format);
    }
    if (updates.genre !== undefined) {
      updates.genre === '' ? params.delete('genre') : params.set('genre', updates.genre);
    }
    if (updates.sort !== undefined) {
      updates.sort === 'trending' ? params.delete('sort') : params.set('sort', updates.sort);
    }

    const newURL = params.toString() ? `/new-popular?${params.toString()}` : '/new-popular';
    router.push(newURL, { scroll: false });
  };

  return (
    <div className={`
      bg-gradient-to-r from-black/80 via-black/60 to-black/80 border-b border-white/20 backdrop-blur-xl transition-all duration-300 shadow-lg
      ${isSticky ? 'fixed top-16 left-0 right-0 z-40 shadow-2xl shadow-black/50 bg-black/95' : 'relative'}
    `}>
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Format Filters */}
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-sm font-semibold">Format:</span>
            <div className="flex gap-2">
              {formats.map((format) => (
                <Button
                  key={format.value}
                  variant={selectedFormat === format.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSelectedFormat(format.value);
                    updateFilters({ format: format.value });
                  }}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border
                    ${selectedFormat === format.value
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/30 shadow-lg shadow-red-500/25 hover:scale-105'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/10 border-white/20 hover:border-white/30 hover:shadow-md'
                    }
                  `}
                >
                  {format.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-sm font-semibold">Genre:</span>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 backdrop-blur-sm text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB] px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg border-white/30"
              >
                {genres.find(g => g.value === selectedGenre)?.label || 'All Genres'}
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden hidden min-w-[150px]">
                {genres.map((genre) => (
                  <button
                    key={genre.value}
                    onClick={() => {
                      setSelectedGenre(genre.value);
                      updateFilters({ genre: genre.value });
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-[#9CA3AF] hover:bg-white/10 hover:text-[#F9FAFB] transition-all duration-200 border-b border-white/5 last:border-b-0"
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-sm font-semibold">Sort:</span>
            <div className="flex gap-2">
              {sortOptions.map((sort) => (
                <Button
                  key={sort.value}
                  variant={selectedSort === sort.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setSelectedSort(sort.value);
                    updateFilters({ sort: sort.value });
                  }}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border
                    ${selectedSort === sort.value
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500/30 shadow-lg shadow-blue-500/25 hover:scale-105'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/10 border-white/20 hover:border-white/30 hover:shadow-md'
                    }
                  `}
                >
                  {sort.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
