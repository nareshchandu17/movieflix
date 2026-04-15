"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWatchProgress } from "@/lib/useWatchProgress";
import SectionHeader from "../layout/SectionHeader";

const ContinueWatchingSection = () => {
  const { getContinueWatching, isHydrated } = useWatchProgress();
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    if (isHydrated) {
      setContinueWatching(getContinueWatching());
    }
  }, [isHydrated]);

  // Only render if there are items to display
  if (!isHydrated || continueWatching.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <SectionHeader title="">
        <h2 className="text-2xl font-bold text-white">Continue Watching For You</h2>
      </SectionHeader>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {continueWatching.map((item) => {
          const href = item.type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`;
          const backdropUrl = item.backdrop_path
            ? `https://image.tmdb.org/t/p/w342${item.backdrop_path}`
            : "https://i.imgur.com/wjVuAGb.png";

          const progressPercentage =
            (item.timeWatched / item.totalDuration) * 100;

          return (
            <Link key={`${item.type}-${item.id}`} href={href}>
              <div className="group relative rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden rounded-lg">
                  <Image
                    src={backdropUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 250px"
                    unoptimized
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-white text-xs font-semibold mb-2">
                      {progressPercentage.toFixed(0)}% watched
                    </div>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-semibold transition-colors">
                      Resume
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="p-2 bg-gray-900/50 backdrop-blur-sm">
                  <h3 className="text-white text-xs font-semibold line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingSection;
