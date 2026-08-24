"use client";

import React, { useEffect, useState } from "react";
import { Users, PlaySquare, TrendingUp, Activity, Film } from "lucide-react";
import Image from "next/image";

interface MostWatchedItem {
  _id: string;
  title: string;
  posterPath: string | null;
  mediaType: string;
  views: number;
}

interface AnalyticsData {
  signupsThisWeek: number;
  activeWatchParties: number;
  totalUsers: number;
  mostWatched: MostWatchedItem[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl text-red-500 font-bold mb-4">Access Denied / Error</h1>
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(240,20%,4%)] text-white pt-24 pb-12 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              Platform Analytics
            </h1>
            <p className="text-zinc-400 font-medium tracking-wide">
              Real-time insights into user growth and content engagement.
            </p>
          </div>
          <div className="bg-red-600/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-500 font-bold text-sm tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(229,9,20,0.1)]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE DATA
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Last 7 Days</span>
            </div>
            <h3 className="text-4xl font-black tracking-tighter mb-1">{data.signupsThisWeek}</h3>
            <p className="text-zinc-400 text-sm font-medium">New User Signups</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500 flex items-center justify-between">
              <span>Total Users:</span>
              <span className="font-bold text-zinc-300">{data.totalUsers}</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Right Now</span>
            </div>
            <h3 className="text-4xl font-black tracking-tighter mb-1">{data.activeWatchParties}</h3>
            <p className="text-zinc-400 text-sm font-medium">Active Watch Parties</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500">
              Users currently streaming together
            </div>
          </div>
          
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <PlaySquare className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">All Time</span>
            </div>
            <h3 className="text-4xl font-black tracking-tighter mb-1">
              {data.mostWatched.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}+
            </h3>
            <p className="text-zinc-400 text-sm font-medium">Total Streams</p>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500">
              Across all available titles
            </div>
          </div>
        </div>

        {/* Most Watched Section */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
              <Film className="w-5 h-5 text-zinc-400" />
              Most Watched Content
            </h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {data.mostWatched.map((item, index) => (
              <div key={item._id} className="p-6 flex items-center gap-6 hover:bg-white/[0.02] transition-colors">
                <div className="text-3xl font-black text-zinc-700 italic w-8 text-center">
                  {index + 1}
                </div>
                
                <div className="w-16 md:w-20 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative shrink-0 shadow-lg">
                  {item.posterPath ? (
                    <Image
                      src={item.posterPath.startsWith('http') ? item.posterPath : `https://image.tmdb.org/t/p/w200${item.posterPath}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-6 h-6 text-zinc-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold truncate tracking-tight">{item.title}</h3>
                  <div className="text-sm text-zinc-500 uppercase font-semibold tracking-wider mt-1">
                    {item.mediaType}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-white">{item.views.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Views</div>
                </div>
              </div>
            ))}
            
            {data.mostWatched.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                No watch history data available yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
