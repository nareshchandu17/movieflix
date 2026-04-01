"use client";

import { useState, useEffect } from "react";
import { Download, Play, CheckCircle, Pin, Clock, Trash2, Filter, ChevronDown, Package, Sparkles, DownloadCloud, ChevronRight } from "lucide-react";
import "./downloads.css";

interface DownloadItem {
  id: string;
  title: string;
  type: "movie" | "series";
  poster: string;
  progress: number;
  timeLeft: string;
  status: "downloading" | "completed" | "expiring" | "paused";
  quality?: string;
  season?: string;
  episode?: string;
  network?: string;
  size?: string;
  episodesDownloaded?: number;
  totalEpisodes?: number;
}

interface StorageCategory {
  name: string;
  size: string;
  color: string;
  percentage: number;
}

const DownloadsPage = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed] = useState(32.4);
  const [storageTotal] = useState(64);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockDownloads: DownloadItem[] = [
      {
        id: "1",
        title: "Stranger Moon",
        type: "series",
        poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWcTsaEQgshvsBDv7w63TmXfLxQBvdEdSNyG0ATP4Y318ssOcfEyc9b_F90M7zmiNaLOtYrwYpgPrxVeJETfcJUMC1Qv2tGaDJpFSbA8SPBrtlWeAF6PVCr9pCG7H6oQFp6pY5q5814VlHH4T2JBYgW9tQiD9x2BYxemJdvcW04JYBAi5N18xSyluv5VdovCDV48ny9sOnoEARbn6T3r4ESj4A0GOEpupM4xktfvyhSjZHpePR97pOTVtPOxiW2EQ-Hpym0JBV20U",
        progress: 65,
        timeLeft: "23m left",
        status: "downloading",
        season: "Season 2",
        episode: "Ep 04"
      },
      {
        id: "2",
        title: "The Heist",
        type: "movie",
        poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcdEVOvgJFToEMruhecgri3wHhzO00xEsCJYFjmVA4tsjwaEEw2M07T2ZpkmZaB_h9kd6kp1HkCmFyxAMKqEQfo0wTS4zAqV9-U8oPwLpDBrUKGqb7u_ehMeStoAS9q3VRhklLQTmu52tsKoJ_yT62ZFp8Sj1eo8qfgyL8GGM_LopflJpU2Kttr5jctuqKHKqakNO-RXDsNDxzGeWRuSgFrbSEkJ2QRAhMeftaPmOvsT8izqwYEKy-6OPQwvZALOcrYN8YMqsseWg",
        progress: 35,
        timeLeft: "1h 10m left",
        status: "downloading",
        quality: "HD"
      },
      {
        id: "3",
        title: "Forest of Secrets",
        type: "movie",
        poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMSUXUupF6PXnk6129f-IcxF-CkmE9jEugN_7DEzdjRz8NfkCuCrJMB30XIL1cOxD1CR8NrN_i5nNb4L5kHQQvu-NIfot4tes4QZxgK5CRa8MKpPo-G7wKc60ugyP1co-ImYHGWesyQ4YZOGbQkCY6ccVNqkm7bjYvrh5IRljnFqfZNMgARZR3_q0_-lTPc_xgfai-k8gF2-kVIihiCjSbPtMkAAa1Zn9_BIBE5Zc2iD-1-ogr1jW4c425zaEO3eHw1z07W4UFjCQ",
        progress: 80,
        timeLeft: "45m left",
        status: "downloading",
        quality: "4K"
      },
      {
        id: "4",
        title: "Comedy Club",
        type: "series",
        poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbgDY3LO71rf3Zzwz-1v9U3bQXS-JHsG_9AKg_HGGZruGXZRx0KABR8V71Ll6xParIoErOUp1lT-OyENfJQogGEiCTX7nrPvNh2jVhT9AxbxIf3S69rfQncBS9GANi1a6pYAe4EDdE4cmsnNLkR381BbSZtYnKuFhlRfX_aArnrok6V8SLofgq2dl460WMpE3_FgXZsRQ12stKaxCfIQqtH708TWb3kC73ejLPLBGG6qffzFGqmDQqdFI0L3ajqQ0BMWoPe2BajWk",
        progress: 100,
        timeLeft: "Completed",
        status: "completed"
      }
    ];

    setTimeout(() => {
      setDownloads(mockDownloads);
      setLoading(false);
    }, 1000);
  }, []);

  const storageCategories: StorageCategory[] = [
    { name: "Movies", size: "8.2 GB", color: "bg-orange-500", percentage: 25 },
    { name: "Series", size: "12.5 GB", color: "bg-sky-500", percentage: 40 },
    { name: "Kids", size: "3.1 GB", color: "bg-purple-500", percentage: 15 },
    { name: "Others", size: "8.6 GB", color: "bg-emerald-500", percentage: 20 }
  ];

  const bingeSeries = [
    {
      id: "5",
      title: "Money Heist",
      type: "series",
      poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ_C7chNe9qWcWX5WMnZiAVQvx9HIMqL5H3nrnX2WvYBdA6AAOXcwtqteRPKJjlKCaYLcUR9-URV30vPwUQ6SOl4nI4yLplXbbaR1trI0IKGvRaiatxVgTt6jzPzcmrhyWjto-FSYxQ7T6ZDyilyguw8KNhxTWCZze2p1JAwhdMs-Cowp3LFgEMBva3c9ZaDfTbFminN2Qz66Vq8icaag2kXT9HOCsgV45FG4utEhrxbnKjaiaFVXeMCBcfm3uXBOH4xYbhGKiO8g",
      episodesDownloaded: 7,
      totalEpisodes: 10,
      size: "2.1 GB",
      season: "Season 5",
      network: "Netflix Original",
      progress: 70
    },
    {
      id: "6",
      title: "Breaking Bad",
      type: "series",
      poster: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm-KDxCurw4N1wUt9q1bQArkaaE3T_cUF8aUGdSiK0o289j5ZvruoUbvzBnBbHn6ed7lh1vDvwVSOiCxdU8jm8N2BJMiak47AL1ERMx6rI8cKdUYJgCq3aQ4o2Pf4VCNOq6nxDxlfdcoKy9xNLIoZmfDyqxqYPEb31omC6qqV1vGXIPsY3nAhVxFw3vQSK40dm0TPFYLHq4SpR7HnU9068L1TnE2XGDxy3MDwBAXSIPcgfIjtOL96KoDM849AjUaDRzmFxs-8a4Cg",
      episodesDownloaded: 5,
      totalEpisodes: 10,
      size: "1.4 GB",
      season: "Season 3",
      network: "AMC Network",
      progress: 45,
      newEpisodes: 3
    }
  ];

  const getProgressColor = (status: string) => {
    switch (status) {
      case "downloading": return "bg-sky-500";
      case "completed": return "bg-emerald-500";
      case "expiring": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getProgressShadow = (color: string) => {
    switch (color) {
      case "bg-sky-500": return "shadow-[0_0_10px_#0ea5e9]";
      case "bg-emerald-500": return "shadow-[0_0_10px_#10b981]";
      case "bg-orange-500": return "shadow-[0_0_10px_#f97316]";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh relative">
        <main className="w-full max-w-[1400px] mx-auto px-8 py-10 pb-40 relative z-20 mt-20">
          <div className="animate-pulse">
            <div className="h-12 w-48 bg-white/10 rounded-xl mb-10"></div>
            <div className="space-y-8">
              <div className="h-32 bg-white/5 rounded-3xl"></div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-3xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="min-h-screen bg-mesh relative flex items-center justify-center">
        <main className="w-full max-w-[600px] mx-auto px-8 py-10 relative z-20 text-center mt-20">
          <div className="space-y-6">
            <div className="w-32 h-32 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <DownloadCloud className="w-16 h-16 text-slate-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight italic mb-4">No Downloads Yet</h1>
              <p className="text-slate-400 text-lg mb-8">
                Start downloading your favorite movies and series to watch them offline
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-6 strong-glass rounded-3xl text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center">
                    <Pin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">Download for Offline</h3>
                    <p className="text-emerald-400/80 text-sm font-bold">Watch anywhere without internet</p>
                  </div>
                </div>
              </div>
              <div className="p-6 strong-glass rounded-3xl text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/40 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">Smart Downloads</h3>
                    <p className="text-blue-400/80 text-sm font-bold">Automatically download new episodes</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-rose-700 text-white font-black rounded-xl hover:scale-105 transition-all border border-white/30">
              Browse Content to Download
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative">
      <main className="w-full max-w-[1400px] mx-auto px-8 py-10 pb-40 relative z-20 mt-20">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight italic">DOWNLOADS</h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Management Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-1" />
              <span className="text-sm font-bold text-white uppercase">All Systems Optimal</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Storage Capacity */}
          <div className="space-y-3 p-5 strong-glass rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Storage Capacity</span>
                <span className="text-white font-black text-lg">{storageUsed} GB / {storageTotal} GB</span>
              </div>
              <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-lg transition-all border border-white/10 uppercase tracking-widest">
                Manage Storage
              </button>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="h-full neon-gradient-bar rounded-full shadow-[0_0_20px_#9d50bb66]" 
                style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="strong-glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                <Pin className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Offline Tonight</p>
                <p className="text-emerald-400/80 text-xs font-bold">8 Titles</p>
              </div>
            </div>
            <div className="strong-glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Expiring Soon</p>
                <p className="text-orange-400/80 text-xs font-bold">3 Critical</p>
              </div>
            </div>
            <div className="strong-glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
                <Trash2 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Free Up Space</p>
                <p className="text-indigo-400/80 text-xs font-bold">2.3 GB</p>
              </div>
            </div>
            <div className="strong-glass p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-white/5 transition-all cursor-pointer group border-dashed">
              <Filter className="w-7 h-7 text-white mb-1 group-hover:rotate-90 transition-transform" />
              <p className="text-white text-xs font-black uppercase tracking-[0.2em]">Filters</p>
            </div>
          </div>

          {/* Continue Watching Offline */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Continue Watching Offline</h2>
              <a className="text-slate-500 text-xs font-black hover:text-white transition-all flex items-center gap-1 uppercase tracking-widest" href="#">
                See All Library <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {downloads.map((item) => (
                <div key={item.id} className="group relative rounded-3xl overflow-hidden strong-glass">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      src={item.poster} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                    {item.status === "downloading" && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-primary/90 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Play className="w-4 h-4 text-white fill-1" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h4 className="text-sm font-black text-white uppercase italic">{item.title}</h4>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <span>
                        {item.season && `${item.season} • `}
                        {item.episode || `${item.type} • ${item.quality || "HD"}`}
                      </span>
                      <span className={
                        item.status === "downloading" ? "text-sky-400" :
                        item.status === "completed" ? "text-emerald-400" :
                        "text-orange-400"
                      }>
                        {item.timeLeft}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(item.status)} ${getProgressShadow(getProgressColor(item.status))}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Binge Series */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                Binge Series <span className="text-slate-500 font-normal ml-2 not-italic text-lg">(Episodes)</span>
              </h2>
            </div>
            <div className="space-y-4">
              {bingeSeries.map((series) => (
                <div key={series.id} className="flex items-center gap-6 p-4 rounded-3xl strong-glass group hover:bg-white/5 transition-all">
                  <div className="relative">
                    <img 
                      alt={series.title} 
                      className="w-24 h-14 object-cover rounded-xl shadow-lg border border-white/10" 
                      src={series.poster} 
                    />
                    {series.newEpisodes && (
                      <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-[10px] flex items-center justify-center rounded-lg text-white font-black shadow-lg shadow-primary/40">
                        {series.newEpisodes}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-black text-white uppercase italic">{series.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                          {series.season} • {series.network}
                        </p>
                      </div>
                      <div className="flex items-center gap-12">
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                          <Package className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
                            {series.episodesDownloaded}/{series.totalEpisodes} Episodes
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 font-black tracking-widest">{series.size}</div>
                        <div className="flex items-center gap-6">
                          <Download className="w-5 h-5 text-slate-500 hover:text-primary cursor-pointer transition-colors" />
                          <ChevronRight className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500"
                        style={{ width: `${series.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Storage Breakdown */}
          <section className="p-4 rounded-2xl strong-glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Storage Breakdown</h2>
              <button className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-primary rounded-lg hover:bg-white/10 transition-all uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Cleanup
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="w-full h-3 flex rounded-full overflow-hidden bg-white/5 border border-white/10 p-0.5">
                  {storageCategories.map((category, index) => (
                    <div
                      key={category.name}
                      className={`h-full ${category.color} ${index === 0 ? 'rounded-l-full' : index === storageCategories.length - 1 ? 'rounded-r-full' : ''} shadow-[0_0_15px_rgba(251,146,60,0.4)]`}
                      style={{ 
                        width: `${category.percentage}%`,
                        boxShadow: category.name === 'Movies' ? '0 0 15px rgba(251,146,60,0.4)' :
                               category.name === 'Series' ? '0 0 15px rgba(14,165,233,0.4)' :
                               category.name === 'Kids' ? '0 0 15px rgba(168,85,247,0.4)' :
                               '0 0 15px rgba(16,185,129,0.4)'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                {storageCategories.map((category) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${category.color}`}
                      style={{
                        boxShadow: category.name === 'Movies' ? '0 0 8px rgba(251,146,60,0.6)' :
                               category.name === 'Series' ? '0 0 8px rgba(14,165,233,0.6)' :
                               category.name === 'Kids' ? '0 0 8px rgba(168,85,247,0.6)' :
                               '0 0 8px rgba(16,185,129,0.6)'
                      }}
                    ></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{category.name}</p>
                      <p className="text-sm font-black text-white italic">{category.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Sync Button */}
      <button className="fixed bottom-12 right-12 w-24 h-24 bg-gradient-to-br from-primary to-rose-700 rounded-full flex flex-col items-center justify-center text-white shadow-[0_15px_40px_rgba(255,0,85,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group border border-white/30 backdrop-blur-xl">
        <DownloadCloud className="w-8 h-8 group-hover:scale-110 transition-transform fill-1" />
        <span className="text-[10px] font-black uppercase tracking-tighter mt-1 leading-none text-center">
          Sync<br/>All
        </span>
      </button>
    </div>
  );
};

export default DownloadsPage;