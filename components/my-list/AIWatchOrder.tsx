"use client";

import { useState } from "react";
import { Play, Pause, Sparkles } from "lucide-react";

interface CollectionItem {
  _id: string;
  tmdbId: number;
  mediaType: "movie" | "series" | "anime";
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  watchProgress: number;
  watched: boolean;
  lastWatchedAt: string | null;
  addedAt: string;
}

interface AIWatchOrderProps {
  items: CollectionItem[];
}

const getPriorityFromItem = (item: CollectionItem): "continue" | "finish" | "start" => {
  if (item.watchProgress > 0 && item.watchProgress < 100) {
    return "continue";
  } else if (item.watchProgress >= 100) {
    return "finish";
  } else {
    return "start";
  }
};

const getReasonFromItem = (item: CollectionItem): string => {
  const priority = getPriorityFromItem(item);
  if (priority === "continue") {
    return "Because you paused it recently";
  } else if (priority === "finish") {
    return item.mediaType === "series" ? "Next episode available" : "Almost finished watching";
  } else {
    return "Matches your viewing preferences";
  }
};

export default function AIWatchOrder({ items }: AIWatchOrderProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Only show items that have some activity or are recent
  const aiWatchItems = items.slice(0, 3).map(item => ({
    id: item._id,
    title: item.title,
    poster: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "/api/placeholder/200/300",
    type: item.mediaType,
    reason: getReasonFromItem(item),
    priority: getPriorityFromItem(item),
    progress: item.watchProgress
  }));

  if (aiWatchItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">AI Watch Order</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
      </div>
      
      <p className="text-gray-400 text-sm">
        Because these match your viewing patterns
      </p>

      {/* Medium Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {aiWatchItems.map((item) => (
          <div
            key={item.id}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Glass */}
            <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Progress Bar for Continue */}
                {item.priority === "continue" && item.progress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Hover Overlay */}
                {hoveredCard === item.id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors duration-200">
                      {item.priority === "continue" ? (
                        <Play className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                )}

                {/* Priority Badge */}
                <div className="absolute top-2 right-2">
                  {item.priority === "continue" && (
                    <div className="bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Continue</span>
                    </div>
                  )}
                  {item.priority === "finish" && (
                    <div className="bg-orange-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Finish</span>
                    </div>
                  )}
                  {item.priority === "start" && (
                    <div className="bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-white text-xs font-medium">Start</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{item.type}</span>
                    {item.nextEpisode && (
                      <>
                        <span>•</span>
                        <span>{item.nextEpisode}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Reason */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-blue-400 text-xs">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">AI</span>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                    {item.reason}
                  </p>
                </div>

                {/* Action Button */}
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1">
                  {item.priority === "continue" ? (
                    <>
                      <Play className="w-3 h-3" />
                      Resume
                    </>
                  ) : item.priority === "finish" ? (
                    <>
                      <Play className="w-3 h-3" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Start
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
