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
    <div className="min-h-screen bg-black text-white">
      

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <div className="w-52 min-w-[13rem] bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="py-5 pb-2">
            <div className="text-xs font-semibold tracking-wider text-gray-500 px-4 pb-2 uppercase">
              Downloads
            </div>
            
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer relative transition-all ${
                activeTab === "queue"
                  ? "text-white font-medium bg-red-900/10"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("queue")}
            >
              <Download className="w-4 h-4 text-gray-500 flex-shrink-0" />
              My Downloads
              {activeTab === "queue" && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  7
                </span>
              )}
            </div>
            
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer relative transition-all ${
                activeTab === "recommendations"
                  ? "text-white font-medium bg-red-900/10"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("recommendations")}
            >
              <Download className="w-4 h-4 text-gray-500 flex-shrink-0" />
              Smart Picks
            </div>
            
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer relative transition-all ${
                activeTab === "travel"
                  ? "text-white font-medium bg-red-900/10"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("travel")}
            >
              <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
              Travel Mode
            </div>
            
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer relative transition-all ${
                activeTab === "storage"
                  ? "text-white font-medium bg-red-900/10"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("storage")}
            >
              <HardDrive className="w-4 h-4 text-gray-500 flex-shrink-0" />
              Storage
            </div>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer relative transition-all ${
                activeTab === "settings"
                  ? "text-white font-medium bg-red-900/10"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
              Preferences
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-950 px-9 py-8">
          {activeTab === "queue" && (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight mb-1">My Downloads</h1>
                  <p className="text-sm text-gray-400">7 items · 14.2 GB used</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition-colors">
                    <Zap className="w-3 h-3" />
                    Smart Cleanup
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors">
                    <Download className="w-3 h-3" />
                    Add Download
                  </button>
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-green-400 font-medium">Wi-Fi Connected</div>
                <div className="flex items-center gap-2 ml-auto">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">94.2 Mbps</span>
                </div>
                <div className="text-sm text-gray-400">Downloading at Ultra HD quality automatically</div>
                <div className="ml-auto">
                  <span className="text-xs text-green-400 font-medium">Auto 4K</span>
                </div>
              </div>

              {/* Smart Banner */}
              {smartBanner && (
                <div className="bg-gray-900 border-l-4 border-red-500 rounded-lg p-4 mb-6 flex items-center justify-between animate-slideIn">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Smart Downloads Active</div>
                      <div className="text-xs text-gray-400">Episode 4 of Stranger Moon queued automatically after you finished Episode 3</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSmartBanner(false)}
                    className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">3</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Downloading</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">2</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Queued</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-400 mb-2">6</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completed</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">14.2 GB</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Storage Used</div>
                </div>
              </div>

              {/* Active Downloads */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Active Downloads</h2>
                  <button className="text-gray-400 text-xs hover:text-white transition-colors">Pause All</button>
                </div>

                {downloads.map((download) => (
                  <div key={download.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all hover:border-gray-700">
                    <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => {}}>
                      <div className="text-gray-500 text-sm font-medium w-6 h-6 flex items-center justify-center">
                        {download.id.split('-')[1]}
                      </div>
                      <div className="w-16 h-20 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <div className="text-lg font-bold text-white">{download.id.split('-')[1]}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h3 className="font-medium text-white">{download.title}</h3>
                          <p className="text-sm text-gray-400">{download.subtitle}</p>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Ultra HD 4K</span>
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded">3.8 GB</span>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded animate-pulse">● Downloading</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                download.status === "paused" ? "bg-amber-500 w-[28%]" : "bg-red-500 w-[45%]"
                              }`}
                              style={{
                                width: download.status === "downloading" ? `${download.progress}%` : download.status === "paused" ? "28%" : "0%"
                              }}
                            >
                              {download.status === "downloading" && (
                                <div className="h-full rounded-full bg-red-600 animate-shimmer relative">
                                  <div className="absolute right-0 top-0 bottom-0 w-5 h-full bg-white/30 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white font-medium">{download.progress}%</span>
                            <span className="text-gray-400">{download.speed}</span>
                            <span className="text-gray-400">{download.eta}</span>
                          </div>
                        </div>

                        {/* Episodes */}
                        {download.episodes && download.episodes.length > 0 && (
                          <div className="border-t border-gray-700 pt-3">
                            <div className="flex justify-between items-center mb-3">
                              <button className="bg-gray-800 text-gray-400 text-xs px-3 py-2 rounded hover:bg-gray-700 transition-colors">
                                Download All
                              </button>
                              <button className="text-gray-400 text-xs px-3 py-2 rounded hover:bg-gray-700 transition-colors">
                                Pause All
                              </button>
                            </div>
                            {download.episodes.map((episode, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors">
                                <div className="text-gray-500 text-xs font-medium w-8 flex-shrink-0">{episode.num}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-white truncate">{episode.title}</div>
                                  <div className="text-xs text-gray-400">{episode.duration}</div>
                                </div>
                                <div className={`w-2 h-2 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  episode.status === "done" ? "bg-green-500" :
                                  episode.status === "downloading" ? "bg-red-500" :
                                  episode.status === "queued" ? "bg-gray-600" : "bg-gray-700"
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
                        <button className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <div className="w-3 h-3 text-gray-400"></div>
                        </button>
                        <button className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <div className="w-3 h-3 text-gray-400"></div>
                        </button>
                        <button className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <div className="w-4 h-4 text-gray-400"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed */}
              <div className="space-y-4">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Completed <span className="text-gray-400 font-normal text-sm">3 titles</span>
                  </h2>
                  <button className="text-gray-400 text-xs hover:text-white transition-colors">Remove Watched</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedDownloads.map((download) => (
                    <div key={download.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-16 h-20 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <div className="text-lg font-bold text-white">{download.id.split('-')[1]}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <h3 className="font-medium text-white">{download.title}</h3>
                            <p className="text-sm text-gray-400">{download.subtitle}</p>
                          </div>
                          <div className="flex gap-2 mb-3">
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Ultra HD 4K</span>
                            <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded">7.8 GB</span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">✓ Available Offline</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">Downloaded {download.downloadedDate} · Expires in {download.expiresIn}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <button className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:bg-gray-700 transition-colors">
                          <Trash2 className="w-3 h-3 text-gray-400" />
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
                  <h1 className="text-2xl font-semibold tracking-tight mb-1">Smart Picks</h1>
                  <p className="text-sm text-gray-400">AI-curated downloads based on your taste profile</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors">
                    <Download className="w-3 h-3" />
                    Download All
                  </button>
                </div>
              </div>

              {/* Because you watched... */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Because you watched Breaking Bad</h2>
                    <p className="text-sm text-gray-400">Crime dramas with complex anti-heroes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {smartPicks.map((pick) => (
                    <div key={pick.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all hover:scale-105">
                      <div className="relative">
                        <div className="w-36 h-52 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                          <div className="text-2xl font-bold text-white">{pick.id.split('-')[1]}</div>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-500 text-black text-xs font-bold px-2 py-1 rounded">
                          {pick.match}%
                        </div>
                        <button 
                          onClick={() => {}}
                          className="absolute bottom-2 left-2 right-2 bg-red-600 text-white text-xs font-medium px-3 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">{pick.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{pick.quality} · {pick.size}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">HD 1080p</span>
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-medium rounded">3 Seasons · 63 Episodes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Sci-Fi picks */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Sci-Fi picks for your next trip</h2>
                    <p className="text-sm text-gray-400">Under 2 hours · High engagement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "in", title: "Interstellar", quality: "Ultra HD 4K", size: "6.1 GB", match: 97 },
                    { id: "du", title: "Dune: Part One", quality: "Ultra HD 4K", size: "2.8 GB", match: 92 },
                    { id: "oz", title: "Ozark", quality: "HD 1080p", size: "4.4 GB", match: 91 },
                    { id: "we", title: "Westworld", quality: "HD 1080p", size: "4.0 GB", match: 89 }
                  ].map((pick) => (
                    <div key={pick.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all hover:scale-105">
                      <div className="relative">
                        <div className="w-36 h-52 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                          <div className="text-2xl font-bold text-white">{pick.id.split('-')[1]}</div>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-500 text-black text-xs font-bold px-2 py-1 rounded">
                          {pick.match}%
                        </div>
                        <button 
                          onClick={() => {}}
                          className="absolute bottom-2 left-2 right-2 bg-red-600 text-white text-xs font-medium px-3 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2">{pick.title}</h3>
                        <p className="text-sm text-gray-400">{pick.quality} · {pick.size}</p>
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
              <div className="bg-gray-900 border-l-4 border-red-500 rounded-lg p-5 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-base font-medium">Prepare for Offline Travel</div>
                    <div className="text-sm text-gray-400">MovieFlix will analyze your taste DNA and build an optimized offline library</div>
                  </div>
                </div>
                <button
                  onClick={() => setTravelMode(true)}
                  className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Activate Travel Mode
                </button>
              </div>

              {/* Travel Status */}
              {travelMode && (
                <div className="space-y-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-4 text-green-400">
                      <Check className="w-4 h-4" />
                      <span>Analyzing taste DNA</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4 px-0 py-3 border-b border-gray-700">
                      <span className="text-green-400 font-medium">✓ Building offline library & Optimizing storage</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {travelItems.map((item, index) => (
                        <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-sm font-medium text-white">{item.title}</div>
                              <div className="text-xs text-gray-400">{item.size}</div>
                            </div>
                            <div className="text-xs text-gray-400">{item.progress}%</div>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-2000"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-4">
                      Total: ~15.2 GB · Est. 8h 40m of offline content
                    </div>
                  </div>

                  {/* Travel History */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                    <h3 className="text-base font-medium mb-4">Travel Mode History</h3>
                    <div className="text-center py-8 text-gray-400 text-sm">
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
                  <h1 className="text-2xl font-semibold tracking-tight mb-1">Storage</h1>
                  <p className="text-sm text-gray-400">Device storage used by MovieFlix downloads</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-400 text-xs font-medium rounded hover:bg-gray-700 transition-colors">
                    <Zap className="w-3 h-3" />
                    Smart Cleanup
                  </button>
                </div>
              </div>

              {/* Storage Card */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Total Storage Usage</div>
                  <div className="text-lg font-bold">{storageUsed} GB <span className="font-normal text-gray-400">/ {totalStorage} GB</span></div>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${(storageUsed / totalStorage) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">Movies — 8.4 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Series — 4.8 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Kids — 0.7 GB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    <span className="text-sm">Other — 0.3 GB</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">{storageUsed} GB</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Used</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-400 mb-2">{totalStorage - storageUsed} GB</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Available</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">11</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Downloads</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="text-lg font-bold mb-2">28d</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg. Expiry</div>
                </div>
              </div>

              {/* Storage Settings */}
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                  <h3 className="text-base font-medium mb-4">Storage Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Auto-delete watched downloads</div>
                        <div className="text-sm text-gray-400">Remove episodes you've already watched to free up space</div>
                      </div>
                      <button 
                        onClick={() => setAutoDelete(!autoDelete)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          autoDelete ? 'bg-red-600' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          autoDelete ? 'translate-x-6' : 'translate-x-1'
                        }`}></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Smart storage management</div>
                        <div className="text-sm text-gray-400">Automatically free space when storage is below 2 GB</div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors">
                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white translate-x-1"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Download only on Wi-Fi</div>
                        <div className="text-sm text-gray-400">Prevent mobile data usage for downloads</div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600 transition-colors">
                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform translate-x-6"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Download quality limit on mobile data</div>
                        <div className="text-sm text-gray-400">Cap downloads at 720p when using cellular</div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors">
                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white translate-x-1"></div>
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
                  <h1 className="text-2xl font-semibold tracking-tight mb-1">Download Preferences</h1>
                  <p className="text-sm text-gray-400">Control how MovieFlix manages your offline library</p>
                </div>
              </div>

              {/* Network & Quality */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-6">
                <h3 className="text-base font-medium mb-4">Network & Quality</h3>
                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Download Quality</div>
                    <div className="flex gap-2 mb-3">
                      {["Auto", "Ultra HD 4K", "HD 1080p", "HD 720p", "SD 480p"].map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setDownloadQuality(quality)}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            downloadQuality === quality
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">Auto adjusts quality based on available storage and network speed</div>
                  </div>
                </div>
              </div>

              {/* Smart Automation */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <h3 className="text-base font-medium mb-4">Smart Automation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div>
                      <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Travel Mode Auto-Detect</div>
                      <div className="text-sm text-gray-400">Prepare offline library automatically before calendar trips</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white translate-x-1"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div>
                      <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Smart Cleanup</div>
                      <div className="text-sm text-gray-400">Auto-remove expired and watched downloads</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform translate-x-6"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">Download Recommendations</div>
                      <div className="text-sm text-gray-400">Suggest downloads based on your watch patterns</div>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-600 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform translate-x-6"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
        
        .font-bebas-neue {
          font-family: 'Bebas Neue', sans-serif;
        }
        
        .tracking-wider {
          letter-spacing: 0.1em;
        }
        
        .tracking-tight {
          letter-spacing: -0.025em;
        }
      `}</style>
    </div>
  );
}
