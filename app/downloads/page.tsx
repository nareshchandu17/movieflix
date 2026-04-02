"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Play, 
  CheckCircle, 
  Pin, 
  Clock, 
  Trash2, 
  Filter, 
  ChevronDown, 
  Package, 
  Sparkles, 
  DownloadCloud, 
  ChevronRight,
  Brain,
  Target,
  Settings,
  Wifi,
  WifiOff,
  AlertTriangle,
  Plane,
  Calendar,
  MapPin
} from "lucide-react";
import { DownloadProvider, useDownloads } from "@/contexts/DownloadContext";
import SmartDownloadRecommendations from "@/components/downloads/SmartDownloadRecommendations";
import DownloadCard from "@/components/downloads/DownloadCard";
import ProgressBar from "@/components/downloads/ProgressBar";
import AutoDownloadNextEpisode from "@/components/downloads/AutoDownloadNextEpisode";
import StorageManager from "@/components/downloads/StorageManager";
import "./downloads.css";

const DownloadsPageContent = () => {
  const { 
    queue, 
    storage, 
    network, 
    settings, 
    stats, 
    recommendations,
    addToQueue,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    prioritizeDownload,
    clearCompleted,
    cleanupStorage,
    updateSettings,
    activateTravelMode
  } = useDownloads();

  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTravelMode, setShowTravelMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'downloading' | 'completed' | 'series'>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredDownloads = queue.items.filter(item => {
    switch (activeTab) {
      case 'downloading':
        return item.status === 'downloading' || item.status === 'queued';
      case 'completed':
        return item.status === 'completed';
      case 'series':
        return item.type === 'series' || item.type === 'episode';
      default:
        return true;
    }
  });

  const downloadingItems = queue.items.filter(item => item.status === 'downloading');
  const completedItems = queue.items.filter(item => item.status === 'completed');
  const queuedItems = queue.items.filter(item => item.status === 'queued');

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative">
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

  return (
    <div className="min-h-screen bg-black relative">
      <main className="w-full max-w-[1400px] mx-auto px-8 py-10 pb-40 relative z-20 mt-20">
        
        {/* Header - Simplified */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Downloads</h1>
            <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">Smart Adaptive System</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl">
              {network.type === 'wifi' ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-sm font-bold text-white uppercase">
                {network.quality} {network.type}
              </span>
            </div>
            
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl hover:bg-white/5 transition-all"
            >
              <Settings className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white uppercase">Settings</span>
            </button>
            
            {/* Status */}
            <div className="flex items-center gap-2 px-4 py-2 strong-glass rounded-xl">
              <CheckCircle className="w-5 h-5 text-red-500 fill-1" />
              <span className="text-sm font-bold text-white uppercase">
                {downloadingItems.length} Active
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Smart Download Recommendations */}
          {settings.smartDownloads && (
            <SmartDownloadRecommendations maxItems={4} />
          )}

          {/* Auto Download Next Episode */}
          <AutoDownloadNextEpisode />

          {/* Storage Manager */}
          <StorageManager />

          {/* Storage Capacity */}
          <div className="space-y-3 p-5 strong-glass rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Storage Capacity</span>
                <span className="text-white font-black text-lg">{storage.used} / {storage.total}</span>
              </div>
              <button 
                onClick={cleanupStorage}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black rounded-lg transition-all border border-white/10 uppercase tracking-widest"
              >
                Smart Cleanup
              </button>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                initial={{ width: 0 }}
                animate={{ width: `${(parseFloat(storage.used) / parseFloat(storage.total)) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {storage.needsCleanup && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-black">
                  {storage.recommendedCleanup} recommended for cleanup
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats - Simplified */}
          <div className="grid grid-cols-2 gap-4">
            <div className="strong-glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shadow-lg shadow-red-500/10 group-hover:scale-105 transition-transform">
                <Pin className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Continue Watching</p>
                <p className="text-slate-400 text-xs font-bold">{downloadingItems.length} Downloads Active</p>
              </div>
            </div>
            <div className="strong-glass p-4 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Downloaded Series</p>
                <p className="text-slate-400 text-xs font-bold">{completedItems.length} Completed</p>
              </div>
            </div>
          </div>

          {/* Travel Mode */}
          <div className="strong-glass p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">Travel Mode</h3>
                  <p className="text-slate-400 text-xs">Prepare for offline trips</p>
                </div>
              </div>
              <button
                onClick={() => setShowTravelMode(!showTravelMode)}
                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  settings.travelMode.enabled 
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {settings.travelMode.enabled ? 'Active' : 'Activate'}
              </button>
            </div>
            
            {showTravelMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-black uppercase tracking-widest">Destination</label>
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-400 text-xs font-black uppercase tracking-widest">Duration</label>
                    <input
                      type="number"
                      placeholder="Hours offline"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-500/30 transition-colors">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Analyze Route
                  </button>
                  <button className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400 text-xs font-black uppercase tracking-widest hover:bg-purple-500/30 transition-colors">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Set Dates
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Download Queue Tabs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-6">
                {['all', 'downloading', 'completed', 'series'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab
                        ? 'text-red-400 border-red-400'
                        : 'text-slate-500 border-transparent hover:text-white hover:border-white/30'
                    }`}
                  >
                    {tab === 'all' && 'All Downloads'}
                    {tab === 'downloading' && 'Active'}
                    {tab === 'completed' && 'Completed'}
                    {tab === 'series' && 'Series'}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={clearCompleted}
                  className="text-slate-500 text-xs font-black hover:text-white transition-all flex items-center gap-1 uppercase tracking-widest"
                >
                  Clear Completed
                </button>
                <button className="text-slate-500 text-xs font-black hover:text-white transition-all flex items-center gap-1 uppercase tracking-widest">
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Download Cards */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredDownloads.map((item, index) => (
                  <DownloadCard
                    key={item.id}
                    item={item}
                    onPause={pauseDownload}
                    onResume={resumeDownload}
                    onRemove={removeFromQueue}
                    onPriorityChange={prioritizeDownload}
                    showExpanded={expandedCards.has(item.id)}
                    onExpand={toggleCardExpansion}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const DownloadsPage = () => {
  return (
    <DownloadProvider>
      <DownloadsPageContent />
    </DownloadProvider>
  );
};

export default DownloadsPage;
