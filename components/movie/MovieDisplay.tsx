"use client"
import React from "react";
import MediaCard from "../display/MediaCard";
import ResponsiveGrid from "../layout/ResponsiveGrid";
import PaginationWrapper from "../layout/PaginationWrapper";
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
        {movies?.map((movie) => (
          <MediaCard 
            key={movie.id} 
            media={movie} 
            variant="grid"
            hoveredMovieId={hoveredMovieId}
            setHoveredMovieId={setHoveredMovieId}
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
