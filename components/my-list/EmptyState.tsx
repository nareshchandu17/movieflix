"use client";

import { Film, Tv, Plus } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-8">
          <Film className="w-16 h-16 text-red-500" />
        </div>
      </div>

      {/* Main Message */}
      <h2 className="text-3xl font-bold text-white mb-4 max-w-2xl">
        Your watch collections will appear here
      </h2>

      {/* Description */}
      <p className="text-gray-400 text-lg mb-8 max-w-2xl leading-relaxed">
        Save movies and series into collections like
        <br />
        <span className="text-red-400 font-medium">"Weekend Binge"</span> or
        <span className="text-blue-400 font-medium">"Late Night Thrillers"</span>
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Link href="/movie">
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 min-w-[160px]">
            <Film className="w-5 h-5" />
            Browse Movies
          </button>
        </Link>
        
        <Link href="/series">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 min-w-[160px]">
            <Tv className="w-5 h-5" />
            Browse Series
          </button>
        </Link>
      </div>

      {/* Tips */}
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6 max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-600/20 rounded-full p-2">
            <Plus className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-semibold text-white">Pro Tip</h3>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          Click the <span className="text-red-400 font-medium">+ icon</span> on any movie or series poster to save it to your collections. You can create custom collections for different moods and times!
        </p>
      </div>

      {/* Collection Examples */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
        {[
          { icon: "🌅", name: "Morning Picks", color: "from-yellow-600 to-orange-600" },
          { icon: "☕", name: "Afternoon Break", color: "from-blue-600 to-cyan-600" },
          { icon: "🌙", name: "Night Watch", color: "from-purple-600 to-pink-600" },
          { icon: "🍿", name: "Weekend Binge", color: "from-red-600 to-red-700" }
        ].map((collection, index) => (
          <div
            key={index}
            className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-4 text-center group hover:border-white/30 transition-all duration-300"
          >
            <div className={`bg-gradient-to-r ${collection.color} rounded-lg p-3 mb-2 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{collection.icon}</span>
            </div>
            <p className="text-white text-sm font-medium">{collection.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
