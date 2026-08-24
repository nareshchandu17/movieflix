import React from 'react';

export default function SearchSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse mt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-zinc-800/80 rounded"></div>
      </div>
      
      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] w-full rounded-xl bg-zinc-800/80 overflow-hidden relative">
              {/* Shine effect overlay */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent" />
            </div>
            {/* Title Skeleton */}
            <div className="h-4 w-3/4 bg-zinc-800/80 rounded mt-1"></div>
            {/* Meta data Skeleton */}
            <div className="flex gap-2">
              <div className="h-3 w-10 bg-zinc-800/60 rounded"></div>
              <div className="h-3 w-16 bg-zinc-800/60 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
