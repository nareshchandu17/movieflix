"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Plus, Info, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface HeroSpotlightProps {
  media: (TMDBMovie | TMDBTVShow)[];
}

const HeroSpotlight = ({ media }: HeroSpotlightProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [matchPercentage, setMatchPercentage] = useState(85);
  const [badges, setBadges] = useState<Array<{type: string, color: string}>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = media[currentIndex];

  // Calculate personalized match percentage based on user preferences
  const calculateMatchPercentage = (mediaItem: TMDBMovie | TMDBTVShow) => {
    // Simulate AI-based matching (in real app, this would use user's viewing history)
    const baseScore = mediaItem.vote_average * 10;
    const popularityBoost = Math.min(mediaItem.popularity / 100, 20);
    const randomFactor = Math.random() * 10;
    return Math.min(Math.floor(baseScore + popularityBoost + randomFactor), 99);
  };

  // Generate badges based on media properties
  const generateBadges = (mediaItem: TMDBMovie | TMDBTVShow) => {
    const badges: Array<{type: string, color: string}> = [];
    const releaseDate = 'release_date' in mediaItem ? mediaItem.release_date : mediaItem.first_air_date;
    const daysSinceRelease = releaseDate ? Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
    
    if (daysSinceRelease <= 30) badges.push({ type: 'NEW', color: 'bg-blue-500' });
    if (mediaItem.popularity > 1000) badges.push({ type: 'TRENDING', color: 'bg-red-500' });
    if (mediaItem.vote_average > 8) badges.push({ type: 'TOP RATED', color: 'bg-purple-500' });
    if (Math.random() > 0.8) badges.push({ type: 'EXCLUSIVE', color: 'bg-yellow-500' });
    
    return badges;
  }; 

  const handlePlay = () => {
    // Navigate to detail page or play trailer
    console.log("Play:", currentMedia);
  };

  const handleMoreInfo = () => {
    // Navigate to detail page
    console.log("More Info:", currentMedia);
  };

  const handleAddToList = () => {
    // Add to watchlist
    console.log("Add to List:", currentMedia);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        nextSlide();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [media.length, isHovered]);

  useEffect(() => {
    if (currentMedia) {
      setMatchPercentage(calculateMatchPercentage(currentMedia));
      setBadges(generateBadges(currentMedia));
    }
  }, [currentMedia]);

  if (!currentMedia) return null;

  const title = 'title' in currentMedia ? currentMedia.title : currentMedia.name;
  const overview = currentMedia.overview;
  const backdropPath = currentMedia.backdrop_path;
  const releaseDate = 'release_date' in currentMedia ? currentMedia.release_date : currentMedia.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const rating = currentMedia.vote_average;

  return (
    <div 
      className="relative w-full h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {backdropPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0B1020] to-[#121826]" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Bottom Fade Overlay for Smooth Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl"
          >
            {/* Badges and Match Info */}
            <div className="flex items-center gap-3 mb-4">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`${badge.color} px-3 py-1 rounded-full text-white text-xs font-bold`}
                >
                  {badge.type}
                </span>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-semibold">{matchPercentage}% Match</span>
              </div>
              {year && (
                <span className="text-[#9CA3AF]">{year}</span>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-5xl md:text-6xl font-bold text-[#F9FAFB] mb-4 leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg text-[#9CA3AF] mb-6 line-clamp-3 leading-relaxed">
              {overview}
            </p>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handlePlay}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25 border border-red-500/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Play
              </Button>
              
              <Button
                onClick={handleMoreInfo}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/40 px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10"
              >
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
              
              <Button
                onClick={handleAddToList}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 hover:border-white/30 px-4 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 z-10 hover:scale-110 hover:shadow-xl hover:shadow-black/50 border border-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 z-10 hover:scale-110 hover:shadow-xl hover:shadow-black/50 border border-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Enhanced Slide Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50"
                  : "bg-white/40 hover:bg-white/60 hover:w-4"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSpotlight;
