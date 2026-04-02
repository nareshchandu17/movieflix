"use client";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-800 rounded mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* AI Watch Order Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-px flex-1 bg-gray-800 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Watching Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-px flex-1 bg-gray-800 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-none w-40 space-y-3">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Collections Skeleton */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-px flex-1 bg-gray-800 animate-pulse"></div>
          </div>
          
          {[...Array(3)].map((_, collectionIndex) => (
            <div key={collectionIndex} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, itemIndex) => (
                  <div key={itemIndex} className="flex-none w-44 space-y-2">
                    <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recently Watched Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-px flex-1 bg-gray-800 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-none w-44 space-y-2">
                <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
