"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Volume2, MessageCircle, Send, Bookmark, Music, MoreVertical } from 'lucide-react';
import { ReactionActions } from './ReactionActions';

interface Reaction {
    _id: string;
    movieId: number;
    videoUrl: string;
    thumbnailUrl: string;
    caption?: string;
    likes: number;
    views: number;
}

interface ReactionCardProps {
    reaction: Reaction;
    isActive: boolean;
}

export function ReactionCard({ reaction, isActive }: ReactionCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasViewed, setHasViewed] = useState(false);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            videoRef.current?.pause();
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
            }
        }
    }, [isActive]);

    useEffect(() => {
        let viewTimer: NodeJS.Timeout;

        if (isActive && !hasViewed) {
            viewTimer = setTimeout(() => {
                fetch(`/api/reactions/${reaction._id}/view`, { method: 'POST' })
                    .catch(e => console.error('Failed to register view:', e));
                setHasViewed(true);
            }, 2000);
        }

        return () => clearTimeout(viewTimer);
    }, [isActive, hasViewed, reaction._id]);

    return (
        <div className="w-full h-full snap-center flex justify-center items-center py-4">
            {/* Container for Video + Actions to match Instagram layout */}
            <div className="w-full max-w-[500px] h-full max-h-[85vh] flex gap-4">

                {/* Video Container (left side) */}
                <div className="flex-1 bg-zinc-950 rounded-[24px] overflow-hidden relative shadow-2xl border border-zinc-800">
                    {/* Top UI Bars (simulated Instagram lines) */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-6 z-20">
                        <div className="h-[3px] w-8 bg-white rounded-full"></div>
                        <div className="h-[3px] w-8 bg-white/30 rounded-full"></div>
                        <div className="h-[3px] w-8 bg-white/30 rounded-full"></div>
                        <div className="h-[3px] w-8 bg-white/30 rounded-full"></div>
                        <div className="h-[3px] w-8 bg-white/30 rounded-full"></div>
                    </div>

                    {/* Audio icon */}
                    <div className="absolute top-8 right-4 z-20">
                        <Volume2 className="w-5 h-5 text-white drop-shadow-md" />
                    </div>

                    <video
                        ref={videoRef}
                        src={reaction.videoUrl}
                        poster={reaction.thumbnailUrl}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        muted={false}
                    />

                    {/* Bottom Info Area */}
                    <div className="absolute bottom-0 left-0 right-0 pt-32 pb-4 px-4 bg-gradient-to-t from-black via-black/60 to-transparent z-10">
                        {reaction.caption && (
                            <p className="text-white text-base font-medium italic mb-4 drop-shadow-lg pr-8">
                                {reaction.caption}
                            </p>
                        )}

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-600">
                                <span className="text-xs font-bold text-white">U</span>
                            </div>
                            <span className="text-white font-semibold text-sm">@movieaddict_18 <span className="text-red-500 ml-1">✓</span></span>
                            <button className="text-xs font-bold border border-white/40 text-white rounded-lg px-3 py-1 hover:bg-white/10 ml-2">Follow</button>
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-1 mb-4 text-xs text-zinc-300">
                            <p className="flex items-center gap-2">🎬 Movie: {reaction.movieId}</p>
                            <p className="flex items-center gap-2">🎬 Scene: Epic Moment</p>
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-2">🎵 Original Audio</p>
                                <MoreVertical className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <Link href={`/movie/${reaction.movieId}`}>
                            <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 px-4 py-3 rounded-xl transition-all border border-red-500/30">
                                <Play className="w-4 h-4 text-white fill-white" />
                                <span className="text-white font-bold text-sm">Watch Full Movie</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Actions Container (right side outside the video) */}
                <div className="w-[60px] flex flex-col justify-end items-center pb-8 shrink-0">
                    <ReactionActions reactionId={reaction._id} initialLikes={reaction.likes} initialViews={reaction.views} />

                    {/* Dummy action buttons to match Instagram reels layout */}
                    <div className="flex flex-col items-center mt-6">
                        <div className="p-3 rounded-full mb-1 hover:bg-white/10 transition-colors">
                            <MessageCircle className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow-md">342</span>
                    </div>

                    <div className="flex flex-col items-center mt-6">
                        <div className="p-3 rounded-full mb-1 hover:bg-white/10 transition-colors">
                            <Send className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow-md">1.2K</span>
                    </div>

                    <div className="flex flex-col items-center mt-6">
                        <div className="p-3 rounded-full mb-1 hover:bg-white/10 transition-colors">
                            <Bookmark className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold drop-shadow-md">832</span>
                    </div>

                    {/* Music disc */}
                    <div className="mt-8 rounded-full border-2 border-zinc-700 p-0.5 animate-spin-slow">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 flex justify-center items-center">
                            <Music className="w-3 h-3 text-zinc-400" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}