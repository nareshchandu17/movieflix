"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, Edit3, RefreshCw, Trash2, Users, TrendingUp, Clock, Star, Heart, 
  Flame, Zap, Target, Activity, Eye, Brain, Sparkles, ChevronRight,
  Play, SkipForward, Volume2, Moon, Sun, Coffee, Music, Film, Tv, Gamepad2,
  BookOpen, Palette, Award, Trophy, Crown, BarChart3, PieChart, Radar,
  TrendingDown, Filter, Download, Share2, Copy, Check, AlertCircle, Layers,
  Grid3x3, ZapIcon, SparklesIcon, Waves, Hexagon, Diamond, Globe2,
  TrendingUp as TrendingUpIcon, Flame as LocalFireDepartment, Brain as PsychologyIcon,
  Settings, Sliders
} from "lucide-react";

interface TasteData {
  genres: { name: string; percentage: number; color: string; trend: number; }[];
  moods: { mood: string; score: number; intensity: number; }[];
  behaviors: {
    bingeTendency: number;
    completionRate: number;
    averageSession: number;
    preferredTimeOfDay: string;
    skipRate: number;
    rewatchFrequency: number;
    peakEngagement: number;
  };
  patterns: {
    weeklyActivity: { day: string; hours: number; engagement: number }[];
    monthlyTrends: { month: string; content: number; satisfaction: number }[];
    timeDistribution: { time: string; percentage: number; activity: string }[];
  };
  insights: {
    personalityType: string;
    viewingStyle: string;
    peakTime: string;
    topGenre: string;
    topMood: string;
    uniqueTraits: string[];
  };
}

interface TasteDNAProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
}

