"use client";
import React, { useRef } from "react";
import { IAction } from "@/lib/models/Action";
import { TMDBMovie } from "@/lib/types";
import EnhancedMediaCard from "../display/EnhancedMediaCard";
import SectionHeader from "../layout/SectionHeader";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const ActionSection = () => {
  const [data, setData] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch action movies from database
  useEffect(() => {
    const fetchActionData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/action?limit=66');
        if (!response.ok) {
          throw new Error('Failed to fetch action movies');
        }
        const result = await response.json();
        
        // Transform IAction data to TMDBMovie format
        const transformedData: TMDBMovie[] = (result.results || []).map((item: IAction) => ({
          id: item.id || 0,
          title: item.title || item.name || '',
          overview: item.overview || '',
          poster_path: item.poster_path || null,
          backdrop_path: item.backdrop_path || null,
          release_date: item.release_date || item.first_air_date || '',
          vote_average: item.vote_average || 0,
          vote_count: 0, // Default value since it's not in IAction
          genre_ids: [], // Default value since it's not in IAction
          adult: false, // Default value since it's not in IAction
          original_language: 'en', // Default value
          original_title: item.title || item.name || '',
          popularity: 0, // Default value since it's not in IAction
          video: false, // Default value since it's not in IAction
        }));
        
        setData(transformedData);
      } catch (error) {
        console.error('Error fetching action movies:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActionData();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-800 rounded"></div>
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-56 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <SectionHeader title="">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-bold text-white">Popular in Action</h2>
          <Link 
            href="/action-movies"
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors duration-300 group"
          >
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </SectionHeader>

      {/* Carousel Wrapper */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:opacity-100 hover:scale-110 chevron-btn-left border border-white/20"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 opacity-0 hover:opacity-100 hover:scale-110 chevron-btn-right border border-white/20"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 scrollbar-hide horizontal-scroll touch-scroll pl-4 sm:pl-0"
        >
          {data.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 scroll-snap-align-start"
            >
              <EnhancedMediaCard media={item} variant="horizontal" />
            </div>
          ))}
          {/* Add some padding at the end for better mobile scrolling */}
          <div className="flex-shrink-0 w-4 sm:w-6"></div>
          <div className="flex-shrink-0 w-12 md:w-20" />
        </div>
      </div>
    </div>
  );
};

export default ActionSection;
