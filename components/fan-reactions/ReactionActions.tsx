"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReactionActionsProps {
    reactionId: string;
    initialLikes: number;
    initialViews: number;
}

export function ReactionActions({ reactionId, initialLikes }: ReactionActionsProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (isLoading || isLiked) return;

        // Optimistic update
        setLikes(prev => prev + 1);
        setIsLiked(true);
        setIsLoading(true);

        try {
            const res = await fetch(`/api/reactions/${reactionId}/like`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to like');
            const data = await res.json();
            setLikes(data.likes);
        } catch (error) {
            console.error(error);
            // Revert if failed
            setLikes(prev => prev - 1);
            setIsLiked(false);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div className="flex flex-col items-center z-10 w-full">
            <button
                onClick={handleLike}
                disabled={isLoading || isLiked}
                className={cn(
                    "p-3 rounded-full transition-transform hover:scale-110 active:scale-95 mb-1",
                    isLiked ? "bg-red-500/10" : "hover:bg-white/10"
                )}
            >
                <Heart
                    className={cn("w-7 h-7 transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")}
                />
            </button>
            <span className="text-white text-xs font-semibold drop-shadow-md">
                {formatCount(likes)}
            </span>
        </div>
    );
}