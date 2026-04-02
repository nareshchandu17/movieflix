import React from "react";
import {
  Star,
  Calendar,
  Clock,
  Users,
  Tv,
  Plus,
  Bookmark,
} from "lucide-react";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import CollectionPopup from "../collections/CollectionPopup";
import { Button } from "../ui/button";

interface MediaMetaProps {
  type: "movie" | "tv";
  title: string;
  year?: string;
  rating?: number;
  ratingCount?: number;
  runtime?: number | null;
  seasons?: number;
  episodes?: number;
  genres: string[];
  overview?: string;
  className?: string;
  // Media data for watchlist functionality
  media: TMDBMovie | TMDBTVShow;
}

/**
 * MediaMeta - Modern metadata component for movies and TV shows
 * Features responsive design with beautiful icons and glass morphism
 */
const MediaMeta = ({
  type,
  title,
  year,
  rating,
  ratingCount,
  runtime,
  seasons,
  episodes,
  genres,
  overview,
  media,
  className = "",
}: MediaMetaProps) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | undefined>(undefined);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plusButtonRef.current) {
      setAnchorRect(plusButtonRef.current.getBoundingClientRect());
    }
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="glass-container space-y-4 relative">
        {/* Media Type Badge */}
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm font-medium">
            {type === "movie" ? "Movie" : "TV Series"}
          </div>
        </div>

        {/* Title and Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            {title}
          </h1>
          
          <Button
            ref={plusButtonRef}
            onClick={(e) => handleAddClick(e)}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-12 px-6 transition-all"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="font-semibold">Save to Collection</span>
          </Button>
        </div>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap items-center gap-4 text-gray-300">
          {year && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">{year}</span>
            </div>
          )}

          {type === "movie" && runtime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{runtime} min</span>
            </div>
          )}

          {type === "tv" && seasons && (
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {seasons} Season{seasons !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {type === "tv" && episodes && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {episodes} Episode{episodes !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-red-500 fill-current" />
              <span className="font-bold text-white">{rating?.toFixed(1)}</span>
              {ratingCount && (
                <span className="text-sm text-gray-400">
                  ({ratingCount?.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 
                           rounded-full text-xs font-medium smooth-transition hover:bg-primary/20 
                           hover:scale-105"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Overview */}
        {overview && (
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
            <p className="text-gray-300 leading-relaxed text-sm">{overview}</p>
          </div>
        )}

        {/* Collection Popup */}
        <AnimatePresence>
          {isPopupOpen && (
            <CollectionPopup
              media={media}
              onClose={() => setIsPopupOpen(false)}
              anchorRect={anchorRect}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MediaMeta;
