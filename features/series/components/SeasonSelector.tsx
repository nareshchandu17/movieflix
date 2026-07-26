import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { TMDBSeason } from "@/lib/types";

interface SeasonSelectorProps {
  seasons: TMDBSeason[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
}

export const SeasonSelector = ({ seasons, selectedSeason, onSeasonChange }: SeasonSelectorProps) => {
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSeasonDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1 sm:flex-initial" ref={dropdownRef}>
      <button
        onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
        className="w-full sm:w-48 flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm text-white"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-500" />
          Season {selectedSeason}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSeasonDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showSeasonDropdown && seasons && seasons.length > 0 && (
        <div className="absolute right-0 mt-3 w-full sm:w-64 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-2 grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => {
                  onSeasonChange(season.season_number);
                  setShowSeasonDropdown(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedSeason === season.season_number
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span>Season {season.season_number}</span>
                <span className="text-[10px] opacity-60 bg-black/20 px-2 py-0.5 rounded-full">
                  {season.episode_count} EPS
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
