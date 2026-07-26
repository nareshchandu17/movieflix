import React from "react";
import MediaCard from "@/features/home/components/newpopular/MediaCard";
import ResponsiveGrid from "@/features/shared/components/layout/ResponsiveGrid";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface SearchDisplayProps {
  movies: (TMDBMovie | TMDBTVShow)[];
}

const SearchDisplay = ({ movies }: SearchDisplayProps) => {
  return (
    <ResponsiveGrid minHeight={true}>
      {movies?.map((movie, index) => (
        <MediaCard 
          key={movie.id} 
          media={movie} 
          index={index}
        />
      ))}
    </ResponsiveGrid>
  );
};

export default SearchDisplay;

