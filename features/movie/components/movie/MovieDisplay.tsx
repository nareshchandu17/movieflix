"use client"
import React from "react";
import MediaCard from "@/features/home/components/newpopular/MediaCard";
import ResponsiveGrid from "@/features/shared/components/layout/ResponsiveGrid";
import PaginationWrapper from "@/features/shared/components/layout/PaginationWrapper";
import { TMDBMovie } from "@/lib/types";

interface MovieDisplayProps {
  movies?: TMDBMovie[];
  pageid?: string;
  totalPages?: number;
  hoveredMovieId?: number | null;
  setHoveredMovieId?: (id: number | null) => void;
  infiniteScroll?: boolean;
}

const MovieDisplay= ({ movies, pageid, totalPages = 500, hoveredMovieId, setHoveredMovieId, infiniteScroll = false }: MovieDisplayProps) => {
  // Use base URL with query params for pagination
  const baseUrl = `/movie`;
  
  return (
    <>
      <ResponsiveGrid>
        {movies?.map((movie, index) => (
          <MediaCard 
            key={movie.id} 
            media={movie} 
            index={index}
          />
        ))}
      </ResponsiveGrid>
      
      {/* Only show pagination if not using infinite scroll */}
      {!infiniteScroll && (
        <PaginationWrapper 
          pageid={pageid}
          baseUrl={baseUrl}
          maxPage={totalPages}
        />
      )}
    </>
  );
};

export default MovieDisplay;

