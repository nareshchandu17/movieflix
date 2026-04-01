import React from 'react';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  runtime?: string;
  genres?: string[];
  year?: number;
  progress?: number;
  episodeInfo?: string;
  expiryInfo?: string;
}

export interface MovieSection {
  id: string;
  title: string;
  movies: Movie[];
}

export interface AIMood {
  emoji: string;
  label: string;
}

export interface AISuggestion {
  movie: Movie;
  explanation: string;
  moods: AIMood[];
}

export interface FilterChip {
  id: string;
  label: string;
  icon?: string | React.ReactNode;
  active?: boolean;
}
