"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TMDBPerson, TMDBPersonCombinedCredits, TMDBPersonImages } from '@/features/shared/types';
import { CastHero } from '@/components/cast/CastHero';
import { CastStickyHeader } from '@/components/cast/CastStickyHeader';
import { CastKnownFor } from '@/components/cast/CastKnownFor';
import { CastAbout } from '@/components/cast/CastAbout';
import { CastHighlights } from '@/components/cast/CastHighlights';
import { CastFilmographyTimeline } from '@/components/cast/CastFilmographyTimeline';
import { CastFilmographyGrid } from '@/components/cast/CastFilmographyGrid';
import { ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy loaded components for performance
const LazyCastUpcoming = dynamic(() => import('@/components/cast/CastUpcoming').then(mod => mod.CastUpcoming), { ssr: false });
const LazyCastGallery = dynamic(() => import('@/components/cast/CastGallery').then(mod => mod.CastGallery), { ssr: false });
const LazyCastFilmographyTimeline = dynamic(() => import('@/components/cast/CastFilmographyTimeline').then(mod => mod.CastFilmographyTimeline), { ssr: false });
const LazyCastFilmographyGrid = dynamic(() => import('@/components/cast/CastFilmographyGrid').then(mod => mod.CastFilmographyGrid), { ssr: false });
const LazyCastGenres = dynamic(() => import('@/components/cast/CastGenres').then(mod => mod.CastGenres), { ssr: false });
const LazyCastCollaborators = dynamic(() => import('@/components/cast/CastCollaborators').then(mod => mod.CastCollaborators), { ssr: false });

export default function CastInfoPage() {
  const params = useParams();
  const router = useRouter();
  const castName = params?.castName as string;
  
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [credits, setCredits] = useState<TMDBPersonCombinedCredits | null>(null);
  const [images, setImages] = useState<TMDBPersonImages | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCastInfo = async () => {
      if (!castName) return;

      setIsLoading(true);
      setError(null);

      try {
        // Search by name
        const searchResults = await api.search(decodeURIComponent(castName));

        if (!searchResults.results || searchResults.results.length === 0) {
          throw new Error('Cast member not found');
        }

        const personMatch = searchResults.results.find((item: any) => item.media_type === 'person');

        if (!personMatch) {
          throw new Error('Cast member not found');
        }

        const [personDetails, personCredits, personImages] = await Promise.all([
          api.getPersonDetails(personMatch.id),
          api.getCombinedCredits('person', personMatch.id),
          api.getPersonImages(personMatch.id).catch(() => null) // Images might fail or be empty, don't crash
        ]);

        setPerson(personDetails);
        setCredits(personCredits);
        if (personImages) setImages(personImages);
        
      } catch (err) {
        console.error('Error fetching cast info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cast information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCastInfo();
  }, [castName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-lg font-medium">Loading actor profile...</div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-white text-xl font-bold">{error || 'Cast information not found'}</div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all duration-300 group shadow-lg"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      <CastStickyHeader person={person} />
      
      <CastHero person={person} credits={credits || undefined} images={images || undefined} />
      
      <CastAbout person={person} credits={credits || undefined} />
      
      <CastKnownFor person={person} />
      
      <LazyCastCollaborators person={person} credits={credits || undefined} />
      
      <CastHighlights credits={credits || undefined} />
      
      {/* Lazy Loaded Components for better performance below the fold */}
      <LazyCastUpcoming credits={credits || undefined} />
      
      <LazyCastFilmographyTimeline credits={credits || undefined} />
      
      <LazyCastGallery images={images || undefined} />
      
      <LazyCastGenres credits={credits || undefined} />
      
      <LazyCastFilmographyGrid credits={credits || undefined} />
      
      {/* Simple Footer inline as requested */}
      <footer className="py-12 bg-black border-t border-zinc-900 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-black tracking-tighter text-white mb-4">MOVIEFLIX</h2>
          <p className="text-sm text-zinc-500">© {new Date().getFullYear()} MovieFlix. All data provided by TMDB.</p>
        </div>
      </footer>
    </main>
  );
}