const TasteDNA: React.FC<TasteDNAProps> = ({ isOpen, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState("taste-highlights");
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Enhanced taste data with sophisticated metrics
  const [tasteData, setTasteData] = useState<TasteData>({
    genres: [
      { name: "Thriller", percentage: 27, color: "#ef4444", trend: 12 },
      { name: "Sci-Fi", percentage: 21, color: "#3b82f6", trend: -5 },
      { name: "Drama", percentage: 17, color: "#eab308", trend: 8 },
      { name: "Comedy", percentage: 14, color: "#96ceb4", trend: 15 },
      { name: "Fantasy", percentage: 10, color: "#14b8a6", trend: -2 },
      { name: "Action", percentage: 8, color: "#f97316", trend: 3 }
    ],
    moods: [
      { mood: "Suspenseful", score: 85, intensity: 92 },
      { mood: "Heartfelt", score: 45, intensity: 38 },
      { mood: "Thoughtful", score: 70, intensity: 65 },
      { mood: "Intense", score: 30, intensity: 25 },
      { mood: "Mysterious", score: 60, intensity: 72 },
      { mood: "Light", score: 55, intensity: 48 }
    ],
    behaviors: {
      bingeTendency: 82,
      completionRate: 94,
      averageSession: 2.8,
      preferredTimeOfDay: "Night Owl",
      skipRate: 12,
      rewatchFrequency: 28,
      peakEngagement: 87
    },
    patterns: {
      weeklyActivity: [
        { day: "Mon", hours: 2.5, engagement: 65 },
        { day: "Tue", hours: 3.2, engagement: 78 },
        { day: "Wed", hours: 1.8, engagement: 45 },
        { day: "Thu", hours: 4.1, engagement: 89 },
        { day: "Fri", hours: 5.5, engagement: 95 },
        { day: "Sat", hours: 6.2, engagement: 92 },
        { day: "Sun", hours: 4.8, engagement: 76 }
      ],
      monthlyTrends: [
        { month: "Jan", content: 45, satisfaction: 78 },
        { month: "Feb", content: 52, satisfaction: 82 },
        { month: "Mar", content: 48, satisfaction: 75 },
        { month: "Apr", content: 61, satisfaction: 88 },
        { month: "May", content: 58, satisfaction: 85 },
        { month: "Jun", content: 72, satisfaction: 91 }
      ],
      timeDistribution: [
        { time: "Morning", percentage: 15, activity: "Light" },
        { time: "Afternoon", percentage: 25, activity: "Moderate" },
        { time: "Evening", percentage: 45, activity: "High" },
        { time: "Night", percentage: 15, activity: "Intense" }
      ]
    },
    insights: {
      personalityType: "Night Owl Binger",
      viewingStyle: "Completionist",
      peakTime: "Evening Prime",
      topGenre: "Thriller",
      topMood: "Suspenseful",
      uniqueTraits: ["High Completion Rate", "Evening Peak", "Genre Diversity"]
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate advanced insights
  const advancedInsights = useMemo(() => {
    const totalHours = tasteData.patterns.weeklyActivity.reduce((sum, day) => sum + day.hours, 0);
    const avgEngagement = tasteData.patterns.weeklyActivity.reduce((sum, day) => sum + day.engagement, 0) / 7;
    const topTrendingGenre = tasteData.genres.reduce((prev, current) => 
      prev.trend > current.trend ? prev : current
    );
    
    return {
      totalWeeklyHours: totalHours,
      avgEngagementScore: Math.round(avgEngagement),
      topTrendingGenre,
      viewingVelocity: totalHours > 20 ? "High" : totalHours > 10 ? "Medium" : "Low",
      contentDiversity: tasteData.genres.filter(g => g.percentage > 10).length,
      moodStability: tasteData.moods.filter(m => Math.abs(m.score - m.intensity) < 10).length
    };
  }, [tasteData]);

  const handleResetData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Enhanced Backdrop with dark gradient */}
      <div 
        className="absolute inset-0 bg-black backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modern Panel with glass morphism */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-7xl bg-black border-l border-white/10 transform transition-all duration-500 ease-out ${
        mounted ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Enhanced Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 z-10">
          <div className="flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Your Taste DNA
                </h2>
                <p className="text-gray-400 text-lg">Your unique cinematic signature, synthesized from viewing habits, mood transitions, and engagement patterns across your entire library.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  editMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/40' 
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                onClick={handleResetData}
                className="p-4 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-2xl transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-4 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-2xl transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-3 px-8 pb-6 overflow-x-auto">
            {[
              { id: "taste-highlights", label: "Taste Highlights" },
              { id: "personalization", label: "Personalization" },
              { id: "friend-activity", label: "Friend Activity" },
              { id: "global-trends", label: "Global Trends" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-5 text-purple-400 border-b-2 border-purple-400 font-bold text-sm uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? ''
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-2 border-pink-500 border-b-transparent rounded-full animate-spin animation-delay-150" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === "taste-highlights" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                  {/* Top Genres Card */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Top Genres This Month</h3>
                        <p className="text-gray-500 text-sm">Activity based on last 30 days</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 uppercase tracking-wider">Analysis</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
                      <div className="relative w-56 h-56 flex items-center justify-center">
                        <div className="w-full h-full rounded-full flex items-center justify-center p-8 bg-gradient-to-br from-red-600 via-red-500 to-orange-600">
                          <div className="bg-black w-full h-full rounded-full flex flex-col items-center justify-center shadow-2xl border border-white/5">
                            <span className="text-4xl font-black text-white">82</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Score</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-10">
                        {[
                          { name: "Thriller", percentage: 27, color: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" },
                          { name: "Sci-Fi", percentage: 21, color: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
                          { name: "Drama", percentage: 17, color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" },
                          { name: "Comedy", percentage: 14, color: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" },
                          { name: "Fantasy", percentage: 10, color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" },
                          { name: "Action", percentage: 8, color: "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" }
                        ].map((genre) => (
                          <div key={genre.name} className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${genre.color}`}></span>
                            <span className="text-sm font-medium">{genre.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">{genre.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mood & Pacing Card */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Mood & Pacing</h3>
                        <p className="text-gray-500 text-sm">Your emotional engagement profile</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">
                          <Sliders className="text-xl text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center py-6">
                      <div className="relative w-72 h-72">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200">
                          <circle cx="100" cy="100" fill="none" r="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <circle cx="100" cy="100" fill="none" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <circle cx="100" cy="100" fill="none" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <circle cx="100" cy="100" fill="none" r="20" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                          <line stroke="rgba(255,255,255,0.06)" x1="100" x2="100" y1="20" y2="180" />
                          <line stroke="rgba(255,255,255,0.06)" x1="20" x2="180" y1="100" y2="100" />
                          
                          {/* Mood points with glow effect */}
                          <polygon 
                            className="filter drop-shadow(0_0_8px_rgba(59,130,246,0.8))" 
                            fill="rgba(59, 130, 246, 0.15)" 
                            points="100,35 170,100 100,165 45,100" 
                            stroke="#3b82f6" 
                            strokeWidth="2.5"
                          />
                          <circle className="filter drop-shadow(0_0_8px_rgba(59,130,246,0.8))" cx="100" cy="35" fill="#3b82f6" r="4" />
                          <circle className="filter drop-shadow(0_0_8px_rgba(59,130,246,0.8))" cx="170" cy="100" fill="#3b82f6" r="4" />
                          <circle className="filter drop-shadow(0_0_8px_rgba(59,130,246,0.8))" cx="100" cy="165" fill="#3b82f6" r="4" />
                          <circle className="filter drop-shadow(0_0_8px_rgba(59,130,246,0.8))" cx="45" cy="100" fill="#3b82f6" r="4" />
                          
                          <text className="fill-white text-[11px] font-bold tracking-[0.15em] uppercase" textAnchor="middle" x="100" y="8">Suspenseful</text>
                          <text className="fill-white text-[11px] font-bold tracking-[0.15em] uppercase" textAnchor="start" x="180" y="104">Heartfelt</text>
                          <text className="fill-white text-[11px] font-bold tracking-[0.15em] uppercase" textAnchor="middle" x="100" y="196">Intense</text>
                          <text className="fill-white text-[11px] font-bold tracking-[0.15em] uppercase" textAnchor="end" x="20" y="104">Light</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "personalization" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Night Owl Binger Card */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 group cursor-pointer hover:border-orange-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <LocalFireDepartment className="text-orange-500 text-2xl" />
                      </div>
                      <h4 className="text-lg font-bold">Night Owl Binger</h4>
                    </div>
                    <p className="text-gray-400 mb-8">Peak streaming intensity detected between <span className="text-white font-semibold">10:00 PM and 2:00 AM</span>. High resilience to "one more episode" syndrome.</p>
                    
                    {/* Activity bars */}
                    <div className="h-32 flex items-end gap-2 px-2">
                      {[15, 25, 35, 45, 65, 85, 100, 75, 50, 35, 30, 20, 15].map((height, index) => (
                        <div 
                          key={index}
                          className="flex-1 bg-white/5 rounded-t-lg transition-all group-hover:bg-white/10" 
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    
                    {/* Time labels */}
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span>6:00 PM</span>
                      <span>12:00 AM</span>
                      <span>6:00 AM</span>
                    </div>
                  </div>

                  {/* Sci-Fi Visionary Card */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 group cursor-pointer hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <Brain className="text-emerald-400 text-2xl" />
                      </div>
                      <h4 className="text-lg font-bold">Sci-Fi Visionary</h4>
                    </div>
                    <p className="text-gray-400 mb-8">You have a completion rate of <span className="text-white font-bold">94%</span> for speculative fiction series, well above the 68% average.</p>
                    
                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAn-6E8mtTxcc6236wPrqNyl0Ru3UrDZc3GR6r34OV8vYCAl69NDoN9k1YdYMIRDTzVBzxSxnIigzpK5I61Fe3ogYMOHpINeiJsj7-MFdJyOJP7E4VF0-kcSjrWmTzcVUAYtWa5muQESbuOdFZ82gZ_CLRA4cz33P6mm2jI_l2Q9B0ModiMM4zaC4p_f1-kKWzqm2Bqaf-YbWYkE30LxT34PBas8-Q4c27EdBlxR7P46RmrM9vls1aIIWYOFZsRcWXa5NDoDFfBTpAV",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBBO9DgrUa6mYXFf8KZHOe5bsSrisl6u1yxvAcY3iEzp3qiDmkhzLClo958SpKQJXMSfUcGI4xy5qASNwHyeVtxMc6JXAmkXqe_XJcQXspZfIVZGVGXfcwmpTdceCBldi2CRZS0ouAo4NPVmPVqAmI93BHGdPLQMHis3KBwc6TQpN1f8ho0Bb-f5kQh_4jULv5uE1SvM6ZOwkIbUV9Lt6f2Kkz2zjP6Z8PVa9pIbbaGWDbj4F2Mu9i8TmWqIbGmkUHY5bGx8BVo8sRC",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUOuKHe1NHZpCJZ8hLWZSndDuyDRMLYayn0Zj4dr0qyamcv3kqpbUi4D6-Oq7j9ckhdPxJKa0NexZ77LoC0DRHcAw2lKyLd7Zs8aQxbVHUrMZuVWe5NNFyxEezS0LK2U7pmWCE3yAOuFx8A8EIRU5xaCcPJfqzZZRgKEVMMCwqReHmymrQApy0SUALrpN_385cXWtx7jN65vWPbQdlw-2Xwg_LIrqxqRaGbGD93ebEyVTG48qvHavgcC0Mxw_98WjV21b19hIZfS2m0JsnOWAp6fPo6rdgfNlRufEWSSk-n_5EkF1NsFDUuuPlSkwB_d",
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuDfDyyfCSUo5O0kFMSA7kRZiKO4q68FuJgLPqq-SUJ68qWRgZZGl97-xDKaI4-2-tvZ3r3Q7ZOk3_wqIQKGZcvmnjuekfTKLJDAMu0iIsJCFAggMUyxt3Ai3iUFzkLXCBdYD5zAKNjRd6UZH63_rIjku_X_CwKOnuAvKj0Avq2rK0qjspkuHiq7ieKDR16kHaYFWWVPB-gXDW_u__dOFcmLJYk7AikrDR29MvARfQkoJu7QwV1y14SM3zqGjVx7dM0mAXjgsVHD6zXw"
                      ].map((src, index) => (
                        <div key={index} className="aspect-[2/3] rounded-2xl bg-slate-900 overflow-hidden relative border border-white/5">
                          <img 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                            src={src}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10">
                      View Recommendations
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "friend-activity" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Friend Comparison Card */}
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-12">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                      <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" fill="none" r="44" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                            <circle 
                              className="transform -rotate-90 origin-center" 
                              cx="50" cy="50" fill="none" r="44" 
                              stroke="#3b82f6" 
                              strokeDasharray="208 276" 
                              strokeLinecap="round" 
                              strokeWidth="6"
                              style={{ filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">75%</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">Similarity</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex -space-x-3 mt-8">
                        <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-slate-800">
                          <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfDyyfCSUo5O0kFMSA7kRZiKO4q68FuJgLPqq-SUJ68qWRgZZGl97-xDKaI4-2-tvZ3r3Q7ZOk3_wqIQKGZcvmnjuekfTKLJDAMu0iIsJCFAggMUyxt3Ai3iUFzkLXCBdYD5zAKNjRd6UZH63_rIjku_X_CwKOnuAvKj0Avq2rK0qjspkuHiq7ieKDR16kHaYFWWVPB-gXDW_u__dOFcmLJYk7AikrDR29MvARfQkoJu7QwV1y14SM3zqGjVx7dM0mAXjgsVHD6zXw"/>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-slate-800">
                          <img alt="Friend" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEzf2sHg3R2QwsQYHANvjVVUcIvYgiLsiJPSDEobbMvxhzEMBf1q6r2Wq6pb3wmQSfLu5OKrFvilBXomqs5fI3YNHKH8qfFzjQ-y-M23UGcMbLzTgQmm_p-BPcWHhZuuXiSVMiGGaRJ-gE7vxkvfG2yBzOfn7p-FIY5lxowAc07k1kVBWxFF42awdDgp8NP7WTlRaYMxdHClp4kESfybds8hR-2m0JsnOWAp6fPo6rdgfNlRufEWSSk-n_5EkF1NsFDUuuPlSkwB_d"/>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-400">Comparing with <span className="text-white">Jamie's Taste</span></p>
                    </div>
                    
                    <div className="flex-1 w-full space-y-8">
                      <div className="flex justify-between items-end">
                        <h4 className="font-bold text-2xl">Genre Overlap</h4>
                        <button className="text-purple-400 text-xs font-bold uppercase tracking-widest hover:underline">View Breakdown</button>
                      </div>
                      
                      <div className="space-y-6">
                        {[
                          { name: "Sci-Fi", percentage: 88, color: "bg-blue-500" },
                          { name: "Thriller", percentage: 65, color: "bg-red-500" },
                          { name: "Fantasy", percentage: 42, color: "bg-emerald-500" }
                        ].map((genre) => (
                          <div key={genre.name}>
                            <div className="flex justify-between mb-3 items-center">
                              <span className="text-sm font-bold flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${genre.color}`}></span>
                                {genre.name}
                              </span>
                              <span className="text-sm font-bold text-white">{genre.percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${genre.color} rounded-full`} style={{ width: `${genre.percentage}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-6">
                        <button className="w-full px-8 py-4 bg-purple-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]">
                          Discover Mutual Watchlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "global-trends" && (
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 lg:p-12">
                  <h3 className="text-2xl font-bold mb-8">Global Taste Trends</h3>
                  <p className="text-gray-400 text-lg mb-8">How your preferences compare to worldwide viewing patterns</p>
                  
                  {/* Trend stats grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: "Peak Viewing Time", value: "8:00 PM - 12:00 AM", icon: Clock, color: "text-purple-400" },
                      { label: "Avg Session Length", value: "2.8 hours", icon: Play, color: "text-blue-400" },
                      { label: "Completion Rate", value: "94%", icon: Check, color: "text-green-400" },
                      { label: "Binge Score", value: "82/100", icon: Flame, color: "text-orange-400" }
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="text-center">
                        <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
                        <p className="text-sm text-gray-500">{label}</p>
                        <p className="text-lg font-bold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="sticky bottom-0 bg-black/95 backdrop-blur-2xl border-t border-white/10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/40">
                <Users className="w-4 h-4 mr-2" />
                Compare with Friends
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/40">
                <Settings className="w-4 h-4 mr-2" />
                Personalization Settings
              </button>
              <button className="px-6 py-3 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-2xl font-semibold transition-all duration-300">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white rounded-2xl font-semibold transition-all duration-300">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </button>
              <button className="px-6 py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-2xl font-semibold transition-all duration-300">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasteDNA;
