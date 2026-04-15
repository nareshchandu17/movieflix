"use client";
import React, { useEffect, useState, useRef } from "react";
import { TMDBTVDetail, TMDBCast, TMDBCrew, TMDBTVShow, TMDBSeason, TMDBSeasonDetail, TMDBEpisodeDetail } from "@/lib/types";
import { api } from "@/lib/api";
import { Play, Share2, Download, Plus, ChevronLeft, ChevronRight, Star, Calendar, Clock, ThumbsUp, MessageCircle, Film, Globe, DollarSign, TrendingUp, AlertTriangle, Heart, BarChart3, Zap, Users, Eye, Shield, ThumbsDown, Reply, Flag, Clapperboard, Info, Coins, Bot, Moon, RotateCcw, LayoutGrid, Tv, PlayCircle, Info as InfoIcon, ChevronDown, Filter, ArrowUpDown, Brain, Coffee, HeartHandshake, Sparkles, Stars, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useProfileContext } from "@/contexts/ProfileContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import "@/styles/movie-insights.css";
import CollectionPopup from "../collections/CollectionPopup";
import DetailedNarrativeMap from "./DetailedNarrativeMap";

interface BingeSeriesInfoProps {
  id: number;
}

interface EpisodeWithProgress {
  episode: TMDBEpisodeDetail;
  progress: number;
  isWatched: boolean;
  isCurrent: boolean;
}

interface SeriesInsights {
  completionRate: number;
  rewatchability: number;
  bestBingeWindow: string;
  storyProgression: string;
  seriesTone: string[];
  genreDistribution: Array<{ name: string; value: number; color: string }>;
  engagementCurve: Array<{ name: string; value: number }>;
  bingeabilityScore: number;
  dropOffEpisode: number;
  cliffhangerDensity: string;
}

