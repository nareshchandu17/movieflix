"use client";
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Reply, Flag } from "lucide-react";
import { motion } from "framer-motion";

interface Comment {
  id: string;
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

interface MovieCommentsProps {
  movieId: number;
}

const MovieComments: React.FC<MovieCommentsProps> = ({ movieId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Fetch comments from API
  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?contentId=${movieId}`);
        if (response.ok) {
          const data = await response.json();
          // Transform API response to match component interface
          const transformedComments = data.comments.map((comment: any) => ({
            id: comment._id,
            user: comment.userId?.name || 'Anonymous',
            avatar: comment.userId?.avatar?.[0] || 'A',
            time: new Date(comment.createdAt).toLocaleDateString(),
            rating: 0, // API doesn't have rating
            content: comment.text,
            likes: comment.likesCount || 0,
            dislikes: comment.dislikesCount || 0,
            replies: comment.replies?.map((reply: any) => ({
              id: reply._id,
              user: reply.userId?.name || 'Anonymous',
              avatar: reply.userId?.avatar?.[0] || 'A',
              time: new Date(reply.createdAt).toLocaleDateString(),
              rating: 0,
              content: reply.text,
              likes: reply.likesCount || 0,
              dislikes: reply.dislikesCount || 0,
              replies: [],
              replyCount: 0,
              isLiked: false,
              isDisliked: false,
            })) || [],
            replyCount: comment.replies?.length || 0,
            isLiked: false,
            isDisliked: false,
          }));
          setComments(transformedComments);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [movieId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: movieId,
          text: newComment,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const transformedComment = {
          id: result.comment._id,
          user: result.comment.userId?.name || 'Anonymous',
          avatar: result.comment.userId?.avatar?.[0] || 'A',
          time: new Date(result.comment.createdAt).toLocaleDateString(),
          rating: 0,
          content: result.comment.text,
          likes: result.comment.likesCount || 0,
          dislikes: result.comment.dislikesCount || 0,
          replies: [],
          replyCount: 0,
          isLiked: false,
          isDisliked: false,
        };
        setComments([transformedComment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleLikeComment = (commentId: string) => {
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

  const handleDislikeComment = (commentId: string) => {
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

  const handleReplyToggle = (commentId: string) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handlePostReply = async (parentCommentId: string) => {
    if (!replyText[parentCommentId]?.trim()) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: movieId,
          text: replyText[parentCommentId],
          parentCommentId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const transformedReply = {
          id: result.comment._id,
          user: result.comment.userId?.name || 'Anonymous',
          avatar: result.comment.userId?.avatar?.[0] || 'A',
          time: new Date(result.comment.createdAt).toLocaleDateString(),
          rating: 0,
          content: result.comment.text,
          likes: result.comment.likesCount || 0,
          dislikes: result.comment.dislikesCount || 0,
          replies: [],
          replyCount: 0,
          isLiked: false,
          isDisliked: false,
        };
        
        setComments(comments.map(comment => 
          comment.id === parentCommentId 
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), transformedReply],
                replyCount: (comment.replyCount || 0) + 1
              }
            : comment
        ));
        
        setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-zinc-900/50 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-full" />
              <div className="h-4 bg-zinc-800 rounded w-32" />
            </div>
            <div className="h-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          className="w-full bg-transparent text-white placeholder-zinc-500 resize-none focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 font-bold">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{comment.user}</span>
                    <span className="text-zinc-500 text-sm">{comment.time}</span>
                  </div>
                  {comment.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-500' : 'text-zinc-700'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-zinc-300 mb-3">{comment.content}</p>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 ${comment.isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {comment.likes}
                </button>
                <button
                  onClick={() => handleDislikeComment(comment.id)}
                  className={`flex items-center gap-1 ${comment.isDisliked ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {comment.dislikes}
                </button>
                {comment.replyCount > 0 && (
                  <button
                    onClick={() => handleReplyToggle(comment.id)}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {comment.replyCount}
                  </button>
                )}
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    handleReplyToggle(comment.id);
                  }}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-4 border-l-2 border-zinc-700">
                  <textarea
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="w-full bg-zinc-800 text-white placeholder-zinc-500 resize-none focus:outline-none rounded-lg p-3"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText(prev => ({ ...prev, [comment.id]: '' }));
                      }}
                      className="text-zinc-400 hover:text-white px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePostReply(comment.id)}
                      disabled={!replyText[comment.id]?.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-1 rounded"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {expandedComments.includes(comment.id) && comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-zinc-700">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 text-xs font-bold">
                        {reply.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{reply.user}</span>
                          <span className="text-zinc-500 text-xs">{reply.time}</span>
                        </div>
                        <p className="text-zinc-400 text-sm mt-1">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieComments;
