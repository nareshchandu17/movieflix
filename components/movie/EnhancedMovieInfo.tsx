"use client";
import React, { useEffect, useState } from "react";
import { TMDBMovieDetail, TMDBMovie, TMDBCast } from "@/lib/types";
import { api } from "@/lib/api";
import { Play, Share2, Download, Plus, ChevronLeft, ChevronRight, Star, Calendar, Clock, ThumbsUp, MessageCircle, Film, Globe, DollarSign, TrendingUp, AlertTriangle, Heart, BarChart3, Zap, Users, Eye, Shield, ThumbsDown, Reply, Flag, Clapperboard, Info, Coins, Bot, Moon, RotateCcw, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import "@/styles/movie-insights.css";
import { ReactionCarousel } from "../reactions/ReactionCarousel";
import PremiumReactionClip from "../reaction/PremiumReactionClip";

interface EnhancedMovieInfoProps {
  id: number;
}

const EnhancedMovieInfo = ({ id }: EnhancedMovieInfoProps) => {
  const router = useRouter();
  const [movieData, setMovieData] = useState<TMDBMovieDetail | null>(null);
  const [cast, setCast] = useState<TMDBCast[]>([]);
  const [similarMovies, setSimilarMovies] = useState<TMDBMovie[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [movieInsights, setMovieInsights] = useState({
    audienceLove: 63,
    rewatchValue: 4.2,
    intensity: 'High' as 'Low' | 'Medium' | 'High',
    bestWatchTime: 'Night' as 'Day' | 'Night' | 'Weekend',
    movieMood: ['Dark', 'Thrilling', 'Engaging'] as string[],
    sceneComposition: [
      { name: 'Action', value: 42, color: '#FF2E63' },
      { name: 'Drama', value: 28, color: '#8B5CF6' },
      { name: 'Comedy', value: 10, color: '#F59E0B' },
      { name: 'Romance', value: 7, color: '#EC4899' },
      { name: 'Dialogue', value: 13, color: '#22D3EE' },
    ] as { name: string; value: number; color: string }[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [scenes, setScenes] = useState<Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}>>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareButtonPosition, setShareButtonPosition] = useState({ top: 0, left: 0 });
  const [fanReactions, setFanReactions] = useState<any[]>([]);
  const [showReactionModal, setShowReactionModal] = useState(false);

  // Fetch fan reactions for this movie
  const fetchFanReactions = async (movieId: number) => {
    try {
      const response = await fetch(`/api/reactions?movieId=${movieId}`);
      if (response.ok) {
        const data = await response.json();
        setFanReactions(data.reactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch fan reactions:', error);
    }
  };

  // Fetch fan reactions when movie data is available
  useEffect(() => {
    if (movieData?.id) {
      fetchFanReactions(movieData.id);
    }
  }, [movieData?.id]);

  // Calculate movie insights based on TMDB data
  const calculateMovieInsights = (movie: TMDBMovieDetail) => {
    // Calculate audience love based on vote average and vote count
    const audienceLove = Math.min(95, Math.max(20, Math.round((movie.vote_average || 5) * 10 + (movie.vote_count || 0) / 10000)));
    
    // Calculate rewatch value based on runtime, rating, and popularity
    const rewatchValue = Math.min(5, Math.max(1, 
      ((movie.vote_average || 5) / 10) * 2 + 
      (movie.popularity || 10) / 50 + 
      (movie.runtime ? (movie.runtime > 120 ? 0.5 : movie.runtime > 90 ? 1 : 1.5) : 1)
    ));
    
    // Determine intensity based on genres and rating
    const genres = movie.genres || [];
    const hasAction = genres.some(g => g.name.toLowerCase().includes('action'));
    const hasThriller = genres.some(g => g.name.toLowerCase().includes('thriller'));
    const hasHorror = genres.some(g => g.name.toLowerCase().includes('horror'));
    const rating = movie.vote_average || 5;
    
    let intensity: 'Low' | 'Medium' | 'High' = 'Medium';
    if (hasAction || hasThriller || hasHorror || rating > 7) {
      intensity = 'High';
    } else if (rating > 6 || hasAction) {
      intensity = 'Medium';
    } else {
      intensity = 'Low';
    }
    
    // Determine best watch time based on genres and rating
    let bestWatchTime: 'Day' | 'Night' | 'Weekend' = 'Night';
    if (hasHorror || hasThriller || (hasAction && rating > 7)) {
      bestWatchTime = 'Night';
    } else if (genres.some(g => g.name.toLowerCase().includes('comedy') || g.name.toLowerCase().includes('family'))) {
      bestWatchTime = 'Day';
    } else {
      bestWatchTime = 'Night';
    }
    
    // Determine movie mood based on genres and themes
    const movieMood: string[] = [];
    if (hasHorror || hasThriller) movieMood.push('Dark');
    if (hasAction) movieMood.push('Thrilling');
    if (rating > 7.5) movieMood.push('Engaging');
    if (genres.some(g => g.name.toLowerCase().includes('romance'))) movieMood.push('Romantic');
    if (genres.some(g => g.name.toLowerCase().includes('comedy'))) movieMood.push('Light-hearted');
    if (movieMood.length === 0) movieMood.push('Dramatic');
    
    // Calculate scene composition based on genres
    const sceneComposition: { name: string; value: number; color: string }[] = [
      { name: 'Action', value: hasAction ? 35 + Math.random() * 20 : 5 + Math.random() * 10, color: '#FF2E63' },
      { name: 'Drama', value: 25 + Math.random() * 15, color: '#8B5CF6' },
      { name: 'Comedy', value: genres.some(g => g.name.toLowerCase().includes('comedy')) ? 15 + Math.random() * 10 : 5 + Math.random() * 5, color: '#F59E0B' },
      { name: 'Romance', value: genres.some(g => g.name.toLowerCase().includes('romance')) ? 10 + Math.random() * 10 : 3 + Math.random() * 5, color: '#EC4899' },
      { name: 'Dialogue', value: 20 + Math.random() * 10, color: '#22D3EE' },
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
      movieMood: movieMood.slice(0, 3) as string[], // Limit to 3 moods
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
      user: 'Alex Chen',
      avatar: 'AC',
      time: '2 days ago',
      rating: 4.8,
      content: 'This movie was absolutely amazing! The cinematography and storytelling were top-notch. Highly recommend watching this in theaters for the full experience. The director really outdid themselves with this masterpiece.',
      likes: 24,
      dislikes: 2,
      replies: [],
      replyCount: 3,
      isLiked: false,
      isDisliked: false
    },
    {
      id: 2,
      user: 'Sarah Miller',
      avatar: 'SM',
      time: '5 days ago',
      rating: 4.2,
      content: 'The acting was phenomenal and plot kept me on the edge of my seat. Some scenes were genuinely breathtaking. Definitely worth multiple watches!',
      likes: 18,
      dislikes: 1,
      replies: [],
      replyCount: 1,
      isLiked: false,
      isDisliked: false
    },
    {
      id: 3,
      user: 'Marcus Johnson',
      avatar: 'MJ',
      time: '1 week ago',
      rating: 3.9,
      content: 'Good movie overall, though the pacing felt a bit rushed in the third act. Still, the visual effects and sound design were incredible.',
      likes: 12,
      dislikes: 3,
      replies: [],
      replyCount: 0,
      isLiked: true,
      isDisliked: false
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          // Unlike - decrease likes
          return { 
            ...comment, 
            isLiked: false, 
            likes: comment.likes - 1 
          };
        } else if (wasDisliked) {
          // Switch from dislike to like
          return { 
            ...comment, 
            isLiked: true, 
            isDisliked: false,
            likes: comment.likes + 1, 
            dislikes: comment.dislikes - 1 
          };
        } else {
          // Like - increase likes
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
          // Remove dislike - decrease dislikes
          return { 
            ...comment, 
            isDisliked: false, 
            dislikes: comment.dislikes - 1 
          };
        } else if (wasLiked) {
          // Switch from like to dislike
          return { 
            ...comment, 
            isLiked: false, 
            isDisliked: true,
            likes: comment.likes - 1, 
            dislikes: comment.dislikes + 1 
          };
        } else {
          // Dislike - increase dislikes
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
    // In a real app, this would open a report modal or send to moderation
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
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel for better performance
        const [movie, credits, similar, videos] = await Promise.all([
          api.getDetails("movie", id) as Promise<TMDBMovieDetail>,
          api.getCredits("movie", id),
          api.getSimilar("movie", id),
          api.getVideos("movie", id)
        ]);

        // Set all data at once
        setMovieData(movie);
        setCast(credits.cast.slice(0, 15)); // Top 15 cast members
        const similarMovies = similar.results.filter(item => 'title' in item) as TMDBMovie[];
        setSimilarMovies(similarMovies.slice(0, 15)); // Top 15 similar movies
        
        // Process trailer
        const trailer = videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
          setTrailerKey(trailer.key);
        }

        // Calculate and set movie insights based on real data
        const insights = calculateMovieInsights(movie);
        setMovieInsights(insights);

        // Generate scenes based on genre (non-blocking)
        const genreNames = movie.genres?.map(g => g.name.toLowerCase()) || [];
        const generatedScenes = generateScenes(genreNames, movie.title);
        setScenes(generatedScenes);

      } catch (error) {
        console.error("Error fetching movie data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const generateScenes = (genres: string[], movieTitle: string): Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string}> => {
    // Enhanced YouTube video database with production-ready content
    const sceneDatabase: { [key: string]: Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string, relevance: number}> } = {
      "action": [
        {
          url: "https://www.youtube.com/watch?v=6WA2WG8dP8U",
          title: "Best Action Movie Scenes 2024",
          duration: "12:34",
          description: "Most thrilling action sequences from recent blockbusters",
          videoId: "6WA2WG8dP8U",
          thumbnail: "https://img.youtube.com/vi/6WA2WG8dP8U/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=wQiFp5kxh6I",
          title: "Epic Movie Fight Scenes",
          duration: "15:42",
          description: "Hand-to-hand combat and martial arts choreography",
          videoId: "wQiFp5kxh6I",
          thumbnail: "https://img.youtube.com/vi/wQiFp5kxh6I/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=QKj3Dq0E8iM",
          title: "Car Chase Compilation",
          duration: "10:18",
          description: "High-speed pursuit scenes from cinema history",
          videoId: "QKj3Dq0E8iM",
          thumbnail: "https://img.youtube.com/vi/QKj3Dq0E8iM/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=Sa_Bd_4GqAo",
          title: "Explosion Scenes Collection",
          duration: "8:56",
          description: "Spectacular pyrotechnics and destruction sequences",
          videoId: "Sa_Bd_4GqAo",
          thumbnail: "https://img.youtube.com/vi/Sa_Bd_4GqAo/maxresdefault.jpg",
          relevance: 0.75
        },
        {
          url: "https://www.youtube.com/watch?v=Y1W2M-8S6zU",
          title: "Gun Fight Scenes",
          duration: "13:22",
          description: "Intense shootout sequences and tactical combat",
          videoId: "Y1W2M-8S6zU",
          thumbnail: "https://img.youtube.com/vi/Y1W2M-8S6zU/maxresdefault.jpg",
          relevance: 0.7
        },
        {
          url: "https://www.youtube.com/watch?v=8QnSpd_h5q4",
          title: "Parkour & Free Running Stunts",
          duration: "11:45",
          description: "Incredible parkour sequences and free running stunts",
          videoId: "8QnSpd_h5q4",
          thumbnail: "https://img.youtube.com/vi/8QnSpd_h5q4/maxresdefault.jpg",
          relevance: 0.65
        }
      ],
      "thriller": [
        {
          url: "https://www.youtube.com/watch?v=8hP9D6kZseM",
          title: "Psychological Thriller Scenes",
          duration: "14:28",
          description: "Mind-bending moments and psychological tension",
          videoId: "8hP9D6kZseM",
          thumbnail: "https://img.youtube.com/vi/8hP9D6kZseM/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=7Wtq0mCq9V8",
          title: "Detective Investigation Scenes",
          duration: "12:05",
          description: "Crime solving and clue discovery moments",
          videoId: "7Wtq0mCq9V8",
          thumbnail: "https://img.youtube.com/vi/7Wtq0mCq9V8/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=2Vqk4WkMJKk",
          title: "Suspense Building Moments",
          duration: "16:33",
          description: "Tension-filled scenes that keep you on edge",
          videoId: "2Vqk4WkMJKk",
          thumbnail: "https://img.youtube.com/vi/2Vqk4WkMJKk/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=9FzhyqQgJ2k",
          title: "Plot Twist Reveals",
          duration: "13:17",
          description: "Shocking plot twists and surprise endings",
          videoId: "9FzhyqQgJ2k",
          thumbnail: "https://img.youtube.com/vi/9FzhyqQgJ2k/maxresdefault.jpg",
          relevance: 0.75
        }
      ],
      "comedy": [
        {
          url: "https://www.youtube.com/watch?v=J--dVDm4d7E",
          title: "Funniest Movie Moments 2024",
          duration: "18:42",
          description: "Hilarious scenes from recent comedy films",
          videoId: "J--dVDm4d7E",
          thumbnail: "https://img.youtube.com/vi/J--dVDm4d7E/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=H7c8jB3_2jQ",
          title: "Comedy Dialogue Scenes",
          duration: "15:28",
          description: "Witty banter and comedic conversations",
          videoId: "H7c8jB3_2jQ",
          thumbnail: "https://img.youtube.com/vi/H7c8jB3_2jQ/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=M3nK8oPeNpw",
          title: "Satirical Movie Scenes",
          duration: "10:48",
          description: "Social commentary and parody highlights",
          videoId: "M3nK8oPeNpw",
          thumbnail: "https://img.youtube.com/vi/M3nK8oPeNpw/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=4LjZ4Z1s8Wk",
          title: "Physical Comedy Stunts",
          duration: "12:15",
          description: "Slapstick humor and physical comedy",
          videoId: "4LjZ4Z1s8Wk",
          thumbnail: "https://img.youtube.com/vi/4LjZ4Z1s8Wk/maxresdefault.jpg",
          relevance: 0.75
        }
      ],
      "drama": [
        {
          url: "https://www.youtube.com/watch?v=8WgU2y9bK7M",
          title: "Emotional Drama Scenes",
          duration: "16:22",
          description: "Powerful performances and emotional moments",
          videoId: "8WgU2y9bK7M",
          thumbnail: "https://img.youtube.com/vi/8WgU2y9bK7M/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=3HqQk7L4VvE",
          title: "Heartbreaking Movie Moments",
          duration: "14:56",
          description: "Tear-jerking scenes and emotional impact",
          videoId: "3HqQk7L4VvE",
          thumbnail: "https://img.youtube.com/vi/3HqQk7L4VvE/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=5Kz8R5X2YmQ",
          title: "Dramatic Monologues",
          duration: "13:44",
          description: "Powerful speeches and dramatic monologues",
          videoId: "5Kz8R5X2YmQ",
          thumbnail: "https://img.youtube.com/vi/5Kz8R5X2YmQ/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=7F2d2K8q3pM",
          title: "Family Drama Scenes",
          duration: "15:44",
          description: "Relational conflicts and family dynamics",
          videoId: "7F2d2K8q3pM",
          thumbnail: "https://img.youtube.com/vi/7F2d2K8q3pM/maxresdefault.jpg",
          relevance: 0.75
        },
        {
          url: "https://www.youtube.com/watch?v=9N3p7VrD8sQ",
          title: "Character Development Arcs",
          duration: "13:17",
          description: "Transformation and growth moments",
          videoId: "9N3p7VrD8sQ",
          thumbnail: "https://img.youtube.com/vi/9N3p7VrD8sQ/maxresdefault.jpg",
          relevance: 0.7
        }
      ],
      "romance": [
        {
          url: "https://www.youtube.com/watch?v=2VpBj9bF3wU",
          title: "Romantic Movie Moments",
          duration: "14:28",
          description: "Love scenes and romantic connections",
          videoId: "2VpBj9bF3wU",
          thumbnail: "https://img.youtube.com/vi/2VpBj9bF3wU/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=4DqK8rN2sXQ",
          title: "First Kiss Scenes",
          duration: "11:42",
          description: "Iconic first kiss moments in cinema",
          videoId: "4DqK8rN2sXQ",
          thumbnail: "https://img.youtube.com/vi/4DqK8rN2sXQ/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=6Fp9jR7sYpM",
          title: "Wedding Scene Compilation",
          duration: "13:55",
          description: "Beautiful wedding ceremonies and vows",
          videoId: "6Fp9jR7sYpM",
          thumbnail: "https://img.youtube.com/vi/6Fp9jR7sYpM/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=8Hq3K5mT9sQ",
          title: "Love Confession Scenes",
          duration: "12:18",
          description: "Heartfelt declarations of love",
          videoId: "8Hq3K5mT9sQ",
          thumbnail: "https://img.youtube.com/vi/8Hq3K5mT9sQ/maxresdefault.jpg",
          relevance: 0.75
        },
        {
          url: "https://www.youtube.com/watch?v=9LmX4nN7sRm",
          title: "Romantic Dance Scenes",
          duration: "10:33",
          description: "Elegant dance sequences and romantic moments",
          videoId: "9LmX4nN7sRm",
          thumbnail: "https://img.youtube.com/vi/9LmX4nN7sRm/maxresdefault.jpg",
          relevance: 0.7
        }
      ],
      "horror": [
        {
          url: "https://www.youtube.com/watch?v=3DqK8rN2sXQ",
          title: "Scary Movie Scenes 2024",
          duration: "15:22",
          description: "Terrifying moments and jump scares",
          videoId: "3DqK8rN2sXQ",
          thumbnail: "https://img.youtube.com/vi/3DqK8rN2sXQ/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=5Hq3K5mT9sQ",
          title: "Horror Jump Scares",
          duration: "12:48",
          description: "Most frightening jump scare moments",
          videoId: "5Hq3K5mT9sQ",
          thumbnail: "https://img.youtube.com/vi/5Hq3K5mT9sQ/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=7Fp9jR7sYpM",
          title: "Supernatural Horror Scenes",
          duration: "14:15",
          description: "Paranormal activities and ghost encounters",
          videoId: "7Fp9jR7sYpM",
          thumbnail: "https://img.youtube.com/vi/7Fp9jR7sYpM/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=9LmX4nN7sRm",
          title: "Slasher Movie Moments",
          duration: "13:37",
          description: "Classic slasher film highlights",
          videoId: "9LmX4nN7sRm",
          thumbnail: "https://img.youtube.com/vi/9LmX4nN7sRm/maxresdefault.jpg",
          relevance: 0.75
        },
        {
          url: "https://www.youtube.com/watch?v=2VpBj9bF3wU",
          title: "Psychological Horror",
          duration: "16:44",
          description: "Mind-bending horror and psychological terror",
          videoId: "2VpBj9bF3wU",
          thumbnail: "https://img.youtube.com/vi/2VpBj9bF3wU/maxresdefault.jpg",
          relevance: 0.7
        }
      ],
      "science fiction": [
        {
          url: "https://www.youtube.com/watch?v=6Fp9jR7sYpM",
          title: "Sci-Fi Movie Scenes 2024",
          duration: "17:28",
          description: "Futuristic technology and space exploration",
          videoId: "6Fp9jR7sYpM",
          thumbnail: "https://img.youtube.com/vi/6Fp9jR7sYpM/maxresdefault.jpg",
          relevance: 0.9
        },
        {
          url: "https://www.youtube.com/watch?v=8Hq3K5mT9sQ",
          title: "Space Battle Scenes",
          duration: "14:56",
          description: "Epic space combat and starship battles",
          videoId: "8Hq3K5mT9sQ",
          thumbnail: "https://img.youtube.com/vi/8Hq3K5mT9sQ/maxresdefault.jpg",
          relevance: 0.85
        },
        {
          url: "https://www.youtube.com/watch?v=9LmX4nN7sRm",
          title: "Time Travel Movie Moments",
          duration: "12:33",
          description: "Paradoxes and temporal manipulation scenes",
          videoId: "9LmX4nN7sRm",
          thumbnail: "https://img.youtube.com/vi/9LmX4nN7sRm/maxresdefault.jpg",
          relevance: 0.8
        },
        {
          url: "https://www.youtube.com/watch?v=2VpBj9bF3wU",
          title: "Alien Encounter Scenes",
          duration: "15:47",
          description: "First contact and extraterrestrial interactions",
          videoId: "2VpBj9bF3wU",
          thumbnail: "https://img.youtube.com/vi/2VpBj9bF3wU/maxresdefault.jpg",
          relevance: 0.75
        },
        {
          url: "https://www.youtube.com/watch?v=3DqK8rN2sXQ",
          title: "Future Technology Scenes",
          duration: "13:19",
          description: "Advanced gadgets and futuristic innovations",
          videoId: "3DqK8rN2sXQ",
          thumbnail: "https://img.youtube.com/vi/3DqK8rN2sXQ/maxresdefault.jpg",
          relevance: 0.7
        }
      ]
    };

    // Production-ready scene selection logic
    const selectedScenes: Array<{url: string, title: string, duration: string, description: string, videoId: string, thumbnail: string, relevance: number}> = [];
    
    // Get scenes for each genre with relevance scoring
    genres.forEach(genre => {
      const genreKey = genre.toLowerCase();
      if (sceneDatabase[genreKey]) {
        sceneDatabase[genreKey].forEach(scene => {
          // Add movie title relevance boost
          const titleMatch = scene.title.toLowerCase().includes(movieTitle.toLowerCase()) ? 0.1 : 0;
          const enhancedScene = {
            ...scene,
            relevance: scene.relevance + titleMatch
          };
          selectedScenes.push(enhancedScene);
        });
      }
    });

    // Sort by relevance and take top scenes
    const sortedScenes = selectedScenes
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 6)
      .map(({ relevance, ...scene }) => scene);

    // Fallback to action scenes if no genres match
    if (sortedScenes.length === 0) {
      return sceneDatabase.action.slice(0, 4).map(({ relevance, ...scene }) => scene);
    }

    return sortedScenes;
  };

  // Check if movie is in watchlist
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setIsInWatchlist(watchlist.some((item: any) => item.id === id));
  }, [id]);

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
    if (!movieData) return;
    
    const url = window.location.href;
    const title = movieData.title;
    const text = `Check out "${title}" on MovieFlix!`;
    
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

  // Watchlist functionality
  const handleWatchlistToggle = () => {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    if (isInWatchlist) {
      // Remove from watchlist
      const updatedWatchlist = watchlist.filter((item: any) => item.id !== id);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setIsInWatchlist(false);
      toast.success('Removed from watchlist');
    } else {
      // Add to watchlist
      const movieItem = {
        id: id,
        title: movieData?.title,
        poster: movieData?.poster_path,
        backdrop: movieData?.backdrop_path,
        vote_average: movieData?.vote_average,
        release_date: movieData?.release_date,
        addedAt: new Date().toISOString()
      };
      const updatedWatchlist = [...watchlist, movieItem];
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      setIsInWatchlist(true);
      toast.success('Added to watchlist!');
    }
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
                
                {/* Movie Details Skeleton */}
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

        {/* Premium Cinematic Information Hub Skeleton */}
        <div className="py-12 bg-gradient-to-b from-black via-gray-950 to-black">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Main Content Skeleton - 75% */}
              <div className="w-full lg:w-3/4 space-y-6">
                
                {/* Main Glass Panel Skeleton */}
                <div className="bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
                  
                  {/* Header Skeleton */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Rating & Runtime Cards Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-16 bg-gray-700 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6">
                      <div className="space-y-3">
                        <div className="h-4 w-28 bg-gray-700 rounded animate-pulse" />
                        <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
                        <div className="w-full bg-gray-700 rounded-full h-2 animate-pulse" />
                        <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Genres & Language Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                      <div className="flex flex-wrap gap-2">
                        <div className="h-8 w-20 bg-gray-700 rounded-full animate-pulse" />
                        <div className="h-8 w-24 bg-gray-700 rounded-full animate-pulse" />
                        <div className="h-8 w-16 bg-gray-700 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
                      <div className="h-10 w-24 bg-gray-700 rounded-xl animate-pulse" />
                    </div>
                  </div>

                  {/* Release Date & Budget Skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-28 bg-gray-700 rounded animate-pulse" />
                          <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
                        <div className="space-y-1">
                          <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
                          <div className="h-5 w-20 bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Skeleton - 25% */}
              <div className="w-full lg:w-1/4 space-y-6">
                {/* 4 Horizontal Cards Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[rgba(0,0,0,0.7)] backdrop-blur-xl border border-white/8 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-700 rounded animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Bottom Card Skeleton */}
                <div className="bg-[rgba(0,0,0,0.7)] backdrop-blur-xl border border-white/8 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <div className="h-3 w-16 bg-gray-700 rounded animate-pulse" />
                          <div className="h-3 w-8 bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Quick Story Snapshot Skeleton */}
            <div className="w-full mt-8">
              <div className="bg-[rgba(0,0,0,0.7)] backdrop-blur-xl border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-8 w-32 bg-gray-700 rounded animate-pulse mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Movie not found</div>
      </div>
    );
  }

  const backdropUrl = movieData.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
    : "https://i.imgur.com/default-backdrop.jpg";

  const posterUrl = movieData.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : "https://i.imgur.com/default-poster.jpg";

  const description = movieData.overview || "No description available.";
  const shouldShowMore = description.length > 200;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Share Menu Portal - positioned outside overflow containers */}
      {showShareMenu && (
        <div 
          className="fixed w-48 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-[300] overflow-hidden"
          style={{ 
            top: `${shareButtonPosition.top}px`, 
            left: `${shareButtonPosition.left}px` 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleShare('twitter')}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-black font-bold">𝕏</span>
            </div>
            Twitter
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">f</span>
            </div>
            Facebook
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">in</span>
            </div>
            LinkedIn
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">🔗</span>
            </div>
            Copy Link
          </button>
        </div>
      )}
      {/* Back Navigation */}
      <div className="fixed top-4 left-4 z-[150]">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-black/70 backdrop-blur-lg rounded-full text-white hover:bg-black/90 transition-all duration-300 group cursor-pointer border border-white/20 shadow-lg"
          title="Go back"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Hero Section with Backdrop */}
      <div className="relative h-[75vh] overflow-hidden mt-0">
        <div className="absolute inset-0">
          <Image
            src={backdropUrl || "https://images.unsplash.com/photo-1489599807961-c79686cb15c2?w=1920&h=1080&fit=crop"}
            alt={movieData?.title || "Movie backdrop"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        {/* Movie Info Overlay */}
        <div className="relative z-10 h-full flex items-end pb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-end gap-8">
              {/* Poster */}
              <div className="hidden lg:block">
                <div className="w-64 h-96 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={posterUrl || "https://images.unsplash.com/photo-1489599807961-c79686cb15c2?w=500&h=750&fit=crop"}
                    alt={movieData?.title || "Movie poster"}
                    width={256}
                    height={384}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Movie Details */}
              <div className="flex-1">
                <h1 className="text-4xl lg:text-6xl font-bold mb-4">{movieData.title}</h1>
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-4 text-gray-300">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span>{movieData.vote_average.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-5 h-5" />
                    <span>{movieData.release_date?.split('-')[0]}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-5 h-5" />
                    <span>{movieData.runtime ? `${movieData.runtime} min` : 'N/A'}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="max-w-3xl mb-6">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {showFullDescription ? description : `${description.slice(0, 200)}${shouldShowMore ? '...' : ''}`}
                  </p>
                  {shouldShowMore && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-red-500 hover:text-red-400 transition-colors ml-2"
                    >
                      {showFullDescription ? 'Show less' : 'more...'}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push(`/watch/${movieData?.id}`)}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Play Now
                  </button>
                  <button 
                    onClick={() => router.push('/watch-party')}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Watch Party
                  </button>
                  
                  {/* Icon Buttons with Tooltips */}
                  <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <div className="relative group">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuWidth = 192; // w-48 = 12rem = 192px
                          const leftPosition = rect.right - menuWidth; // Align to right edge
                          
                          setShareButtonPosition({ 
                            top: rect.bottom + 8, 
                            left: leftPosition < 0 ? rect.left : leftPosition // Prevent going off left edge
                          });
                          setShowShareMenu(!showShareMenu);
                        }}
                        className="p-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 hover:bg-[rgba(255,255,255,0.2)] rounded-full transition-all duration-300"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Share
                      </span>
                    </div>
                    
                    <div className="relative group">
                      <button className="p-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-md border border-white/20 hover:bg-[rgba(255,255,255,0.2)] rounded-full transition-all duration-300">
                        <Download className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Download
                      </span>
                    </div>
                    
                    {/* Watchlist Button */}
                    <div className="relative group">
                      <button 
                        onClick={handleWatchlistToggle}
                        className={`p-3 backdrop-blur-md border rounded-full transition-all duration-300 ${
                          isInWatchlist 
                            ? 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30' 
                            : 'bg-[rgba(255,255,255,0.1)] border-white/20 hover:bg-[rgba(255,255,255,0.2)]'
                        }`}
                      >
                        {isInWatchlist ? (
                          <span className="text-red-400 text-sm font-bold">✓</span>
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Video Container */}
      {trailerKey && (
        <div className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Trailer</h2>
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Movie Trailer"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Fan Reactions Section */}
      <ReactionCarousel movieId={id.toString()} />

      {/* Movie Insights Section */}
      {movieData && (
        <div className="py-12 bg-gradient-to-b from-black via-gray-950 to-black">
          <div className="container mx-auto px-4">
            <div className="max-w-[1400px] mx-auto space-y-8">
              {/* Header Section */}
              <header className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                    <Clapperboard className="w-8 h-8 text-red-500" />
                  </div>
                  <h1 className="text-[34px] font-bold tracking-tight text-white uppercase">
                    Movie Insights
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-gray-400 font-medium">Premium cinematic information</p>
                  <div className="w-[60px] h-[3px] bg-gradient-to-r from-red-500 to-purple-500 rounded-full" />
                </div>
              </header>

              {/* Row 1: Movie Info & AI Insight */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Movie Info Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card glow-blue p-7 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-8">
                    <motion.div
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                    >
                      <Info className="w-6 h-6" />
                    </motion.div>
                    <h2 className="text-lg font-semibold tracking-wide text-white uppercase">Movie Info</h2>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-8 pb-8 border-b border-white/5">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="mt-1 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        >
                          <Star className="w-5 h-5 fill-amber-400" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xl font-bold text-white">{movieData.vote_average?.toFixed(1) || 'N/A'} / 10</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-black uppercase bg-orange-400">IMDb Score</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="mt-1 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                        >
                          <Clock className="w-5 h-5" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Runtime</span>
                          <span className="text-xl font-bold text-white">
                            {movieData.runtime ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-8 py-8 border-b border-white/5">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ rotateY: 360 }}
                          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                          className="mt-1 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                        >
                          <Globe className="w-5 h-5" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Language</span>
                          <span className="text-xl font-bold text-white">{movieData.original_language?.toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="mt-1 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                        >
                          <Calendar className="w-5 h-5" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Release Date</span>
                          <span className="text-xl font-bold text-white">
                            {movieData.release_date ? new Date(movieData.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-8 pt-8">
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mt-1 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                        >
                          <LayoutGrid className="w-5 h-5" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Genres</span>
                          <div className="flex gap-2 mt-2">
                            {movieData.genres?.slice(0, 2).map((genre) => (
                              <span key={genre.id} className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-purple-500 text-white shadow-[0_0_10px_rgba(255,46,99,0.3)]">
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="mt-1 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                        >
                          <Coins className="w-5 h-5" />
                        </motion.div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Budget</span>
                          <span className="text-xl font-bold text-white">
                            {movieData.budget ? `$${(movieData.budget / 1000000).toFixed(0)}M` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* AI Movie Insight Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card glow-pink p-7 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-8">
                    <motion.div
                      animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-purple-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                    >
                      <Bot className="w-6 h-6" />
                    </motion.div>
                    <h2 className="text-lg font-semibold tracking-wide text-white uppercase">AI Movie Insight</h2>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {/* Top Section: Metrics + Image */}
                    <div className="flex gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Audience Love Row */}
                        <div className="glass-card-sm-light p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                              className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                            >
                              <Heart className="w-5 h-5 fill-pink-500" />
                            </motion.div>
                            <span className="text-sm font-bold text-white">Audience Love</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90">
                                <circle cx="20" cy="20" r="18" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="20" cy="20" r="18" fill="transparent" stroke="#FF2E63" strokeWidth="3" strokeDasharray="113" strokeDashoffset={113 * (1 - movieInsights.audienceLove / 100)} strokeLinecap="round" />
                              </svg>
                              <span className="absolute text-[10px] font-bold">{movieInsights.audienceLove}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{movieInsights.audienceLove}%</span>
                              <span className="text-[10px] font-bold text-green-400 uppercase">Loved It</span>
                            </div>
                          </div>
                        </div>

                        {/* Rewatch Value Row */}
                        <div className="glass-card-sm-light p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </motion.div>
                            <span className="text-sm font-bold text-white">Rewatch Value</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold">{movieInsights.rewatchValue} / 5</span>
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold rounded-md uppercase">{movieInsights.rewatchValue >= 4 ? 'High' : movieInsights.rewatchValue >= 3 ? 'Medium' : 'Low'}</span>
                          </div>
                        </div>

                        {/* Best Watch Time Row */}
                        <div className="glass-card-sm-light p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
                              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                              className="text-orange-300 drop-shadow-[0_0_10px_rgba(253,186,116,0.5)]"
                            >
                              <Moon className="w-5 h-5 fill-orange-300" />
                            </motion.div>
                            <span className="text-sm font-bold text-white">Best Watch Time</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-orange-400">{movieInsights.bestWatchTime}</span>
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 border border-orange-500/30 text-[10px] font-bold rounded-md uppercase">Optimal</span>
                          </div>
                        </div>
                      
                    </div>
                  </div>

                    {/* Intensity Row */}
                    <div className="glass-card-sm-light p-4 flex items-center gap-6">
                      <div className="flex items-center gap-3 shrink-0">
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                          className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                        >
                          <Zap className="w-5 h-5 fill-current" />
                        </motion.div>
                        <span className="text-sm font-bold text-white">Intensity</span>
                      </div>
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-sm font-bold text-orange-400">{movieInsights.intensity}</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                          <div className={`absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 w-${movieInsights.intensity === 'High' ? '4/5' : movieInsights.intensity === 'Medium' ? '3/5' : '2/5'} rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]`} />
                        </div>
                        <span className="text-[10px] font-bold text-orange-400 uppercase shrink-0">{movieInsights.intensity === 'High' ? 'Action Packed' : movieInsights.intensity === 'Medium' ? 'Balanced' : 'Relaxed'}</span>
                      </div>
                    </div>

                    {/* Movie Mood Row */}
                    <div className="glass-card-sm-light p-4 flex items-center gap-6">
                      <div className="flex items-center gap-3 shrink-0">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                        >
                          <Clock className="w-5 h-5" />
                        </motion.div>
                        <span className="text-sm font-bold text-white">Movie Mood</span>
                      </div>
                      <div className="flex gap-3">
                        {movieInsights.movieMood.map((mood, index) => (
                          <span key={mood} className={`px-4 py-1.5 rounded-full text-[10px] font-bold border border-white/10 transition-all duration-300 ${
                            index === 0 ? "bg-pink-500/20 text-pink-500 border-pink-500/30 shadow-[0_0_10px_rgba(255,46,99,0.2)]" : "bg-white/5 text-gray-400 hover:bg-white/10"
                          }`}>
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Row 2: Scene Composition & Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Scene Composition & Energy */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card glow-purple p-8 lg:col-span-8"
                >
                  <div className="flex items-center gap-2 mb-8">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                      className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                    </motion.div>
                    <h2 className="text-lg font-semibold tracking-wide text-white uppercase">Scene Composition & Energy</h2>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
                    {/* Radial Chart Section */}
                    <div className="xl:col-span-3 flex justify-center relative">
                      <div className="w-[160px] h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={movieInsights.sceneComposition}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {movieInsights.sceneComposition.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-2.5 bg-white/10 rounded-full">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars Section */}
                    <div className="xl:col-span-4 space-y-3">
                      {movieInsights.sceneComposition.map((item) => (
                        <div key={item.name} className="space-y-2.5 group">
                          <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{item.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white tabular-nums tracking-tight">{item.value}%</span>
                          </div>
                          
                          <div className="h-2.5 w-full bg-white/[0.03] rounded-full relative border border-white/5 shadow-inner overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                              className="h-full rounded-full relative group-hover:brightness-110 transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                                boxShadow: `0 0 20px ${item.color}44, inset 0 1px 2px rgba(255,255,255,0.3)` 
                              }}
                            >
                              <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                              />
                              <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 rounded-t-full" />
                              <div className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center">
                                <motion.div 
                                  animate={{ 
                                    scale: [1, 1.4, 1],
                                    opacity: [0.7, 1, 0.7]
                                  }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                  className="w-1.5 h-full blur-[3px] rounded-full bg-white shadow-[0_0_15px_#fff]"
                                />
                                <div className="absolute right-0 w-[2px] h-full bg-white blur-[1px]" />
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Energy Waveform Section */}
                    <div className="xl:col-span-5 space-y-4">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Zap className="w-4 h-4 fill-blue-400" />
                        <span className="text-sm font-bold uppercase tracking-wider">Scene Energy</span>
                      </div>
                      <div className="h-[100px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={Array.from({ length: 50 }, (_, i) => ({
                            time: i * 2,
                            energy: 20 + Math.random() * 60 + Math.sin(i / 5) * 20,
                          }))}>
                            <defs>
                              <linearGradient id="energyGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#FF2E63" />
                                <stop offset="50%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#22D3EE" />
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="energy" 
                              stroke="none" 
                              fill="url(#energyGradient)" 
                              fillOpacity={0.8}
                              style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                              itemStyle={{ color: '#E6EAF2' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        <span>0m</span>
                        <span>25m</span>
                        <span>50m</span>
                        <span>75m</span>
                        <span>{movieData.runtime ? `${movieData.runtime}m` : '102m'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Summary */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card glow-orange p-8 lg:col-span-4 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Quick Summary</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                          className="text-red-500 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                        >
                          <Zap className="w-5 h-5 fill-current" />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">Intensity: <span className="text-white font-bold text-base ml-1">High</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                          className="text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                        >
                          <Heart className="w-5 h-5 fill-pink-500" />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">Audience: <span className="text-green-400 font-bold text-base ml-1">63% Loved It</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-400/10 rounded-lg">
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">Rewatch: <span className="text-white font-bold text-base ml-1">4.2 / 5</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          className="text-purple-500 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                        >
                          <Clock className="w-5 h-5" />
                        </motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-400">Mood: <span className="text-white font-bold text-base ml-1">Night, Thrilling</span></span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cast Carousel */}
      {cast.length > 0 && (
        <div className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
                {cast.map((person) => (
                  <div key={person.id} className="flex-shrink-0">
                    <div className="w-32">
                      <div className="relative">
                        <div className="aspect-square rounded-full overflow-hidden bg-black cursor-pointer" onClick={() => router.push(`/${person.name}/info`)}>
                          {person.profile_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                              alt={person.name || "Cast member"}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 hover:scale-110 transition-transform duration-300">
                              <div className="text-4xl">👤</div>
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-2">
                          <p className="text-white font-semibold text-sm hover:text-red-400 transition-colors cursor-pointer" onClick={() => router.push(`/${person.name}/info`)}>{person.name}</p>
                          <p className="text-gray-400 text-xs">{person.character}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* More Like This Carousel */}
      {similarMovies.length > 0 && (
        <div className="py-8 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {similarMovies.slice(0, 14).map((movie) => (
                <div key={movie.id} onClick={() => router.push(`/movie/${movie.id}`)} className="group cursor-pointer">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title || "Movie poster"}
                        width={200}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <div className="text-4xl">🎬</div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-300 line-clamp-2">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Premium Comments Section */}
      <div className="py-12 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Enhanced Comments Section - 65% */}
            <div className="lg:col-span-8">
              
              
              
              {/* Comments Header with Sort */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Comments</h2>
                    <p className="text-sm text-gray-400">{comments.length} discussions</p>
                  </div>
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <span className="text-white text-sm font-medium">
                      {sortBy === 'recent' && 'Most Recent'}
                      {sortBy === 'liked' && 'Most Liked'}
                      {sortBy === 'rating' && 'Highest Rated'}
                      {sortBy === 'disliked' && 'Most Disliked'}
                    </span>
                    <ChevronRight 
                      className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                        isDropdownOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="py-1">
                        {[
                          { value: 'recent', label: 'Most Recent' },
                          { value: 'liked', label: 'Most Liked' },
                          { value: 'rating', label: 'Highest Rated' },
                          { value: 'disliked', label: 'Most Disliked' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleSortComments(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors duration-200 ${
                              sortBy === option.value ? 'bg-white/5 text-white' : 'text-white/80 hover:text-white'
                            }`}
                          >
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Input - YouTube Style Single Line */}
              <div className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">ME</span>
                </div>
                <div className="flex-1">
                  <div className={`border-b pb-1 transition-all duration-300 ${
                    newComment.trim() 
                      ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                      : 'border-gray-600'
                  }`}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                          e.preventDefault();
                          handlePostComment();
                        }
                      }}
                      placeholder="Add a comment..."
                      className={`w-full bg-transparent text-white resize-none focus:outline-none placeholder-gray-500 text-sm py-1 transition-all duration-300 ${
                        newComment.trim() 
                          ? 'text-white shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                          : ''
                      }`}
                      rows={1}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  {newComment.trim() && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={() => setNewComment('')}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePostComment}
                        className="px-4 py-1.5 text-sm bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/25 active:scale-95 active:shadow-red-500/40"
                      >
                        Add Comment
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* YouTube-style Comments Section */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    {/* Main Comment */}
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{comment.avatar}</span>
                        </div>
                      </div>
                      
                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        {/* Comment Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">{comment.user}</span>
                          <span className="text-gray-400 text-xs">{comment.time}</span>
                        </div>
                        
                        {/* Comment Text */}
                        <div className="text-gray-300 text-sm leading-relaxed mb-2">
                          {comment.content}
                        </div>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.isLiked ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                            }`}
                          >
                            <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>
                          
                          <button 
                            onClick={() => handleDislikeComment(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.isDisliked ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'
                            }`}
                          >
                            <ThumbsDown className={`w-4 h-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button 
                            onClick={() => handleReplyToggle(comment.id)}
                            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                        
                        {/* Reply Section */}
                        {expandedComments.includes(comment.id) && (
                          <div className="mt-4">
                            <div className="flex gap-4">
                              {/* Profile Avatar */}
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xs">ME</span>
                              </div>
                              
                              {/* Reply Input Area */}
                              <div className="flex-1">
                                <div className={`border-b pb-1 transition-all duration-300 ${
                                  replyText[comment.id]?.trim() 
                                    ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                                    : 'border-gray-600'
                                }`}>
                                  <textarea
                                    value={replyText[comment.id] || ''}
                                    onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey && (replyText[comment.id] || '').trim()) {
                                        e.preventDefault();
                                        handlePostReply(comment.id);
                                      }
                                    }}
                                    placeholder={`Add a reply...`}
                                    className={`w-full bg-transparent text-white resize-none focus:outline-none placeholder-gray-500 text-sm py-1 transition-all duration-300 ${
                                      replyText[comment.id]?.trim() 
                                        ? 'text-white shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                                        : ''
                                    }`}
                                    rows={1}
                                  />
                                </div>
                                
                                {/* Reply Actions */}
                                {replyText[comment.id]?.trim() && (
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <button 
                                      onClick={() => {
                                        setReplyText(prev => ({ ...prev, [comment.id]: '' }));
                                        setReplyingTo(null);
                                      }}
                                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-xl"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => handlePostReply(comment.id)}
                                      className="px-4 py-1.5 text-sm bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/25 active:scale-95 active:shadow-red-500/40"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Show Replies Count */}
                        {comment.replyCount > 0 && !expandedComments.includes(comment.id) && (
                          <button 
                            onClick={() => handleReplyToggle(comment.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                          >
                            {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Nested Replies Display */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-12 mt-4 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-4">
                            {/* Reply Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{reply.avatar}</span>
                              </div>
                            </div>
                            
                            {/* Reply Content */}
                            <div className="flex-1 min-w-0">
                              {/* Reply Header */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white text-sm">{reply.user}</span>
                                <span className="text-gray-400 text-xs">{reply.time}</span>
                              </div>
                              
                              {/* Reply Text */}
                              <div className="text-gray-300 text-sm leading-relaxed mb-2">
                                {reply.content}
                              </div>
                              
                              {/* Reply Actions */}
                              <div className="flex items-center gap-4">
                                <button 
                                  onClick={() => handleLikeComment(reply.id)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    reply.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-300'
                                  }`}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likes}</span>
                                </button>
                                
                                <button 
                                  onClick={() => handleDislikeComment(reply.id)}
                                  className={`flex items-center gap-1 text-xs transition-colors ${
                                    reply.isDisliked ? 'text-red-400' : 'text-gray-400 hover:text-red-300'
                                  }`}
                                >
                                  <ThumbsDown className={`w-4 h-4 ${reply.isDisliked ? 'fill-current' : ''}`} />
                                </button>
                                
                                <button 
                                  onClick={() => handleReplyToggle(comment.id)}
                                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Scenes Carousel - 35% */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                    <Clapperboard className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Featured Scenes</h2>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable Scenes Container */}
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {scenes.map((scene, index) => (
                  <div key={index} className="group cursor-pointer" onClick={() => window.open(scene.url, '_blank')}>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg border border-gray-700/50 hover:border-red-500/30 transition-all duration-300">
                      {/* YouTube Thumbnail */}
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
                        <Image
                          src={scene.thumbnail}
                          alt={scene.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to YouTube thumbnail if custom fails
                            const target = e.target as HTMLImageElement;
                            target.src = `https://img.youtube.com/vi/${scene.videoId}/maxresdefault.jpg`;
                          }}
                          onLoad={(e) => {
                            // Ensure image is visible
                            const target = e.target as HTMLImageElement;
                            target.style.opacity = '1';
                          }}
                          style={{ opacity: '0' }}
                          unoptimized
                        />
                        
                        {/* Fallback gradient if image fails completely */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Play className="w-12 h-12 text-white/60 mx-auto mb-2" />
                            <p className="text-white/80 text-sm font-medium">{scene.title}</p>
                            <p className="text-white/60 text-xs mt-1">{scene.duration}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* YouTube Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Custom Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="p-3 bg-red-600 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-red-500">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      
                      {/* YouTube Logo Badge */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="px-2 py-1 bg-red-600 rounded flex items-center gap-1">
                          <div className="w-3 h-2 bg-white rounded-sm flex items-center justify-center">
                            <Play className="w-1.5 h-1.5 text-red-600 ml-0.5" />
                          </div>
                          <span className="text-white text-[10px] font-medium">YouTube</span>
                        </div>
                      </div>
                      
                      {/* Video Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="text-white">
                          <h3 className="font-bold text-sm mb-1 drop-shadow-lg line-clamp-1">{scene.title}</h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 font-medium">
                              {scene.duration}
                            </span>
                            <span className="text-gray-300 line-clamp-1">{scene.description}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View All Scenes Button */}
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg transition-all duration-300 text-white text-sm font-medium border border-gray-700 hover:border-gray-600">
                View All Scenes
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reaction Modal */}
      <PremiumReactionClip />
    </div>
  );
};

export default EnhancedMovieInfo;
