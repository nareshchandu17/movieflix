"use client";

import useSWR from "swr";
import { useCallback } from "react";

export interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  contentId: string;
  text: string;
  likes: string[];
  replies: any[];
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useComments = (contentId: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    contentId ? `/api/comments?contentId=${contentId}` : null,
    fetcher
  );

  const comments: Comment[] = data?.comments || [];

  const addComment = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      mutate(); // Refresh comments
      return await res.json();
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  }, [contentId, mutate]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    mutate,
  };
};
