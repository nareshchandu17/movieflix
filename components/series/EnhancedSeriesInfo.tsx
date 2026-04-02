"use client";
import React, { useEffect, useState, useRef } from "react";
import { TMDBTVDetail, TMDBCast, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { Play, Share2, Download, Plus, ChevronLeft, ChevronRight, Star, Calendar, Clock, ThumbsUp, MessageCircle, Film, Globe, DollarSign, TrendingUp, AlertTriangle, Heart, BarChart3, Zap, Users, Eye, Shield, ThumbsDown, Reply, Flag, Clapperboard, Info, Coins, Bot, Moon, RotateCcw, LayoutGrid, Tv } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import "@/styles/movie-insights.css";
import CollectionPopup from "../collections/CollectionPopup";

interface EnhancedSeriesInfoProps {
  id: number;
}

const EnhancedSeriesInfo = ({ id }: EnhancedSeriesInfoProps) => {
  const router = useRouter();
  const [seriesData, setSeriesData] = useState<TMDBTVDetail | null>(null);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [similarSeries, setSimilarSeries] = useState<TMDBTVShow[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [seriesInsights, setSeriesInsights] = useState({
    audienceLove: 63,
    rewatchValue: 4.2,
    intensity: 'High' as 'Low' | 'Medium' | 'High',
    bestWatchTime: 'Night' as 'Day' | 'Night' | 'Weekend',
    seriesMood: ['Dark', 'Thrilling', 'Engaging'] as string[],
    sceneComposition: [
      { name: 'Drama', value: 42, color: '#FF2E63' },
      { name: 'Dialogue', value: 28, color: '#8B5CF6' },
      { name: 'Action', value: 10, color: '#F59E0B' },
      { name: 'Comedy', value: 7, color: '#EC4899' },
      { name: 'Romance', value: 13, color: '#22D3EE' },
    ] as { name: string; value: number; color: string }[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [scenes, setScenes] = useState<Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}>>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareButtonPosition, setShareButtonPosition] = useState({ top: 0, left: 0 });

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
    // Calculate audience love based on vote average and vote count
    const audienceLove = Math.min(95, Math.max(20, Math.round((series.vote_average || 5) * 10 + (series.vote_count || 0) / 10000)));
    
    // Calculate rewatch value based on seasons, rating, and popularity
    const rewatchValue = Math.min(5, Math.max(1, 
      ((series.vote_average || 5) / 10) * 2 + 
      (series.popularity || 10) / 50 + 
      (series.number_of_seasons ? (series.number_of_seasons > 5 ? 0.5 : series.number_of_seasons > 3 ? 1 : 1.5) : 1)
    ));
    
    // Determine intensity based on genres and rating
    const genres = series.genres || [];
    const hasDrama = genres.some(g => g.name.toLowerCase().includes('drama'));
    const hasThriller = genres.some(g => g.name.toLowerCase().includes('thriller'));
    const hasCrime = genres.some(g => g.name.toLowerCase().includes('crime'));
    const rating = series.vote_average || 5;
    
    let intensity: 'Low' | 'Medium' | 'High' = 'Medium';
    if (hasCrime || hasThriller || rating > 7.5) {
      intensity = 'High';
    } else if (rating > 6.5 || hasDrama) {
      intensity = 'Medium';
    } else {
      intensity = 'Low';
    }
    
    // Determine best watch time based on genres and rating
    let bestWatchTime: 'Day' | 'Night' | 'Weekend' = 'Night';
    if (hasCrime || hasThriller || (hasDrama && rating > 7)) {
      bestWatchTime = 'Night';
    } else if (genres.some(g => g.name.toLowerCase().includes('comedy') || g.name.toLowerCase().includes('family'))) {
      bestWatchTime = 'Day';
    } else {
      bestWatchTime = 'Weekend';
    }
    
    // Determine series mood based on genres and themes
    const seriesMood: string[] = [];
    if (hasCrime || hasThriller) seriesMood.push('Dark');
    if (hasDrama) seriesMood.push('Engaging');
    if (rating > 8) seriesMood.push('Compelling');
    if (genres.some(g => g.name.toLowerCase().includes('romance'))) seriesMood.push('Romantic');
    if (genres.some(g => g.name.toLowerCase().includes('comedy'))) seriesMood.push('Light-hearted');
    if (seriesMood.length === 0) seriesMood.push('Dramatic');
    
    // Calculate scene composition based on genres
    const sceneComposition: { name: string; value: number; color: string }[] = [
      { name: 'Drama', value: hasDrama ? 35 + Math.random() * 20 : 15 + Math.random() * 10, color: '#FF2E63' },
      { name: 'Dialogue', value: 30 + Math.random() * 15, color: '#8B5CF6' },
      { name: 'Action', value: genres.some(g => g.name.toLowerCase().includes('action')) ? 15 + Math.random() * 10 : 5 + Math.random() * 5, color: '#F59E0B' },
      { name: 'Comedy', value: genres.some(g => g.name.toLowerCase().includes('comedy')) ? 10 + Math.random() * 10 : 3 + Math.random() * 5, color: '#EC4899' },
      { name: 'Romance', value: genres.some(g => g.name.toLowerCase().includes('romance')) ? 10 + Math.random() * 10 : 5 + Math.random() * 5, color: '#22D3EE' },
    ];
    
    // Normalize percentages to sum to 100
    const total = sceneComposition.reduce((sum, scene) => sum + scene.value, 0);
    sceneComposition.forEach(scene => {
      scene.value = Math.round((scene.value / total) * 100);
    });
    
    return {
      audienceLove,
      rewatchValue: Math.round(rewatchValue * 10) / 10,
      intensity,
      bestWatchTime,
      seriesMood: seriesMood.slice(0, 3) as string[],
      sceneComposition
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
  }

// Comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: 'Emma Thompson',
      avatar: 'ET',
      time: '3 days ago',
      rating: 4.9,
      content: 'This series is absolutely phenomenal! The character development throughout the seasons is incredible. Each episode leaves you wanting more. The writing is top-notch and the performances are outstanding.',
      likes: 32,
      dislikes: 1,
      replies: [],
      replyCount: 4,
      isLiked: false,
      isDisliked: false
    },
    {
      id: 2,
      user: 'David Kim',
      avatar: 'DK',
      time: '1 week ago',
      rating: 4.5,
      content: 'Binge-watched the entire series in a weekend! The plot twists and character arcs are brilliantly crafted. Some seasons are stronger than others, but overall it\'s a masterpiece.',
      likes: 21,
      dislikes: 2,
      replies: [],
      replyCount: 2,
      isLiked: true,
      isDisliked: false
    },
    {
      id: 3,
      user: 'Sophia Martinez',
      avatar: 'SM',
      time: '2 weeks ago',
      rating: 4.1,
      content: 'Great series with excellent world-building. The first season starts slow but really picks up. The finale was satisfying and tied everything together beautifully.',
      likes: 15,
      dislikes: 3,
      replies: [],
      replyCount: 1,
      isLiked: false,
      isDisliked: false
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  // Comment functionality handlers
  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment = {
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
        isDisliked: false
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setShowCommentInput(false);
    }
  };

  const handleLikeComment = (commentId: number) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasLiked = comment.isLiked;
        const wasDisliked = comment.isDisliked;
        
        if (wasLiked) {
          return { 
            ...comment, 
            isLiked: false, 
            likes: comment.likes - 1 
          };
        } else if (wasDisliked) {
          return { 
            ...comment, 
            isLiked: true, 
            isDisliked: false,
            likes: comment.likes + 1, 
            dislikes: comment.dislikes - 1 
          };
        } else {
          return { 
            ...comment, 
            isLiked: true, 
            likes: comment.likes + 1 
          };
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
          return { 
            ...comment, 
            isDisliked: false, 
            dislikes: comment.dislikes - 1 
          };
        } else if (wasLiked) {
          return { 
            ...comment, 
            isLiked: false, 
            isDisliked: true,
            likes: comment.likes - 1, 
            dislikes: comment.dislikes + 1 
          };
        } else {
          return { 
            ...comment, 
            isDisliked: true, 
            dislikes: comment.dislikes + 1 
          };
        }
      }
      return comment;
    }));
  };

  const handleReportComment = (commentId: number) => {
    console.log('Report comment:', commentId);
    alert('Comment reported. Thank you for helping keep our community safe.');
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
    }
  };

  const handleSortComments = (sortType: string) => {
    setSortBy(sortType);
    let sortedComments = [...comments];
    
    switch(sortType) {
      case 'recent':
        sortedComments.sort((a, b) => b.id - a.id);
        break;
      case 'liked':
        sortedComments.sort((a, b) => b.likes - a.likes);
        break;
      case 'rating':
        sortedComments.sort((a, b) => b.rating - a.rating);
        break;
      case 'disliked':
        sortedComments.sort((a, b) => b.dislikes - a.dislikes);
        break;
    }
    
    setComments(sortedComments);
  };

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch series details
        const series = await api.getDetails("tv", id) as TMDBTVDetail;
        setSeriesData(series);

        // Fetch cast
        const credits = await api.getCredits("tv", id);
        setCast(credits.cast.slice(0, 15));

        // Fetch similar series
        const similar = await api.getSimilar("tv", id);
        const similarSeries = similar.results.filter(item => 'name' in item) as TMDBTVShow[];
        setSimilarSeries(similarSeries.slice(0, 15));

        // Fetch videos for trailer
        const videos = await api.getVideos("tv", id);
        const trailer = videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        // Calculate and set series insights based on real data
        const insights = calculateSeriesInsights(series);
        setSeriesInsights(insights);

        setIsLoading(false);

        // Generate scenes based on genre
        const genreNames = series.genres?.map(g => g.name.toLowerCase()) || [];
        const generatedScenes = generateScenes(genreNames, series.name);
        setScenes(generatedScenes);

      } catch (error) {
        console.error("Error fetching series data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesData();
  }, [id]);

  const generateScenes = (genres: string[], seriesTitle: string): Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}> => {
    // YouTube video data based on genres with real video IDs
    const sceneDatabase: { [key: string]: Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}> } = {
      "drama": [
        {
          url: "https://www.youtube.com/watch?v=8WgU2y9bK7M",
          title: "Best TV Drama Scenes 2024",
          duration: "16:22",
          description: "Powerful performances and emotional moments from television dramas",
          videoId: "8WgU2y9bK7M",
          thumbnail: "https://img.youtube.com/vi/8WgU2y9bK7M/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=3HqQk7L4VvE",
          title: "Emotional TV Series Moments",
          duration: "14:56",
          description: "Tear-jerking scenes and emotional impact from TV shows",
          videoId: "3HqQk7L4VvE",
          thumbnail: "https://img.youtube.com/vi/3HqQk7L4VvE/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=5RtB4u7j2sA",
          title: "TV Series Speech Scenes",
          duration: "12:38",
          description: "Uplifting monologues and motivational moments from television",
          videoId: "5RtB4u7j2sA",
          thumbnail: "https://img.youtube.com/vi/5RtB4u7j2sA/maxresdefault.jpg"
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
        },
        {
          url: "https://www.youtube.com/watch?v=5xI0S9PEE6A",
          title: "Suspenseful TV Moments",
          duration: "11:45",
          description: "Edge-of-your-seat tension and anticipation from TV series",
          videoId: "5xI0S9PEE6A",
          thumbnail: "https://img.youtube.com/vi/5xI0S9PEE6A/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=J4QVxH4R9sQ",
          title: "TV Series Plot Twists",
          duration: "16:33",
          description: "Shocking revelations and unexpected turns from television",
          videoId: "J4QVxH4R9sQ",
          thumbnail: "https://img.youtube.com/vi/J4QVxH4R9sQ/maxresdefault.jpg"
        }
      ],
      "comedy": [
        {
          url: "https://www.youtube.com/watch?v=J--dVDm4d7E",
          title: "Funniest TV Series Moments",
          duration: "18:42",
          description: "Hilarious scenes from recent comedy TV shows",
          videoId: "J--dVDm4d7E",
          thumbnail: "https://img.youtube.com/vi/J--dVDm4d7E/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=H7c8jB3_2jQ",
          title: "TV Comedy Dialogue Scenes",
          duration: "15:28",
          description: "Witty banter and comedic conversations from TV series",
          videoId: "H7c8jB3_2jQ",
          thumbnail: "https://img.youtube.com/vi/H7c8jB3_2jQ/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=K4wT5r6J3sA",
          title: "TV Sitcom Highlights",
          duration: "12:15",
          description: "Best moments from television sitcoms and comedies",
          videoId: "K4wT5r6J3sA",
          thumbnail: "https://img.youtube.com/vi/K4wT5r6J3sA/maxresdefault.jpg"
        }
      ],
      "crime": [
        {
          url: "https://www.youtube.com/watch?v=7Wtq0mCq9V8",
          title: "TV Crime Drama Scenes",
          duration: "12:05",
          description: "Crime solving and investigation moments from TV series",
          videoId: "7Wtq0mCq9V8",
          thumbnail: "https://img.youtube.com/vi/7Wtq0mCq9V8/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=2H3c8xKmQvI",
          title: "Police Procedural Scenes",
          duration: "9:17",
          description: "Intense investigation sequences from crime TV shows",
          videoId: "2H3c8xKmQvI",
          thumbnail: "https://img.youtube.com/vi/2H3c8xKmQvI/maxresdefault.jpg"
        },
        {
          url: "https://www.youtube.com/watch?v=9LmX4nN7sRm",
          title: "Detective Series Highlights",
          duration: "13:37",
          description: "Classic detective moments from television crime dramas",
          videoId: "9LmX4nN7sRm",
          thumbnail: "https://img.youtube.com/vi/9LmX4nN7sRm/maxresdefault.jpg"
        }
      ]
    };

    // Find matching genre scenes or default to drama
    for (const genre of genres) {
      if (sceneDatabase[genre]) {
        return sceneDatabase[genre];
      }
    }
    return sceneDatabase["drama"];
  };


  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  // Share functionality
  const handleShare = async (platform: string) => {
    if (!seriesData) return;
    
    const url = window.location.href;
    const title = seriesData.name;
    const text = `Check out "${title}" series on MovieFlix!`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
          setShowShareMenu(false);
          return;
        } catch (err) {
          console.error('Failed to copy link:', err);
          toast.error('Failed to copy link');
          return;
        }
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Hero Section Skeleton */}
        <div className="relative h-[75vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="relative z-10 h-full flex items-end pb-8">
            <div className="container mx-auto px-4">
              <div className="flex items-end gap-8">
                {/* Poster Skeleton */}
                <div className="hidden lg:block">
                  <div className="w-64 h-96 bg-gray-800 rounded-xl animate-pulse" />
                </div>
                
                {/* Series Details Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="h-12 w-3/4 bg-gray-800 rounded-lg animate-pulse" />
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-6 bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                    <div className="h-6 w-6 bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-32 bg-gray-800 rounded-lg animate-pulse" />
                    <div className="h-12 w-40 bg-gray-800 rounded-lg animate-pulse" />
                    <div className="h-12 w-12 bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-12 w-12 bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-12 w-12 bg-gray-800 rounded-full animate-pulse" />
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[75vh] overflow-hidden">
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

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
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
                      <span>{seriesData?.number_of_episodes || 0} Episodes</span>
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
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Watch Now
                    </button>
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

      {/* Premium Cinematic Information Hub */}
      <div className="py-12 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Main Content - 75% */}
            <div className="w-full lg:w-3/4 space-y-6">
              
              {/* Main Glass Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
              >
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Tv className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Series Intelligence</h2>
                    <p className="text-gray-400">AI-powered insights and analytics</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{seriesInsights.audienceLove}%</div>
                    <div className="text-sm text-gray-400">Audience Love</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{seriesInsights.rewatchValue}</div>
                    <div className="text-sm text-gray-400">Rewatch Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{seriesInsights.intensity}</div>
                    <div className="text-sm text-gray-400">Intensity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{seriesInsights.bestWatchTime}</div>
                    <div className="text-sm text-gray-400">Best Time</div>
                  </div>
                </div>

                {/* Mood Tags */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Series Mood</h3>
                  <div className="flex flex-wrap gap-3">
                    {seriesInsights.seriesMood.map((mood, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scene Composition Chart */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Scene Composition</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={seriesInsights.sceneComposition}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {seriesInsights.sceneComposition.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {seriesInsights.sceneComposition.map((scene, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scene.color }}
                        />
                        <span className="text-sm text-gray-400">{scene.name}: {scene.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cast Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
              >
                <h2 className="text-2xl font-bold mb-6">Cast & Crew</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {cast.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="text-center group cursor-pointer"
                    >
                      <div className="relative mb-3">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gray-800">
                          {person.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                              alt={person.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <Users className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-white line-clamp-1">{person.name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{person.character}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Community Reviews</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortComments(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="recent">Recent</option>
                      <option value="liked">Most Liked</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Add Comment */}
                <div className="mb-6">
                  {!showCommentInput ? (
                    <button
                      onClick={() => setShowCommentInput(true)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
                    >
                      <span className="text-gray-400">Share your thoughts about this series...</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your review..."
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                        rows={4}
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowCommentInput(false);
                            setNewComment('');
                          }}
                          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePostComment}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Post Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-white/5 pb-4 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-white">{comment.user}</span>
                              <span className="text-gray-400 text-sm ml-2">{comment.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-gray-400">{comment.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-300 mb-3">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                comment.isLiked ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{comment.likes}</span>
                            </button>
                            <button
                              onClick={() => handleDislikeComment(comment.id)}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                comment.isDisliked ? 'text-red-400' : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span>{comment.dislikes}</span>
                            </button>
                            <button
                              onClick={() => handleReplyToggle(comment.id)}
                              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                              <span>Reply</span>
                            </button>
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              <Flag className="w-4 h-4" />
                              <span>Report</span>
                            </button>
                          </div>
                          
                          {/* Reply Section */}
                          {expandedComments.includes(comment.id) && (
                            <div className="mt-4 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start gap-3 pl-4 border-l border-white/10">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                                    {reply.avatar}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-white text-sm">{reply.user}</span>
                                      <span className="text-gray-400 text-xs">{reply.time}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Reply Input */}
                              <div className="flex items-start gap-3 pl-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                  ME
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyText[comment.id] || ''}
                                    onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                    placeholder="Write a reply..."
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none text-sm"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => setReplyingTo(null)}
                                      className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handlePostReply(comment.id)}
                                      className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Sidebar - 25% */}
            <div className="w-full lg:w-1/4 space-y-6">
              
              {/* Similar Series */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
              >
                <h3 className="text-xl font-bold mb-4">Similar Series</h3>
                <div className="space-y-4">
                  {similarSeries.slice(0, 6).map((series, index) => (
                    <motion.div
                      key={series.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                      className="flex gap-3 group cursor-pointer"
                      onClick={() => router.push(`/series/${series.id}`)}
                    >
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                        {series.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${series.poster_path}`}
                            alt={series.name}
                            width={64}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Tv className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {series.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {series.first_air_date?.slice(0, 4)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{series.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Seasons Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5"
              >
                <h3 className="text-xl font-bold mb-4">Series Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Seasons</span>
                    <span className="text-white font-medium">{seriesData?.number_of_seasons || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Episodes</span>
                    <span className="text-white font-medium">{seriesData?.number_of_episodes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-medium">{seriesData?.status || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Language</span>
                    <span className="text-white font-medium">{seriesData?.original_language?.toUpperCase() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network</span>
                    <span className="text-white font-medium">
                      {seriesData?.networks?.[0]?.name || 'Unknown'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Watch Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold">Watch Stats</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg. Watch Time</span>
                    <span className="text-white font-medium">45 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completion Rate</span>
                    <span className="text-white font-medium">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Binge Score</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesInfo;