// AI Insights Sidebar Component
const AIInsights = ({ seriesId, seriesTitle, onShowMap }: { seriesId: number, seriesTitle: string, onShowMap: () => void }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [dynamicInsights, setDynamicInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!seriesId || !seriesTitle) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/ai-insights/series', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: seriesId,
            title: seriesTitle,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }
        
        const data = await response.json();
        
        if (data.insights && Array.isArray(data.insights)) {
          // Map incoming data to include icons and maintain consistency
          const icons = [
            <Brain className="w-4 h-4" />,
            <Eye className="w-4 h-4" />,
            <Zap className="w-4 h-4" />,
            <Globe className="w-4 h-4" />,
            <Stars className="w-4 h-4" />
          ];
          
          const mappedInsights = data.insights.map((insight: any, index: number) => ({
            ...insight,
            id: index,
            icon: icons[index % icons.length]
          }));
          
          setDynamicInsights(mappedInsights);
        } else {
          throw new Error('Invalid insights data format');
        }
      } catch (err) {
        console.error('AI Insights Error:', err);
        setError('Unable to load AI analysis at this moment.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [seriesId, seriesTitle]);

  if (error) {
    return (
      <div className="rounded-[2.5rem] bg-black/40 border border-white/10 p-8 text-center backdrop-blur-3xl">
        <Bot className="w-10 h-10 text-red-500/50 mx-auto mb-4 animate-pulse" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 space-y-6"
    >
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 p-1">
        {/* Google AI Studio Border Glow Effect */}
        <div className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#3b82f6_180deg,transparent_210deg,transparent_360deg)]" />
          <div className="absolute inset-[-100%] animate-[spin_11s_linear_infinite_reverse] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#8b5cf6_180deg,transparent_210deg,transparent_360deg)]" />
        </div>

        <div className="relative rounded-[2.2rem] bg-gray-950/90 p-8 h-full backdrop-blur-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Insights</h2>
              <p className="text-[10px] uppercase tracking-widest text-blue-400/70 font-bold">Powered by Gemini Engine</p>
            </div>
          </div>

          <div className="mb-8 p-5 rounded-3xl bg-white/5 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="text-yellow-500 animate-pulse">⭐</div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">AI HIGHLIGHT</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded-full animate-pulse" />
                    <div className="h-2 w-2/3 bg-white/10 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    "{dynamicInsights[0]?.content.split('.')[0]}."
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-[1.5rem] border border-white/5 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              ))
            ) : dynamicInsights.map((item) => (
              <div key={item.id} className="group/item border border-white/5 rounded-[1.5rem] overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 shadow-xl">
                <button
                  onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-4 px-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all duration-500 ${openSection === item.id ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold transition-colors ${openSection === item.id ? 'text-white' : 'text-gray-400'}`}>
                      {item.title}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${openSection === item.id ? 'rotate-180 text-blue-500' : 'text-gray-600'}`} />
                </button>
                
                <AnimatePresence>
                  {openSection === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="px-5 pb-5 pt-0">
                        <div className="h-[1px] w-full bg-white/5 mb-4 shadow-sm" />
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">{item.header}</h4>
                          <p className="text-xs text-gray-300 leading-relaxed font-bold">
                            {item.content}
                          </p>
                          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                            <div className="flex items-start gap-2">
                              <Info className="w-3 h-3 text-blue-500 mt-0.5" />
                              <p className="text-[10px] text-blue-400 leading-normal italic font-medium">
                                {item.benefit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <button 
            onClick={onShowMap}
            className="w-full mt-8 flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group/btn shadow-lg"
          >
            <span className="text-xs font-bold text-gray-400 group-hover:text-white">Detailed Narrative Map</span>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const BingeSeriesInfo = ({ id }: BingeSeriesInfoProps) => {
  const router = useRouter();
  const [seriesData, setSeriesData] = useState<TMDBTVDetail | null>(null);
  
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [crew, setCrew] = useState<TMDBCrew[]>([]);
  const [similarShows, setSimilarShows] = useState<TMDBTVShow[]>([]);
  const [seasons, setSeasons] = useState<TMDBSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState<TMDBSeasonDetail | null>(null);
  const [episodesWithProgress, setEpisodesWithProgress] = useState<EpisodeWithProgress[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeWithProgress[]>([]);
  const [similarSeries, setSimilarSeries] = useState<TMDBTVShow[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState<number | null>(null);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<{ season: number; episode: number; progress: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeasonLoading, setIsSeasonLoading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [seriesInsights, setSeriesInsights] = useState<SeriesInsights>({
    completionRate: 72,
    rewatchability: 4.1,
    bestBingeWindow: 'Weekend',
    storyProgression: 'Slow → Intense',
    seriesTone: ['Dark', 'Suspenseful'],
    genreDistribution: [
      { name: 'Action', value: 30, color: '#FF2E63' },
      { name: 'Drama', value: 45, color: '#8B5CF6' },
      { name: 'Dialogue', value: 15, color: '#22D3EE' },
      { name: 'Cliffhangers', value: 10, color: '#F59E0B' },
    ],
    engagementCurve: [
      { name: 'E1', value: 65 },
      { name: 'E2', value: 72 },
      { name: 'E3', value: 58 },
      { name: 'E4', value: 85 },
      { name: 'E5', value: 92 },
      { name: 'E6', value: 88 },
      { name: 'E7', value: 95 },
      { name: 'E8', value: 98 },
    ],
    bingeabilityScore: 8.4,
    dropOffEpisode: 3,
    cliffhangerDensity: 'High'
  });
  const [scenes, setScenes] = useState<Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}>>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'popular'>('latest');
  const [episodeSortOrder, setEpisodeSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showNarrativeMap, setShowNarrativeMap] = useState(false);
  const episodesContainerRef = useRef<HTMLDivElement>(null);

  // Collection Popup State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | undefined>(undefined);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plusButtonRef.current) {
      setAnchorRect(plusButtonRef.current.getBoundingClientRect());
    }
    setIsPopupOpen(!isPopupOpen);
  };

  // Calculate series insights based on TMDB data
  const calculateSeriesInsights = (series: TMDBTVDetail) => {
    // Binge Completion based on vote average and popularity
    const completionRate = Math.min(95, Math.max(40, Math.round((series.vote_average || 5) * 8 + (series.popularity || 0) / 50)));
    
    // Rewatchability based on rating and genre
    const genres = series.genres || [];
    const isComedy = genres.some(g => g.name.toLowerCase().includes('comedy'));
    const isThriller = genres.some(g => g.name.toLowerCase().includes('thriller'));
    const isAction = genres.some(g => g.name.toLowerCase().includes('action'));
    const isDrama = genres.some(g => g.name.toLowerCase().includes('drama'));
    const rating = series.vote_average || 5;

    const rewatchability = Math.min(5, Math.max(1, (rating / 10) * 4 + (isComedy ? 1 : 0.5)));
    
    // Story Progression
    let storyProgression = 'Steady Build';
    if (isThriller || isAction) storyProgression = 'Slow → Intense';
    else if (rating > 8) storyProgression = 'Complex → Epic';
    
    // Series Tone
    const toneTags: string[] = [];
    if (isThriller) toneTags.push('Suspenseful');
    if (isAction) toneTags.push('Epic');
    if (rating > 8) toneTags.push('Mind-Bending');
    if (genres.some(g => g.name.toLowerCase().includes('crime'))) toneTags.push('Dark');
    if (isComedy) toneTags.push('Feel-Good');
    if (toneTags.length === 0) toneTags.push('Dramatic');

    // Genre Distribution including Cliffhangers
    const genreDistribution = [
      { name: 'Action', value: isAction ? 30 + Math.random() * 10 : 10 + Math.random() * 5, color: '#FF2E63' },
      { name: 'Drama', value: 40 + Math.random() * 20, color: '#8B5CF6' },
      { name: 'Dialogue', value: 20 + Math.random() * 10, color: '#22D3EE' },
      { name: 'Cliffhangers', value: isThriller ? 15 + Math.random() * 5 : 5 + Math.random() * 5, color: '#F59E0B' },
    ];
    
    // Normalize percentages
    const totalDist = genreDistribution.reduce((sum, g) => sum + g.value, 0);
    genreDistribution.forEach(g => g.value = Math.round((g.value / totalDist) * 100));

    // Simulated Engagement Curve
    const engagementCurve = Array.from({ length: Math.min(8, series.number_of_episodes || 8) }).map((_, i) => ({
      name: `E${i + 1}`,
      value: 60 + Math.random() * 40
    }));

    // Bingeability Score
    const cliffhangerVal = isThriller ? 2 : 1;
    const bingeabilityScore = Math.min(10, Math.round((((rating + cliffhangerVal) / 1.1) * 10)) / 10);

    return {
      completionRate,
      rewatchability: Math.round(rewatchability * 10) / 10,
      bestBingeWindow: series.popularity > 100 ? 'Weekend' : 'Late Night',
      storyProgression,
      seriesTone: toneTags.slice(0, 3),
      genreDistribution,
      engagementCurve,
      bingeabilityScore,
      dropOffEpisode: 3 + Math.floor(Math.random() * 2),
      cliffhangerDensity: isThriller ? 'High' : 'Moderate'
    };
  };

  // Comments interface
  interface Comment {
    id: number;
    user: string;
    avatar: string;
    time: string;
    rating: number;
    content: string;
    likes: number;
    dislikes: number;
    replies: Comment[];
    replyCount: number;
    isLiked: boolean;
    isDisliked: boolean;
    episode?: string;
  }

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: 'Emma Thompson',
      avatar: 'ET',
      time: '3 days ago',
      rating: 4.9,
      content: 'This series is absolutely phenomenal! The character development throughout the seasons is incredible. Each episode leaves you wanting more.',
      likes: 32,
      dislikes: 1,
      replies: [],
      replyCount: 4,
      isLiked: false,
      isDisliked: false,
      episode: 'S2E5'
    },
    {
      id: 2,
      user: 'David Kim',
      avatar: 'DK',
      time: '1 week ago',
      rating: 4.5,
      content: 'Binge-watched the entire series in a weekend! The plot twists and character arcs are brilliantly crafted.',
      likes: 21,
      dislikes: 2,
      replies: [],
      replyCount: 2,
      isLiked: true,
      isDisliked: false,
      episode: 'S1E8'
    }
  ]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'episode' | 'popular'>('all');
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Comment functionality handlers
  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        user: 'You',
        avatar: 'ME',
        time: 'Just now',
        rating: 0,
        content: newComment,
        likes: 0,
        dislikes: 0,
        replies: [],
        replyCount: 0,
        isLiked: false,
        isDisliked: false,
        episode: `S${selectedSeason}E${currentEpisode?.episode.episode_number || 1}`
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setShowCommentInput(false);
      toast.success('Comment posted!');
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasLiked = comment.isLiked;
        const wasDisliked = comment.isDisliked;
        
        if (wasLiked) {
          return { ...comment, isLiked: false, likes: comment.likes - 1 };
        } else if (wasDisliked) {
          return { ...comment, isLiked: true, isDisliked: false, likes: comment.likes + 1, dislikes: comment.dislikes - 1 };
        } else {
          return { ...comment, isLiked: true, likes: comment.likes + 1 };
        }
      }
      return comment;
    }));
  };

  const handleDislikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasLiked = comment.isLiked;
        const wasDisliked = comment.isDisliked;
        
        if (wasDisliked) {
          return { ...comment, isDisliked: false, dislikes: comment.dislikes - 1 };
        } else if (wasLiked) {
          return { ...comment, isLiked: false, isDisliked: true, likes: comment.likes - 1, dislikes: comment.dislikes + 1 };
        } else {
          return { ...comment, isDisliked: true, dislikes: comment.dislikes + 1 };
        }
      }
      return comment;
    }));
  };

  const handleReplyToggle = (commentId: number) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleReplyChange = (commentId: number, text: string) => {
    setReplyText(prev => ({ ...prev, [commentId]: text }));
  };

  const handlePostReply = (parentCommentId: number) => {
    if (replyText[parentCommentId]?.trim()) {
      const newReply: Comment = {
        id: Date.now(),
        user: 'You',
        avatar: 'ME',
        time: 'Just now',
        rating: 0,
        content: replyText[parentCommentId]!,
        likes: 0,
        dislikes: 0,
        replies: [],
        replyCount: 0,
        isLiked: false,
        isDisliked: false
      };
      
      setComments(comments.map(comment => 
        comment.id === parentCommentId 
          ? { 
              ...comment, 
              replies: [...(comment.replies || []), newReply],
              replyCount: (comment.replyCount || 0) + 1
            }
          : comment
      ));
      
      setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setReplyingTo(null);
      toast.success('Reply posted!');
    }
  };

  const handleSortComments = (sortType: string) => {
    setSortBy(sortType as 'latest' | 'oldest' | 'popular');
    let sortedComments = [...comments];
    
    switch(sortType) {
      case 'popular':
        sortedComments.sort((a, b) => b.likes - a.likes);
        break;
      case 'latest':
        sortedComments.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        sortedComments.sort((a, b) => a.id - b.id);
        break;
    }
    
    setComments(sortedComments);
  };

  // Fetch season details
  const fetchSeasonDetails = async (seasonNumber: number) => {
    if (seasonDetails && seasonDetails[seasonNumber]) {
      return seasonDetails[seasonNumber];
    }

    setIsSeasonLoading(true);
    try {
      const details = await api.getSeasonDetails(id, seasonNumber) as TMDBSeasonDetail;
      setSeasonDetails(prev => {
        if (!prev) return { [seasonNumber]: details } as unknown as TMDBSeasonDetail;
        return { ...prev, [seasonNumber]: details };
      });
      
      // Create episodes with progress
      const episodesWithProgress: EpisodeWithProgress[] = details.episodes.map((episode, index) => ({
        episode,
        progress: Math.random() * 100, // Simulated progress
        isWatched: Math.random() > 0.3, // Simulated watched status
        isCurrent: index === 3 // Simulated current episode
      }));

      setEpisodes(episodesWithProgress);
      
      // Find current episode and scroll to it
      const currentEpisode = episodesWithProgress.find(ep => ep.isCurrent);
      if (currentEpisode && episodesContainerRef.current) {
        setTimeout(() => {
          const element = document.getElementById(`episode-${currentEpisode.episode.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }

      return details;
    } catch (error) {
      console.error('Failed to fetch season details:', error);
      return null;
    } finally {
      setIsSeasonLoading(false);
    }
  };

  // Handle season change
  const handleSeasonChange = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    await fetchSeasonDetails(seasonNumber);
  };

  // Handle episode play
  const handleEpisodePlay = (episode: TMDBEpisodeDetail) => {
    // Navigate to player
    router.push(`/watch/${id}?type=tv&season=${selectedSeason}&episode=${episode.episode_number}`);
    
    toast.success(`Starting ${episode.name}`);
  };

  // Sort episodes based on order
  const getSortedEpisodes = () => {
    const sorted = [...episodes].sort((a, b) => {
      if (episodeSortOrder === 'asc') {
        return a.episode.episode_number - b.episode.episode_number;
      } else {
        return b.episode.episode_number - a.episode.episode_number;
      }
    });
    return sorted;
  };

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch series details
        const series = await api.getDetails("tv", id) as TMDBTVDetail;
        setSeriesData(series);

        // Fetch cast and crew
        const credits = await api.getCredits("tv", id);
        console.log('Credits data:', credits); // Debug log
        setCast(credits.cast.slice(0, 15));
        
        // Filter crew (Directors, Executive Producers, etc.)
        const importantCrew = credits.crew.filter((person: TMDBCrew) => 
          ['Director', 'Executive Producer', 'Producer', 'Writer', 'Creator'].includes(person.job)
        ).slice(0, 10);
        setCrew(importantCrew);

        // Fetch similar series
        const similar = await api.getSimilar("tv", id);
        const similarSeries = similar.results.filter(item => 'name' in item) as TMDBTVShow[];
        setSimilarSeries(similarSeries.slice(0, 8));

        // Set seasons
        setSeasons(series.seasons || []);
        
        // Default to first season or last watched season
        const defaultSeason = series.number_of_seasons ? Math.min(1, series.number_of_seasons) : 1;
        setSelectedSeason(defaultSeason);
        await fetchSeasonDetails(defaultSeason);

        // Fetch videos for trailer
        const videos = await api.getVideos("tv", id);
        const trailer = videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        // Calculate and set series insights
        const insights = calculateSeriesInsights(series);
        setSeriesInsights(insights);

        // Fetch YouTube scenes (Real fetch)
        try {
          const scenesRes = await fetch(`/api/scenes?q=${encodeURIComponent(series.name)} best moments&maxResults=6`);
          if (scenesRes.ok) {
            const scenesData = await scenesRes.json();
            if (scenesData.clips && scenesData.clips.length > 0) {
              setScenes(scenesData.clips.map((clip: any) => ({
                url: `https://www.youtube.com/watch?v=${clip.id}`,
                title: clip.title,
                duration: clip.duration,
                description: clip.channel,
                videoId: clip.id,
                thumbnail: clip.thumbnail
              })));
            } else {
              // Fallback to genre-based generation if no results
              const genreNames = series.genres?.map(g => g.name.toLowerCase()) || [];
              const generatedScenes = generateScenes(genreNames, series.name);
              setScenes(generatedScenes);
            }
          } else {
            // Fallback to genre-based generation if API fails
            const genreNames = series.genres?.map(g => g.name.toLowerCase()) || [];
            const generatedScenes = generateScenes(genreNames, series.name);
            setScenes(generatedScenes);
          }
        } catch (error) {
          console.error("Error fetching scenes:", error);
          const genreNames = series.genres?.map(g => g.name.toLowerCase()) || [];
          const generatedScenes = generateScenes(genreNames, series.name);
          setScenes(generatedScenes);
        }

      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesData();
  }, [id]);

  const generateScenes = (genres: string[], seriesTitle: string): Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}> => {
    const sceneDatabase: { [key: string]: Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}> } = {
      "drama": [
        {
          url: "https://www.youtube.com/watch?v=8WgU2y9bK7M",
          title: "Best TV Drama Scenes 2024",
          duration: "16:22",
          description: "Powerful performances and emotional moments from television dramas",
          videoId: "8WgU2y9bK7M",
          thumbnail: "https://img.youtube.com/vi/8WgU2y9bK7M/maxresdefault.jpg"
        }
      ],
      "thriller": [
        {
          url: "https://www.youtube.com/watch?v=8hP9D6kZseM",
          title: "TV Thriller Series Scenes",
          duration: "14:28",
          description: "Mind-bending moments and psychological tension from TV thrillers",
          videoId: "8hP9D6kZseM",
          thumbnail: "https://img.youtube.com/vi/8hP9D6kZseM/maxresdefault.jpg"
        }
      ]
    };

    for (const genre of genres) {
      if (sceneDatabase[genre]) {
        return sceneDatabase[genre];
      }
    }
    return sceneDatabase["drama"] || [];
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="relative h-[85vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 h-full flex items-end pb-8">
            <div className="container mx-auto px-4">
              <div className="flex items-end gap-8">
                <div className="hidden lg:block">
                  <div className="w-64 h-96 bg-gray-800 rounded-xl animate-pulse" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="h-12 w-3/4 bg-gray-800 rounded-lg animate-pulse" />
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = seriesData?.name || seriesData?.original_name || "Unknown Title";
  const backdropUrl = seriesData?.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${seriesData.backdrop_path}`
    : '/api/placeholder/1920/800';
  const posterUrl = seriesData?.poster_path 
    ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}`
    : '/api/placeholder/500/750';

  const currentEpisode = episodes.find(ep => ep.isCurrent);
  const totalEpisodes = seriesData?.number_of_episodes || 0;
  const avgRuntime = seriesData?.episode_run_time?.[0] || 45;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div id="hero-series" className="relative h-[85vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-end pb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-end gap-8">
              {/* Poster */}
              <div className="hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative group"
                >
                  <div className="w-64 h-96 rounded-xl overflow-hidden shadow-2xl">
                    <Image
                      src={posterUrl}
                      alt={title}
                      width={256}
                      height={384}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </div>
              
              {/* Series Details */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-4xl lg:text-6xl font-bold mb-4">{title}</h1>
                    
                    {/* Episode Awareness */}
                    {currentEpisode && (
                      <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-400 font-medium">
                            Continue Watching → S{selectedSeason} • E{currentEpisode.episode.episode_number}
                          </span>
                        </div>
                        <span className="text-gray-400">
                          {Math.round((100 - currentEpisode.progress) * avgRuntime / 100)}m left
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span>{seriesData?.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <span>•</span>
                      <span>{seriesData?.first_air_date?.slice(0, 4) || 'N/A'}</span>
                      <span>•</span>
                      <span>{seriesData?.number_of_seasons || 0} Seasons</span>
                      <span>•</span>
                      <div className="flex gap-2">
                        {seriesData?.genres?.slice(0, 3).map((genre) => (
                          <span key={genre.id} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="max-w-3xl">
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {showFullDescription 
                        ? seriesData?.overview 
                        : `${seriesData?.overview?.slice(0, 200)}...`
                      }
                      {seriesData?.overview && seriesData.overview.length > 200 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {currentEpisode ? (
                      <button 
                        onClick={() => handleEpisodePlay(currentEpisode.episode)}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Continue Watching
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          const firstEp = episodes.find(e => e.episode.episode_number === 1);
                          if (firstEp) {
                            handleEpisodePlay(firstEp.episode);
                          } else if (episodes.length > 0) {
                            handleEpisodePlay(episodes[0].episode);
                          } else {
                            // Fallback if episodes not loaded correctly
                            router.push(`/watch/${id}?type=tv&season=1&episode=1`);
                          }
                        }}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Start from S1E1
                      </button>
                    )}
                    <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button 
                      ref={plusButtonRef}
                      onClick={(e) => handleAddClick(e)}
                      className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Popup */}
        <AnimatePresence>
          {isPopupOpen && seriesData && (
            <CollectionPopup
              media={{
                ...seriesData,
                genre_ids: seriesData.genres?.map(g => g.id) || [],
              } as any}
              onClose={() => setIsPopupOpen(false)}
              anchorRect={anchorRect}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Auto-binge Countdown Overlay */}
      <AnimatePresence>
        {autoPlayCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-4">{autoPlayCountdown}</div>
              <div className="text-xl text-gray-300">Next episode starting...</div>
              <button
                onClick={() => setAutoPlayCountdown(null)}
                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episodes & AI Insights Section */}
      <div className="py-12 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Episode List (70%) */}
            <div className="lg:col-span-8">
              {/* Episodes Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">
                    <LayoutGrid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Episodes</h2>
                    <p className="text-gray-400 text-sm font-medium">Season {selectedSeason} • {episodes.length} Episodes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Season Dropdown */}
                  <div className="relative flex-1 sm:flex-initial">
                    <button
                      onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                      className="w-full sm:w-48 flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold text-sm text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        Season {selectedSeason}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSeasonDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showSeasonDropdown && seriesData && (
                      <div className="absolute right-0 mt-3 w-full sm:w-64 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                        <div className="p-2 grid grid-cols-1 gap-1">
                          {seriesData.seasons.map((season) => (
                            <button
                              key={season.id}
                              onClick={() => {
                                setSelectedSeason(season.season_number);
                                setShowSeasonDropdown(false);
                                fetchSeasonDetails(season.season_number);
                              }}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                selectedSeason === season.season_number 
                                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span>Season {season.season_number}</span>
                              <span className="text-[10px] opacity-60 bg-black/20 px-2 py-0.5 rounded-full">
                                {season.episode_count} EPS
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sort Episodes */}
                  <button
                    onClick={() => setEpisodeSortOrder(episodeSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white active:scale-95"
                    title={episodeSortOrder === 'asc' ? "Sort Descending" : "Sort Ascending"}
                  >
                    <ArrowUpDown className={`w-5 h-5 transition-transform duration-500 ${episodeSortOrder === 'desc' ? 'rotate-180 text-red-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Episodes Scrollable Area */}
              <div 
                ref={episodesContainerRef} 
                className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {isSeasonLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                  ))
                ) : (
                  getSortedEpisodes().map((ep) => (
                    <motion.div
                      key={ep.episode.id}
                      id={`episode-${ep.episode.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleEpisodePlay(ep.episode)}
                      className={`group relative flex flex-col md:flex-row gap-6 p-4 rounded-3xl transition-all duration-500 border cursor-pointer ${
                        ep.isCurrent 
                          ? 'bg-red-600/10 border-red-500/30' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Episode Thumbnail */}
                      <div className="relative w-full md:w-64 h-36 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                        {ep.episode.still_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${ep.episode.still_path}`}
                            alt={ep.episode.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 256px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <Play className="w-12 h-12 text-gray-700" />
                          </div>
                        )}
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1 fill-current" />
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {ep.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div 
                              className="h-full bg-red-600 shadow-[0_0_8px_rgba(229,9,20,0.8)]" 
                              style={{ width: `${ep.progress}%` }} 
                            />
                          </div>
                        )}

                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                          EP {ep.episode.episode_number}
                        </div>
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">
                            {ep.episode.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            {ep.isWatched && (
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <Check className="w-3 h-3 text-green-500" />
                                <span className="text-[10px] font-black text-green-500 uppercase">Watched</span>
                              </div>
                            )}
                            <span className="text-xs font-bold text-gray-500">{ep.episode.runtime || avgRuntime}m</span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4 group-hover:text-gray-300 transition-colors">
                          {ep.episode.overview || "No overview available for this episode."}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all active:scale-95">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20 active:scale-95">
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Floating Badge for Current Episode */}
                      {ep.isCurrent && (
                        <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-600/40 z-10 animate-bounce">
                          Watching Now
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* AI Insights (30%) */}
            <div className="lg:col-span-4">
              <AIInsights 
                seriesId={id} 
                seriesTitle={title} 
                onShowMap={() => setShowNarrativeMap(true)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showNarrativeMap && (
            <DetailedNarrativeMap 
              contentId={id.toString()}
              title={title}
              onClose={() => setShowNarrativeMap(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Trailer Video Container */}
      {trailerKey && (
        <div className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative group cursor-pointer">
              {/* High-Quality Thumbnail */}
              <Image
                src={`https://img.youtube.com/vi/${trailerKey}/maxresdefault.jpg`}
                alt="Series Trailer Thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                priority
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transform transition-all duration-300 group-hover:scale-110 group-hover:p-5 shadow-2xl">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
              
              {/* YouTube Badge */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-white text-sm font-medium">YouTube</span>
              </div>
              
              {/* Trailer Text */}
              <div className="absolute bottom-4 left-4">
                <p className="text-white text-lg font-medium">Watch Trailer</p>
                <p className="text-gray-300 text-sm">Click to play</p>
              </div>
              
              {/* Hidden iframe that loads on click */}
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Series Trailer"
                className="w-full h-full absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}

      {/* Cast Carousel (Single Row Circular) */}
      {cast.length > 0 && (
        <div className="py-12 bg-black/50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
                  <Users className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Series Cast</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('cast-scroll-container');
                    if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('cast-scroll-container');
                    if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                  }}
                  className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div 
              id="cast-scroll-container"
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
            >
              {cast.map((person) => (
                <motion.div 
                  key={person.id} 
                  whileHover={{ y: -8 }}
                  onClick={() => router.push(`/${person.name}/info`)}
                  className="w-32 flex-shrink-0 group cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div className="aspect-square rounded-full overflow-hidden bg-gray-900 border-2 border-white/10 group-hover:border-red-500 shadow-2xl transition-all duration-300">
                      {person.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name || "Cast member"}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <Users className="w-12 h-12" />
                        </div>
                      )}
                      
                      {/* Glow Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="text-center px-1">
                    <p className="text-white font-bold text-xs tracking-tight group-hover:text-red-500 transition-colors line-clamp-1">
                      {person.name}
                    </p>
                    <p className="text-gray-500 text-[10px] sm:text-xs mt-1 line-clamp-1 font-medium italic">
                      {person.character}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Series Insights Section */}
      {seriesData && (
        <div className="py-20 bg-gradient-to-b from-black via-gray-950 to-black relative">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-[1400px] mx-auto space-y-12">
              {/* Header Section */}
              <header className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                    <Clapperboard className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                    <h1 className="text-[42px] font-black tracking-tighter text-white uppercase leading-none">
                      Series Insights
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-md border border-white/10">Data-Driven Narrative Analysis</p>
                      <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-purple-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </header>

              {/* Row 1: Series Info & AI Insight */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Series Info Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card glow-blue p-8 flex flex-col min-h-[400px] group/card border border-white/10"
                >
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Info className="w-5 h-5 text-blue-400" />
                      </div>
                      <h2 className="text-xl font-black tracking-wider text-white uppercase">Series Details</h2>
                    </div>
                  </div>

                  <div className="flex-1 space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                      {/* Runtime Metrics */}
                      <div className="flex items-start gap-4 group/item">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover/item:border-blue-500/50 transition-colors">
                          <Tv className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Production</span>
                          <span className="text-lg font-bold text-white">{seriesData.number_of_seasons} Seasons</span>
                          <span className="text-xs text-blue-400 font-bold">{seriesData.number_of_episodes} Total Episodes</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group/item">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover/item:border-emerald-500/50 transition-colors">
                          <Clock className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Format</span>
                          <span className="text-lg font-bold text-white">~{seriesData.episode_run_time?.[0] || 45}m</span>
                          <span className="text-xs text-emerald-400 font-bold">Avg Episode Length</span>
                        </div>
                      </div>

                      {/* Score Metrics */}
                      <div className="flex items-start gap-4 group/item">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover/item:border-amber-500/50 transition-colors">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Reception</span>
                          <span className="text-lg font-bold text-white">{seriesData.vote_average?.toFixed(1)} / 10</span>
                          <span className="text-xs text-amber-500 font-bold">Global Rating</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 group/item">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover/item:border-rose-500/50 transition-colors">
                          <Calendar className="w-5 h-5 text-rose-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Air Date</span>
                          <span className="text-lg font-bold text-white">{seriesData.first_air_date?.split('-')[0]}</span>
                          <span className="text-xs text-rose-500 font-bold">Premiered</span>
                        </div>
                      </div>
                    </div>

                    {/* Genres Row */}
                    <div className="pt-8 border-t border-white/5">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 block">Defined Genres & Categories</span>
                      <div className="flex flex-wrap gap-2">
                        {seriesData.genres?.map(genre => (
                          <span key={genre.id} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:border-white/20 transition-all cursor-default">
                             {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* AI Series Insight Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass-card glow-pink p-8 flex flex-col border border-white/10 bg-black/60 relative overflow-hidden"
                >
                  {/* Decorative AI Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-[60px] rounded-full" />
                  
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Brain className="w-5 h-5 text-purple-400" />
                      </div>
                      <h2 className="text-xl font-black tracking-wider text-white uppercase">AI Series Insight</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Live Analysis</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-6">
                    {/* Row 1: Completion & Rewatchability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Binge Completion Card */}
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-pink-500" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Binge Completion</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="relative w-16 h-16 shrink-0">
                            <svg className="w-full h-full -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                              <circle 
                                cx="32" 
                                cy="32" 
                                r="28" 
                                fill="transparent" 
                                stroke="#FF2E63" 
                                strokeWidth="4" 
                                strokeDasharray="175.9" 
                                strokeDashoffset={175.9 * (1 - seriesInsights.completionRate / 100)} 
                                strokeLinecap="round" 
                                className="transition-all duration-1000"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">{seriesInsights.completionRate}%</span>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white leading-none">High Stickiness</p>
                            <p className="text-[10px] font-medium text-pink-500 mt-1 uppercase tracking-tighter">Viewers finish S1 in 48h</p>
                          </div>
                        </div>
                      </div>

                      {/* Season Rewatchability Card */}
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <RotateCcw className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Rewatchability</span>
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">{seriesInsights.rewatchability}</span>
                          <span className="text-sm font-bold text-gray-500 mb-1.5">/ 5.0</span>
                        </div>
                        <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-tighter flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Classic status potential
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar: Story Progression */}
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Story Progression</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{seriesInsights.storyProgression}</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '85%' }}
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Slow Burn Initial</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">Explosive Finale</span>
                      </div>
                    </div>

                    {/* Tones Selection */}
                    <div className="flex items-center gap-4 px-2">
                      <div className="flex items-center gap-2 shrink-0">
                        <Coffee className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Series Tone</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {seriesInsights.seriesTone.map((tone, idx) => (
                          <span key={tone} className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition-all ${idx === 0 ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                            {tone}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Row 2: Composition & Engagement */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Engagement DNA (Pie Chart) (40%) */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.2 }}
                   className="glass-card glow-purple p-8 lg:col-span-12 xl:col-span-5 flex flex-col border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <LayoutGrid className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-wider text-white uppercase">Engagement DNA</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Genre Distribution per Episode</p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full h-[220px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={seriesInsights.genreDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {seriesInsights.genreDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Primary</span>
                        <span className="text-2xl font-black text-white">Mixed</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      {seriesInsights.genreDistribution.map((genre) => (
                        <div key={genre.name} className="flex items-center justify-between gap-6 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: genre.color }} />
                            <span className="text-xs font-bold text-gray-300">{genre.name}</span>
                          </div>
                          <span className="text-sm font-black text-white">{genre.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Engagement Curve (Area Chart) (70%) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="glass-card glow-blue p-8 lg:col-span-12 xl:col-span-7 flex flex-col border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-black tracking-wider text-white uppercase">Engagement Growth</h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Narrative Tension by Episode</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Retention High
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={seriesInsights.engagementCurve}>
                        <defs>
                          <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="name" 
                          stroke="#4b5563" 
                          fontSize={10} 
                          fontWeight="bold"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'black' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorEngage)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {['Bingeability', 'Completion', 'Drop-off', 'Cliffhangers'].map((metric, i) => (
                      <div key={metric} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center group/metric hover:border-blue-500/30 transition-all">
                        <p className="text-[10px] font-black text-gray-500 group-hover/metric:text-blue-400 uppercase tracking-widest transition-colors">{metric}</p>
                        <p className="text-xl font-black text-white mt-1">
                          {i === 0 ? seriesInsights.bingeabilityScore : (i === 1 ? `${seriesInsights.completionRate}%` : (i === 2 ? `Ep ${seriesInsights.dropOffEpisode}` : seriesInsights.cliffhangerDensity))}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Series Crew Carousel (Single Row Circular) */}
      {crew.length > 0 && (
        <div className="py-20 bg-black overflow-hidden border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-600/20 rounded-2xl border border-amber-500/30">
                  <HeartHandshake className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">The Creators</h2>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Visionaries Behind the Lens</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const el = document.getElementById('crew-scroll-container');
                    if (el) el.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-amber-500/20 hover:border-amber-500/50 transition-all active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-400" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('crew-scroll-container');
                    if (el) el.scrollBy({ left: 400, behavior: 'smooth' });
                  }}
                  className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-amber-500/20 hover:border-amber-500/50 transition-all active:scale-90"
                >
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div 
              id="crew-scroll-container"
              className="flex gap-12 overflow-x-auto scrollbar-hide scroll-smooth pb-8 px-2"
            >
              {crew.map((person) => (
                <motion.div 
                  key={`${person.id}-${person.job}`} 
                  whileHover={{ scale: 1.05 }}
                  className="w-36 flex-shrink-0 group cursor-default"
                >
                  <div className="relative mb-6">
                    <div className="aspect-square rounded-full overflow-hidden bg-gray-950 border-4 border-white/5 group-hover:border-amber-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
                      {person.profile_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          width={144}
                          height={144}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-800 bg-gradient-to-br from-gray-900 to-black">
                          <Users className="w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Premium Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-white font-black text-sm tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1 uppercase">
                      {person.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1 border-t border-white/5 pt-1 mt-1">
                      {person.job}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* You May Also Like (7x2 Grid) */}
      {similarSeries.length > 0 && (
        <div className="py-12 bg-black border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <LayoutGrid className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">You May Also Like</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {similarSeries.slice(0, 14).map((item) => (
                <motion.div 
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/series/${item.id}`)}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-950 shadow-xl border border-white/5 group-hover:border-blue-500/50 transition-all duration-300">
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Tv className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Hover Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md w-fit px-2 py-0.5 rounded-md border border-white/10">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-bold text-[10px]">{item.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-300 font-semibold text-xs line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 65-35 Split Layout: Comments & Scenes */}
      <div className="py-16 bg-gradient-to-b from-black via-gray-950 to-black border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* YouTube Style Comments (65%) */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-2xl border border-red-500/30">
                    <MessageCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Community Discussions</h2>
                    <p className="text-sm text-gray-400">Join the conversation with {comments.length} other fans</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sorting */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Sort by</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {[
                          { id: 'popular', label: 'Top Comments' },
                          { id: 'latest', label: 'Newest First' },
                          { id: 'oldest', label: 'Oldest First' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {
                              handleSortComments(option.id);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex gap-4 mb-10 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold">ME</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on the series..."
                    className="w-full bg-transparent text-white border-b border-white/10 focus:border-red-500 focus:outline-none placeholder-gray-500 text-lg py-1 transition-all resize-none overflow-hidden"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  {newComment.trim() && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end gap-3 mt-4"
                    >
                      <button
                        onClick={() => setNewComment('')}
                        className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePostComment}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-red-600/30"
                      >
                        Comment
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="group">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <span className="text-white font-bold">{comment.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.time}</span>
                            {comment.episode && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded-md uppercase border border-red-500/20">
                                {comment.episode}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-3">{comment.content}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                              <span>{comment.likes}</span>
                            </button>
                            <button 
                              onClick={() => handleDislikeComment(comment.id)}
                              className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${comment.isDisliked ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              <ThumbsDown className={`w-4 h-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <button 
                            onClick={() => handleReplyToggle(comment.id)}
                            className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
                          >
                            REPLY
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replyCount > 0 && (
                          <div className="mt-4">
                            <button 
                              onClick={() => handleReplyToggle(comment.id)}
                              className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${expandedComments.includes(comment.id) ? 'rotate-180' : ''}`} />
                              {expandedComments.includes(comment.id) ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </button>
                            
                            <AnimatePresence>
                              {expandedComments.includes(comment.id) && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-6 border-l-2 border-white/5 mt-4 space-y-6">
                                    {/* Reply Input */}
                                    <div className="flex gap-3">
                                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-[10px] font-bold">ME</span>
                                      </div>
                                      <div className="flex-1">
                                        <input
                                          value={replyText[comment.id] || ''}
                                          onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                          placeholder="Add a reply..."
                                          className="w-full bg-transparent border-b border-white/10 focus:border-red-500 focus:outline-none text-sm py-1 text-white"
                                        />
                                        {(replyText[comment.id] || '').trim() && (
                                          <div className="flex justify-end gap-2 mt-2">
                                            <button 
                                              onClick={() => handlePostReply(comment.id)}
                                              className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Cached Replies Display */}
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                                          <span className="text-white text-[10px] font-bold">{reply.avatar}</span>
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-xs">{reply.user}</span>
                                            <span className="text-[10px] text-gray-500">{reply.time}</span>
                                          </div>
                                          <p className="text-gray-400 text-sm">{reply.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Scenes (35%) */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30">
                    <Film className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Best Moments</h2>
                    <p className="text-sm text-gray-400">Epic scenes from the series</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {scenes.length > 0 ? (
                    scenes.map((scene, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="group relative aspect-video rounded-2xl overflow-hidden bg-gray-900 border border-white/5 cursor-pointer shadow-2xl"
                        onClick={() => window.open(scene.url, '_blank')}
                      >
                        <Image
                          src={scene.thumbnail}
                          alt={scene.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent group-hover:via-black/40 transition-all duration-300" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1 fill-current" />
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-sm line-clamp-1 mb-1 group-hover:text-red-400 transition-colors">
                            {scene.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{scene.description}</span>
                            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">
                              {scene.duration}
                            </span>
                          </div>
                        </div>
                        
                        {/* YouTube Badge */}
                        <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-2.5 h-2.5 text-white fill-current" />
                          <span className="text-[8px] font-black text-white uppercase">YouTube</span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Skeleton/Loading State
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse border border-white/10" />
                    ))
                  )}
                </div>

                <motion.button 
                  whileHover={{ x: 5 }}
                  className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  View Full Library <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BingeSeriesInfo;
