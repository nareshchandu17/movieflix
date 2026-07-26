/**
 * @file useComments.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

"use client";

import useSWR from "swr";
import { useCallback } from "react";

export interface CommentDTO {
  id: string;
  movieId: string;
  parentId: string | null;
  author: string;
  avatar: string;
  verified: boolean;
  text: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  replyCount: number;
  isDeleted: boolean;
  createdAt: string;
  createdAtRelative: string;
  isOwnComment: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useComments = (contentId: string, parentId: string | null = null, sort: string = "newest", page: number = 1) => {
  const queryParams = new URLSearchParams({ contentId, sort, page: page.toString() });
  if (parentId) queryParams.append("parentId", parentId);

  const { data, error, mutate, isLoading } = useSWR(
    contentId ? `/api/comments?${queryParams.toString()}` : null,
    fetcher
  );

  const comments: CommentDTO[] = data?.comments || [];

  const addComment = useCallback(async (text: string, replyToId: string | null = null) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text, parentId: replyToId }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      const newCommentData = await res.json();
      
      // Optimistic UI for adding comment
      mutate((currentData: any) => {
        if (!currentData) return { comments: [newCommentData.comment] };
        return { ...currentData, comments: [newCommentData.comment, ...currentData.comments] };
      }, false);
      
      return newCommentData;
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  }, [contentId, mutate]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      // Optimistic UI
      mutate((currentData: any) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          comments: currentData.comments.map((c: CommentDTO) => 
            c.id === commentId ? { ...c, isDeleted: true, text: "[This comment was deleted]" } : c
          )
        };
      }, false);

      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
      
      mutate();
    } catch (err) {
      console.error("Error deleting comment:", err);
      mutate(); // rollback on error
      throw err;
    }
  }, [mutate]);

  const reactToComment = useCallback(async (commentId: string, type: 'like' | 'dislike') => {
    try {
      // Optimistic UI
      mutate((currentData: any) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          comments: currentData.comments.map((c: CommentDTO) => {
            if (c.id !== commentId) return c;
            const updated = { ...c };
            if (type === 'like') {
              if (c.isLiked) {
                updated.isLiked = false;
                updated.likes -= 1;
              } else {
                updated.isLiked = true;
                updated.likes += 1;
                if (c.isDisliked) {
                  updated.isDisliked = false;
                  updated.dislikes -= 1;
                }
              }
            } else if (type === 'dislike') {
              if (c.isDisliked) {
                updated.isDisliked = false;
                updated.dislikes -= 1;
              } else {
                updated.isDisliked = true;
                updated.dislikes += 1;
                if (c.isLiked) {
                  updated.isLiked = false;
                  updated.likes -= 1;
                }
              }
            }
            return updated;
          })
        };
      }, false);

      const res = await fetch(`/api/comments/${commentId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      
      if (!res.ok) throw new Error(`Failed to ${type} comment`);
      
      mutate();
    } catch (err) {
      console.error(`Error reacting to comment:`, err);
      mutate(); // rollback on error
      throw err;
    }
  }, [mutate]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    reactToComment,
    mutate,
  };
};
