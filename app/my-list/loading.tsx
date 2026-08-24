import React from "react";
import { Library } from "lucide-react";

export default function MyListLoading() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header Skeleton */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-black z-0 animate-pulse" />
        
        <div className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-20 pb-12 w-full max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 animate-pulse">
                <Library className="w-6 h-6 text-zinc-700" />
              </div>
              <div className="h-10 w-64 bg-zinc-900 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-96 max-w-[80vw] bg-zinc-900/80 rounded animate-pulse mt-2"></div>
          </div>
        </div>
      </div>

      {/* Action Button Skeleton */}
      <div className="flex justify-end px-4 sm:px-6 md:px-12 lg:px-20 mb-8 -mt-6 relative z-20">
        <div className="h-10 w-40 bg-zinc-900 rounded-lg animate-pulse border border-white/5"></div>
      </div>

      {/* Collection Carousels Skeleton */}
      <div className="relative z-20 px-4 sm:px-6 md:px-12 lg:px-20 space-y-12">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="w-full">
            <div className="h-8 w-48 bg-zinc-900 rounded animate-pulse mb-4"></div>
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, cardIdx) => (
                <div key={cardIdx} className="w-40 sm:w-48 md:w-56 lg:w-64 aspect-[16/9] rounded-xl bg-zinc-900 animate-pulse border border-white/5 flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
