import React from "react";
import MediaCard from "@/features/home/components/newpopular/MediaCard";
import ResponsiveGrid from "@/features/shared/components/layout/ResponsiveGrid";
import PaginationWrapper from "@/features/shared/components/layout/PaginationWrapper";
import { TMDBTVShow } from "@/lib/types";

interface TvDisplayProps {
  series?: TMDBTVShow[];
  pageid?: string | number;
  totalPages?: number;
}

const TvDisplay = ({ series, pageid, totalPages = 500 }: TvDisplayProps) => {
  // Use base URL with query params for pagination
  const baseUrl = `/series`;
  
  return (
    <>
      <ResponsiveGrid>
        {(series ?? []).map((serie, index) => (
          <MediaCard 
            key={serie.id} 
            media={serie} 
            index={index}
          />
        ))}
      </ResponsiveGrid>
      
      <PaginationWrapper 
        pageid={pageid}
        baseUrl={baseUrl}
        maxPage={totalPages}
      />
    </>
  );
};

export default TvDisplay;

