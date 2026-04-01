import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Reaction {
  id: string;
  videoUrl: string;
  thumbnail: string;
  movieTitle: string;
  movieScene: string;
  timestamp: string;
  duration: number;
  emotionTags: string[];
  isPublic: boolean;
  caption: string;
  createdAt: Date;
  user: {
    name: string;
    avatar: string;
    id: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

interface ReactionContextType {
  reactions: Reaction[];
  loading: boolean;
  error: string | null;
  addReaction: (reaction: Omit<Reaction, 'id' | 'createdAt' | 'stats'>) => Promise<void>;
  likeReaction: (reactionId: string) => Promise<void>;
  unlikeReaction: (reactionId: string) => Promise<void>;
  shareReaction: (reactionId: string) => Promise<void>;
  getReactionsByMovie: (movieTitle: string) => Reaction[];
  getReactionsByUser: (userId: string) => Reaction[];
  refreshReactions: () => Promise<void>;
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

export function useReactions() {
  const context = useContext(ReactionContext);
  if (context === undefined) {
    throw new Error('useReactions must be used within a ReactionProvider');
  }
  return context;
}

interface ReactionProviderProps {
  children: ReactNode;
}

export function ReactionProvider({ children }: ReactionProviderProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reactions on mount
  useEffect(() => {
    loadReactions();
  }, []);

  const loadReactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call - in production, this would be a real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReactions: Reaction[] = [
        {
          id: '1',
          videoUrl: '/api/placeholder/reaction1',
          thumbnail: '/api/placeholder/reaction-thumb1',
          movieTitle: 'Dune: Part Two',
          movieScene: 'Epic Sandworm Arrival',
          timestamp: '1:23:45',
          duration: 15,
          emotionTags: ['epic', 'mind-blown'],
          isPublic: true,
          caption: 'Bro that twist was insane 🔥',
          createdAt: new Date(Date.now() - 1000 * 60 * 5),
          user: {
            name: 'Alex Chen',
            avatar: 'AC',
            id: 'user1'
          },
          stats: {
            likes: 234,
            comments: 45,
            shares: 12,
            views: 1520
          }
        },
        {
          id: '2',
          videoUrl: '/api/placeholder/reaction2',
          thumbnail: '/api/placeholder/reaction-thumb2',
          movieTitle: 'Oppenheimer',
          movieScene: 'Trinity Test Explosion',
          timestamp: '2:14:30',
          duration: 12,
          emotionTags: ['wow', 'emotional'],
          isPublic: true,
          caption: 'Goosebumps every single time 😭',
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
          user: {
            name: 'Sarah Miller',
            avatar: 'SM',
            id: 'user2'
          },
          stats: {
            likes: 189,
            comments: 23,
            shares: 8,
            views: 980
          }
        },
        {
          id: '3',
          videoUrl: '/api/placeholder/reaction3',
          thumbnail: '/api/placeholder/reaction-thumb3',
          movieTitle: 'The Batman',
          movieScene: 'Car Chase Sequence',
          timestamp: '1:45:20',
          duration: 18,
          emotionTags: ['epic', 'funny'],
          isPublic: true,
          caption: 'This is cinema at its finest ✨',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          user: {
            name: 'Mike Johnson',
            avatar: 'MJ',
            id: 'user3'
          },
          stats: {
            likes: 456,
            comments: 67,
            shares: 23,
            views: 2340
          }
        }
      ];
      
      setReactions(mockReactions);
    } catch (err) {
      setError('Failed to load reactions');
      console.error('Error loading reactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (reactionData: Omit<Reaction, 'id' | 'createdAt' | 'stats'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newReaction: Reaction = {
        ...reactionData,
        id: `reaction_${Date.now()}`,
        createdAt: new Date(),
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        }
      };
      
      setReactions(prev => [newReaction, ...prev]);
    } catch (err) {
      setError('Failed to add reaction');
      console.error('Error adding reaction:', err);
      throw err;
    }
  };

  const likeReaction = async (reactionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setReactions(prev => prev.map(reaction => 
        reaction.id === reactionId 
          ? { ...reaction, stats: { ...reaction.stats, likes: reaction.stats.likes + 1 } }
          : reaction
      ));
    } catch (err) {
      setError('Failed to like reaction');
      console.error('Error liking reaction:', err);
      throw err;
    }
  };

  const unlikeReaction = async (reactionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setReactions(prev => prev.map(reaction => 
        reaction.id === reactionId 
          ? { ...reaction, stats: { ...reaction.stats, likes: Math.max(0, reaction.stats.likes - 1) } }
          : reaction
      ));
    } catch (err) {
      setError('Failed to unlike reaction');
      console.error('Error unliking reaction:', err);
      throw err;
    }
  };

  const shareReaction = async (reactionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setReactions(prev => prev.map(reaction => 
        reaction.id === reactionId 
          ? { ...reaction, stats: { ...reaction.stats, shares: reaction.stats.shares + 1 } }
          : reaction
      ));
    } catch (err) {
      setError('Failed to share reaction');
      console.error('Error sharing reaction:', err);
      throw err;
    }
  };

  const getReactionsByMovie = (movieTitle: string): Reaction[] => {
    return reactions.filter(reaction => 
      reaction.movieTitle.toLowerCase().includes(movieTitle.toLowerCase())
    );
  };

  const getReactionsByUser = (userId: string): Reaction[] => {
    return reactions.filter(reaction => reaction.user.id === userId);
  };

  const refreshReactions = async () => {
    await loadReactions();
  };

  const value: ReactionContextType = {
    reactions,
    loading,
    error,
    addReaction,
    likeReaction,
    unlikeReaction,
    shareReaction,
    getReactionsByMovie,
    getReactionsByUser,
    refreshReactions
  };

  return (
    <ReactionContext.Provider value={value}>
      {children}
    </ReactionContext.Provider>
  );
}
