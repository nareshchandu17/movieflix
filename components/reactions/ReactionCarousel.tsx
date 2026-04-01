"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Zap, PlayCircle, Loader2, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ReactionCard } from "./ReactionCard";
import { useInView } from "react-intersection-observer";

interface ReactionCarouselProps {
  movieId: string;
}

export function ReactionCarousel({ movieId }: ReactionCarouselProps) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    async function fetchReactions() {
      try {
        console.log(`Fetching reactions for movie: ${movieId}`);
        const res = await fetch(`/api/movies/${movieId}/reactions?page=1`);
        
        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Reactions endpoint not found - this is expected if no reactions exist yet');
            setReactions([]);
            setTotal(0);
            return;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format - expected JSON');
        }
        
        const data = await res.json();
        if (data.success) {
          setReactions(data.reactions || []);
          setTotal(data.pagination?.total || 0);
          console.log(`Loaded ${data.reactions?.length || 0} reactions`);
        } else {
          throw new Error(data.message || 'API returned error');
        }
      } catch (err) {
        console.error("Fetch reactions error:", err);
        // Set empty state on error to prevent infinite loading
        setReactions([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }

    if (inView && movieId) {
      fetchReactions();
    }
  }, [movieId, inView]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (isLoading && !inView) return <div ref={inViewRef} className="h-48" />;

  return (
    <section ref={inViewRef} className="py-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
              <Zap className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Live Buzz</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">🔥 FAN REACTIONS</span>
            </h2>
            <p className="text-white/40 max-w-xl text-lg leading-relaxed">
              Experience the raw emotions of our community. Real people, real moments, recorded live as they watched.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
                <button
                onClick={() => scroll("left")}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                >
                <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                onClick={() => scroll("right")}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                >
                <ChevronRight className="w-6 h-6" />
                </button>
            </div>
            
            {total > 20 && (
                <Link 
                    href={`/movie/${movieId}/reactions`}
                    className="h-12 px-6 flex items-center gap-2 bg-white text-black font-bold rounded-full hover:bg-white/90 active:scale-95 transition-all text-sm group"
                >
                    View All
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
          </div>
        ) : reactions.length > 0 ? (
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-10 hide-scrollbar snap-x snap-mandatory"
          >
            {reactions.map((reaction) => (
              <div key={reaction._id} className="snap-start flex-shrink-0">
                <ReactionCard reaction={reaction} movieId={movieId} />
              </div>
            ))}
            
            {/* Call to action card at the end */}
            <div className="snap-start flex-shrink-0 w-[240px] h-[400px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center group bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-white font-bold mb-2">Record Yours</h4>
                <p className="text-white/40 text-sm">Join the conversation and show us how you feel!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center">
            <PlayCircle className="w-16 h-16 text-white/10 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No reactions yet</h3>
            <p className="text-white/40 max-w-sm">Be the first to share your reaction to this movie! Click the react button in the player to get started.</p>
          </div>
        )}
      </div>
    </section>
  );
}
