"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Download, HardDrive, Wifi, Settings, Play, Pause, X, Check, Trash2, AlertCircle, Zap, Globe, Shield, Smartphone } from "lucide-react";

export default function DownloadsPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "recommendations" | "travel" | "storage" | "settings">("queue");
  const [downloads, setDownloads] = useState([
    {
      id: "dl-1",
      title: "Stranger Moon",
      subtitle: "Season 1 · Episode 4 — The Hollow Orbit",
      quality: "Ultra HD 4K",
      size: "3.8 GB",
      progress: 45,
      speed: "3.1 MB/s",
      eta: "23 min remaining",
      status: "downloading",
      episodes: [
        { num: "EP 1", title: "Arrival at the Station", duration: "48 min", status: "done" },
        { num: "EP 2", title: "The Signal Below", duration: "52 min", status: "done" },
        { num: "EP 3", title: "Dark Side Protocols", duration: "55 min", status: "done" },
        { num: "EP 4", title: "The Hollow Orbit", duration: "49 min", status: "downloading" },
        { num: "EP 5", title: "Collision Course", duration: "57 min", status: "queued" },
        { num: "EP 6", title: "The Final Light", duration: "63 min", status: "none" }
      ]
    },
    {
      id: "dl-2",
      title: "Breaking Bad",
      subtitle: "Season 3 · Episode 7 — One Minute",
      quality: "HD 1080p",
      size: "1.4 GB",
      progress: 72,
      speed: "2.4 MB/s",
      eta: "8 min remaining",
      status: "downloading",
      episodes: []
    },
    {
      id: "dl-3",
      title: "Interstellar",
      subtitle: "Movie · 2014 · Christopher Nolan",
      quality: "Ultra HD 4K",
      size: "6.1 GB",
      progress: 28,
      speed: "",
      eta: "41 min remaining",
      status: "paused",
      episodes: []
    },
    {
      id: "dl-4",
      title: "Ozark",
      subtitle: "Season 2 · Episode 1 — Reparations",
      quality: "HD 1080p",
      size: "1.2 GB",
      progress: 0,
      speed: "",
      eta: "",
      status: "queued",
      episodes: []
    }
  ]);

  const [smartBanner, setSmartBanner] = useState(true);
  const [travelMode, setTravelMode] = useState(false);
  const [storageUsed, setStorageUsed] = useState(14.2);
  const [totalStorage, setTotalStorage] = useState(64);
  const [networkQuality, setNetworkQuality] = useState("Auto 4K");
  const [downloadQuality, setDownloadQuality] = useState("Auto");
  const [smartDownloads, setSmartDownloads] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDelete, setAutoDelete] = useState(true);

  const completedDownloads = [
    {
      id: "comp-1",
      title: "Narcos",
      subtitle: "Season 1 · Episodes 1–4",
      quality: "HD 1080p",
      size: "5.4 GB",
      downloadedDate: "Apr 1",
      expiresIn: "28 days"
    },
    {
      id: "comp-2",
      title: "Dark Protocol",
      subtitle: "Movie · 2023 · 1h 58m",
      quality: "Ultra HD 4K",
      size: "7.8 GB",
      downloadedDate: "Mar 30",
      expiresIn: "25 days"
    }
  ];

  const smartPicks = [
    {
      id: "pick-1",
      title: "Better Call Saul",
      subtitle: "6 Seasons · 63 Episodes",
      match: 98,
      quality: "HD 1080p",
      size: "3.2 GB"
    },
    {
      id: "pick-2",
      title: "Narcos",
      match: 95,
      quality: "HD 1080p",
      size: "3.0 GB"
    },
    {
      id: "pick-3",
      title: "Ozark",
      match: 91,
      quality: "HD 1080p",
      size: "4.4 GB"
    },
    {
      id: "pick-4",
      title: "Succession",
      match: 88,
      quality: "HD 1080p",
      size: "4.0 GB"
    }
  ];

  const travelItems = [
    { title: "Breaking Bad S3", size: "3 episodes · 2.1 GB", progress: 85 },
    { title: "Interstellar", size: "Movie · 6.1 GB", progress: 55 },
    { title: "Ex Machina", size: "2.8 GB", progress: 30 },
    { title: "Narcos S2-E1", size: "3 episodes · 1.8 GB", progress: 10 },
    { title: "Stand-Up Special", size: "Comedy · 1h 12m", progress: 5 }
  ];

  return (
    <div className="min-h-screen bg-[#141414] text-white font-['DM_Sans']">

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Sidebar — matches /account */}
        <aside className="w-[210px] min-w-[210px] bg-[#0a0a0a] border-r border-[#2A2A2A] flex flex-col overflow-y-auto">
          <div className="py-6 pb-2">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#6B6B6B] px-[18px] pb-2 uppercase">
              Downloads
            </div>
            
            <button
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "queue"
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]"
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
              onClick={() => setActiveTab("queue")}
            >
              <Download className="w-4 h-4 opacity-50" />
              My Downloads
              {activeTab === "queue" && (
                <>
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
                  <span className="ml-auto bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    7
                  </span>
                </>
              )}
            </button>
            
            <button
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "recommendations"
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]"
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
              onClick={() => setActiveTab("recommendations")}
            >
              <Zap className="w-4 h-4 opacity-50" />
              Smart Picks
              {activeTab === "recommendations" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>
            
            <button
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "travel"
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]"
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
              onClick={() => setActiveTab("travel")}
            >
              <Globe className="w-4 h-4 opacity-50" />
              Travel Mode
              {activeTab === "travel" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>
            
            <button
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "storage"
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]"
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
              onClick={() => setActiveTab("storage")}
            >
              <HardDrive className="w-4 h-4 opacity-50" />
              Storage
              {activeTab === "storage" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>
            
            <div className="border-t border-[#2A2A2A] my-[10px]" />
            <div className="text-[10px] font-semibold tracking-[2px] text-[#6B6B6B] px-[18px] pb-2 uppercase">
              Configure
            </div>
            
            <button
              className={`w-full flex items-center gap-[11px] px-[18px] py-[10px] relative transition-colors text-[13px] ${
                activeTab === "settings"
                  ? "text-white font-medium bg-[rgba(229,9,20,0.06)]"
                  : "text-[#B3B3B3] hover:bg-[#1F1F1F] hover:text-white"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-4 h-4 opacity-50" />
              Preferences
              {activeTab === "settings" && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E50914] rounded-r-[2px]" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area — matches /account */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[#141414] p-9 pb-[60px]">
          {activeTab === "queue" && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight mb-2">My Downloads</h1>
                  <p className="text-[14px] text-[#B3B3B3]">7 items · 14.2 GB used</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border border-[#2A2A2A] text-[#B3B3B3] text-xs font-medium rounded hover:bg-[#252525] hover:text-white transition-colors">
                    <Zap className="w-3 h-3" />
                    Smart Cleanup
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-xs font-bold rounded hover:bg-[#f40612] transition-colors">
                    <Download className="w-3 h-3" />
                    Add Download
                  </button>
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-4 mb-6 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-green-400 font-medium text-[13px]">Wi-Fi Connected</div>
                <div className="flex items-center gap-2 ml-auto">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">94.2 Mbps</span>
                </div>
                <div className="text-[13px] text-[#808080]">Downloading at Ultra HD quality automatically</div>
                <div className="ml-auto">
                  <span className="text-xs text-green-400 font-medium">Auto 4K</span>
                </div>
              </div>

              {/* Smart Banner */}
              {smartBanner && (
                <div className="bg-[#1F1F1F] border-l-4 border-[#E50914] rounded-lg p-4 mb-6 flex items-center justify-between animate-slideIn">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E50914]/20 flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-[#E50914]" />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">Smart Downloads Active</div>
                      <div className="text-[12px] text-[#808080]">Episode 4 of Stranger Moon queued automatically after you finished Episode 3</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSmartBanner(false)}
                    className="bg-[#252525] border border-[#2A2A2A] text-[#B3B3B3] text-xs px-3 py-2 rounded hover:bg-[#333] hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">3</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Downloading</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">2</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Queued</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold text-green-400 mb-2">6</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Completed</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">14.2 GB</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Storage Used</div>
                </div>
              </div>

              {/* Active Downloads */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[14px] font-semibold">Active Downloads</h2>
                  <button className="text-[#808080] text-xs hover:text-white transition-colors">Pause All</button>
                </div>

                {downloads.map((download) => (
                  <div key={download.id} className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg overflow-hidden transition-all hover:border-[#444]">
                    <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => {}}>
                      <div className="text-[#6B6B6B] text-sm font-medium w-6 h-6 flex items-center justify-center">
                        {download.id.split('-')[1]}
                      </div>
                      <div className="w-16 h-20 rounded-lg bg-[#252525] flex items-center justify-center overflow-hidden flex-shrink-0">
                        <div className="text-lg font-bold text-white">{download.id.split('-')[1]}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h3 className="font-medium text-white">{download.title}</h3>
                          <p className="text-[13px] text-[#808080]">{download.subtitle}</p>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-[#E50914]/10 text-[#E50914] text-[10px] font-bold uppercase rounded">Ultra HD 4K</span>
                          <span className="px-2 py-1 bg-[#252525] border border-[#2A2A2A] text-[#808080] text-[10px] font-medium rounded">3.8 GB</span>
                          <span className="px-2 py-1 bg-[#E50914]/10 text-[#E50914] text-[10px] font-bold rounded animate-pulse">● Downloading</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="h-1 bg-[#252525] rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                download.status === "paused" ? "bg-amber-500" : "bg-[#E50914]"
                              }`}
                              style={{
                                width: download.status === "downloading" ? `${download.progress}%` : download.status === "paused" ? "28%" : "0%"
                              }}
                            >
                              {download.status === "downloading" && (
                                <div className="h-full rounded-full bg-[#E50914] animate-shimmer relative">
                                  <div className="absolute right-0 top-0 bottom-0 w-5 h-full bg-white/30 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-1">
                            <span className="text-white font-medium">{download.progress}%</span>
                            <span className="text-[#808080]">{download.speed}</span>
                            <span className="text-[#808080]">{download.eta}</span>
                          </div>
                        </div>

                        {/* Episodes */}
                        {download.episodes && download.episodes.length > 0 && (
                          <div className="border-t border-[#2A2A2A] pt-3">
                            <div className="flex justify-between items-center mb-3">
                              <button className="bg-[#252525] border border-[#2A2A2A] text-[#B3B3B3] text-xs px-3 py-2 rounded hover:bg-[#333] hover:text-white transition-colors">
                                Download All
                              </button>
                              <button className="text-[#808080] text-xs px-3 py-2 rounded hover:bg-[#252525] hover:text-white transition-colors">
                                Pause All
                              </button>
                            </div>
                            {download.episodes.map((episode, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 hover:bg-[#252525] transition-colors rounded">
                                <div className="text-[#6B6B6B] text-xs font-medium w-8 flex-shrink-0">{episode.num}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] text-white truncate">{episode.title}</div>
                                  <div className="text-[11px] text-[#808080]">{episode.duration}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  episode.status === "done" ? "bg-green-500" :
                                  episode.status === "downloading" ? "bg-[#E50914]" :
                                  episode.status === "queued" ? "bg-[#555]" : "bg-[#333]"
                                }`}>
                                  {episode.status === "done" && <Check className="w-2 h-2 text-white" />}
                                  {episode.status === "downloading" && <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="w-7 h-7 rounded-full bg-[#252525] border border-[#2A2A2A] flex items-center justify-center hover:bg-[#333] hover:border-[#444] transition-colors">
                          <div className="w-3 h-3 text-[#808080]"></div>
                        </button>
                        <button className="w-7 h-7 rounded-full bg-[#252525] border border-[#2A2A2A] flex items-center justify-center hover:bg-[#333] hover:border-[#444] transition-colors">
                          <div className="w-3 h-3 text-[#808080]"></div>
                        </button>
                        <button className="w-7 h-7 rounded-full bg-[#252525] border border-[#2A2A2A] flex items-center justify-center hover:bg-[#333] hover:border-[#444] transition-colors">
                          <div className="w-4 h-4 text-[#808080]"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed */}
              <div className="space-y-4">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-[14px] font-semibold">
                    Completed <span className="text-[#808080] font-normal text-[13px]">3 titles</span>
                  </h2>
                  <button className="text-[#808080] text-xs hover:text-white transition-colors">Remove Watched</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedDownloads.map((download) => (
                    <div key={download.id} className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#444] transition-colors">
                      <div className="flex items-center gap-4 p-5">
                        <div className="w-16 h-20 rounded-lg bg-[#252525] flex items-center justify-center overflow-hidden flex-shrink-0">
                          <div className="text-lg font-bold text-white">{download.id.split('-')[1]}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h3 className="font-medium text-white">{download.title}</h3>
                            <p className="text-[13px] text-[#808080]">{download.subtitle}</p>
                          </div>
                          <div className="flex gap-2 mb-3">
                            <span className="px-2 py-1 bg-[#E50914]/10 text-[#E50914] text-[10px] font-bold uppercase rounded">Ultra HD 4K</span>
                            <span className="px-2 py-1 bg-[#252525] border border-[#2A2A2A] text-[#808080] text-[10px] font-medium rounded">7.8 GB</span>
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded">✓ Available Offline</span>
                          </div>
                          <div className="text-[11px] text-[#6B6B6B] mt-1">Downloaded {download.downloadedDate} · Expires in {download.expiresIn}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0 px-5 pb-4">
                        <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <button className="w-7 h-7 rounded-full bg-[#252525] border border-[#2A2A2A] flex items-center justify-center hover:bg-[#333] hover:border-[#444] transition-colors">
                          <Trash2 className="w-3 h-3 text-[#808080]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight mb-2">Smart Picks</h1>
                  <p className="text-[14px] text-[#B3B3B3]">AI-curated downloads based on your taste profile</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#E50914] text-white text-xs font-bold rounded hover:bg-[#f40612] transition-colors">
                    <Download className="w-3 h-3" />
                    Download All
                  </button>
                </div>
              </div>

              {/* Because you watched... */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-[14px] font-semibold">Because you watched Breaking Bad</h2>
                    <p className="text-[13px] text-[#808080]">Crime dramas with complex anti-heroes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {smartPicks.map((pick) => (
                    <div key={pick.id} className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#444] transition-all hover:scale-105">
                      <div className="relative">
                        <div className="w-36 h-52 rounded-lg bg-[#252525] flex items-center justify-center overflow-hidden">
                          <div className="text-2xl font-bold text-white">{pick.id.split('-')[1]}</div>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded">
                          {pick.match}%
                        </div>
                        <button 
                          onClick={() => {}}
                          className="absolute bottom-2 left-2 right-2 bg-[#E50914] text-white text-xs font-bold px-3 py-2 rounded hover:bg-[#f40612] transition-colors"
                        >
                          Download
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">{pick.title}</h3>
                        <p className="text-[13px] text-[#808080] mb-3">{pick.quality} · {pick.size}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-[#E50914]/10 text-[#E50914] text-[10px] font-bold rounded">HD 1080p</span>
                          <span className="px-2 py-1 bg-[#252525] border border-[#2A2A2A] text-[#808080] text-[10px] font-medium rounded">3 Seasons · 63 Episodes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Sci-Fi picks */}
              <div>
                <div className="flex items-start justify-between mb-4 mt-8">
                  <div>
                    <h2 className="text-[14px] font-semibold">Sci-Fi picks for your next trip</h2>
                    <p className="text-[13px] text-[#808080]">Under 2 hours · High engagement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "in", title: "Interstellar", quality: "Ultra HD 4K", size: "6.1 GB", match: 97 },
                    { id: "du", title: "Dune: Part One", quality: "Ultra HD 4K", size: "2.8 GB", match: 92 },
                    { id: "oz", title: "Ozark", quality: "HD 1080p", size: "4.4 GB", match: 91 },
                    { id: "we", title: "Westworld", quality: "HD 1080p", size: "4.0 GB", match: 89 }
                  ].map((pick) => (
                    <div key={pick.id} className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#444] transition-all hover:scale-105">
                      <div className="relative">
                        <div className="w-36 h-52 rounded-lg bg-[#252525] flex items-center justify-center overflow-hidden">
                          <div className="text-2xl font-bold text-white">{pick.id.split('-')[1]}</div>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#E50914] text-white text-[10px] font-bold px-2 py-1 rounded">
                          {pick.match}%
                        </div>
                        <button 
                          onClick={() => {}}
                          className="absolute bottom-2 left-2 right-2 bg-[#E50914] text-white text-xs font-bold px-3 py-2 rounded hover:bg-[#f40612] transition-colors"
                        >
                          Download
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">{pick.title}</h3>
                        <p className="text-[13px] text-[#808080]">{pick.quality} · {pick.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {activeTab === "travel" && (
            <div className="space-y-6">
              {/* Travel Mode Header */}
              <div className="bg-[#1F1F1F] border-l-4 border-[#E50914] rounded-lg p-5 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E50914]/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-[#E50914]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium">Prepare for Offline Travel</div>
                    <div className="text-[13px] text-[#808080]">MovieFlix will build a personalized offline library for you.</div>
                  </div>
                </div>
                <button
                  onClick={() => setTravelMode(true)}
                  className="bg-[#E50914] text-white text-[13px] font-bold px-4 py-2 rounded hover:bg-[#f40612] transition-colors"
                >
                  Activate Travel Mode
                </button>
              </div>

              {/* Travel Status */}
              {travelMode && (
                <div className="space-y-4">
                  <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4 text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-[13px]">Optimizing recommendations</span>
                    </div>
                    <div className="text-[13px] text-[#808080] mb-4 px-0 py-3 border-b border-[#2A2A2A]">
                      <span className="text-green-400 font-medium">✓ Building offline library & Optimizing storage</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {travelItems.map((item, index) => (
                        <div key={index} className="bg-[#242424] border border-[#2A2A2A] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-[13px] font-medium text-white">{item.title}</div>
                              <div className="text-[11px] text-[#808080]">{item.size}</div>
                            </div>
                            <div className="text-[11px] text-[#808080]">{item.progress}%</div>
                          </div>
                          <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#E50914] transition-all duration-2000"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-[13px] text-[#808080] mt-4">
                      Total: ~15.2 GB · Est. 8h 40m of offline content
                    </div>
                  </div>

                  {/* Travel History */}
                  <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-5">
                    <h3 className="text-[14px] font-semibold mb-4">Travel Mode History</h3>
                    <div className="text-center py-8 text-[#808080] text-[13px]">
                      No previous travel sessions found.<br />
                      <span className="block mt-2">Activate Travel Mode above to get started.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "storage" && (
            <div className="space-y-6">
              {/* Storage Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight mb-2">Storage</h1>
                  <p className="text-[14px] text-[#B3B3B3]">Device storage used by MovieFlix downloads</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border border-[#2A2A2A] text-[#B3B3B3] text-xs font-medium rounded hover:bg-[#252525] hover:text-white transition-colors">
                    <Zap className="w-3 h-3" />
                    Smart Cleanup
                  </button>
                </div>
              </div>

              {/* Storage Card */}
              <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase">Total Storage Usage</div>
                  <div className="text-lg font-bold">{storageUsed} GB <span className="font-normal text-[#808080]">/ {totalStorage} GB</span></div>
                </div>
                <div className="h-2 bg-[#333] rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-[#E50914] rounded-full transition-all duration-500"
                    style={{ width: `${(storageUsed / totalStorage) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E50914]"></div>
                    <span className="text-[13px] text-[#B3B3B3]">Movies — 8.4 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[13px] text-[#B3B3B3]">Series — 4.8 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[13px] text-[#B3B3B3]">Kids — 0.7 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#555]"></div>
                    <span className="text-[13px] text-[#B3B3B3]">Other — 0.3 GB</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">{storageUsed} GB</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Used</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold text-green-400 mb-2">{totalStorage - storageUsed} GB</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Available</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">11</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Total Downloads</div>
                </div>
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-4">
                  <div className="text-lg font-bold mb-2">28d</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[1.5px] font-semibold">Avg. Expiry</div>
                </div>
              </div>

              {/* Storage Settings */}
              <div className="space-y-6">
                <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-5">
                  <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">Storage Settings</div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
                      <div>
                        <div className="text-[13.5px] text-white">Auto-delete watched downloads</div>
                        <div className="text-[12px] text-[#808080] mt-[3px]">Remove episodes you've already watched to free up space</div>
                      </div>
                      <button 
                        onClick={() => setAutoDelete(!autoDelete)}
                        className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 ${
                          autoDelete ? 'bg-[#E50914]' : 'bg-[#333]'
                        }`}
                      >
                        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
                          autoDelete ? 'left-[20px]' : 'left-[3px]'
                        }`}></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
                      <div>
                        <div className="text-[13.5px] text-white">Smart storage management</div>
                        <div className="text-[12px] text-[#808080] mt-[3px]">Automatically free space when storage is below 2 GB</div>
                      </div>
                      <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#333]`}>
                        <div className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
                      <div>
                        <div className="text-[13.5px] text-white">Download only on Wi-Fi</div>
                        <div className="text-[12px] text-[#808080] mt-[3px]">Prevent mobile data usage for downloads</div>
                      </div>
                      <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#E50914]`}>
                        <div className="absolute top-[3px] left-[20px] w-4 h-4 rounded-full bg-white"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-[13px]">
                      <div>
                        <div className="text-[13.5px] text-white">Download quality limit on mobile data</div>
                        <div className="text-[12px] text-[#808080] mt-[3px]">Cap downloads at 720p when using cellular</div>
                      </div>
                      <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#333]`}>
                        <div className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Settings Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-[28px] font-bold tracking-tight mb-2">Download Preferences</h1>
                  <p className="text-[14px] text-[#B3B3B3]">Control how MovieFlix manages your offline library</p>
                </div>
              </div>

              {/* Network & Quality */}
              <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px] mb-6">
                <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">Network & Quality</div>
                <div className="space-y-4">
                  <div className="mb-4">
                    <label className="text-[10px] font-semibold tracking-[1.5px] text-[#6B6B6B] uppercase mb-[10px] block">Download Quality</label>
                    <div className="flex gap-2 mb-3">
                      {["Auto", "Ultra HD 4K", "HD 1080p", "HD 720p", "SD 480p"].map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setDownloadQuality(quality)}
                          className={`px-4 py-2 rounded-[4px] text-[12.5px] font-['DM_Sans'] cursor-pointer transition-all ${
                            downloadQuality === quality
                              ? 'bg-[#E50914] border-[#E50914] text-white'
                              : 'bg-[#252525] border border-[#2A2A2A] text-[#B3B3B3] hover:border-[#555] hover:text-white'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                    <div className="text-[11.5px] text-[#6B6B6B]">Auto adjusts quality based on available storage and network speed</div>
                  </div>
                </div>
              </div>

              {/* Smart Automation */}
              <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-[6px] p-[22px]">
                <div className="text-[14px] font-semibold pb-[14px] border-b border-[#2A2A2A] mb-[18px]">Smart Automation</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
                    <div>
                      <div className="text-[13.5px] text-white">Travel Mode Auto-Detect</div>
                      <div className="text-[12px] text-[#808080] mt-[3px]">Prepare offline library automatically before calendar trips</div>
                    </div>
                    <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#333]`}>
                      <div className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-[13px] border-b border-[#2A2A2A]">
                    <div>
                      <div className="text-[13.5px] text-white">Smart Cleanup</div>
                      <div className="text-[12px] text-[#808080] mt-[3px]">Auto-remove expired and watched downloads</div>
                    </div>
                    <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#E50914]`}>
                      <div className="absolute top-[3px] left-[20px] w-4 h-4 rounded-full bg-white"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-[13px]">
                    <div>
                      <div className="text-[13.5px] text-white">Download Recommendations</div>
                      <div className="text-[12px] text-[#808080] mt-[3px]">Suggest downloads based on your watch patterns</div>
                    </div>
                    <button className={`w-[40px] h-[22px] rounded-[11px] relative cursor-pointer transition-colors flex-shrink-0 bg-[#E50914]`}>
                      <div className="absolute top-[3px] left-[20px] w-4 h-4 rounded-full bg-white"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
}
