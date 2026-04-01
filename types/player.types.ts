export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  thumbnailUrl?: string;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  src: string;
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export type PlaybackQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';
export type PlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
export type ActivePanel = 'settings' | 'episodes' | 'watch-party' | 'subtitles' | null;

export interface PlayerState {
  playing: boolean;
  muted: boolean;
  volume: number; // 0 to 1
  currentTime: number; // seconds
  duration: number; // seconds
  buffered: number; // seconds buffered
  playbackRate: PlaybackRate;
  quality: PlaybackQuality;
  subtitleTrack: string; // language code or 'off'
  audioTrack: string;
  isFullscreen: boolean;
  isBuffering: boolean;
  controlsVisible: boolean;
  activePanel: ActivePanel;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  introStartTime?: number;
  introEndTime?: number;
  
  // Reaction Feature States
  isReactionMode: boolean;
  movieReactions: any[]; 
  activeReaction: any | null; // The reaction currently being played back with the movie
  reactionLayout: 'pip' | 'split';
  
  // Actions
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  seek: (seconds: number) => void;
  seekToPercent: (pct: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (r: PlaybackRate) => void;
  setQuality: (q: PlaybackQuality) => void;
  setSubtitleTrack: (lang: string) => void;
  setAudioTrack: (lang: string) => void;
  showControls: () => void;
  hideControls: () => void;
  togglePanel: (panel: ActivePanel) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setBuffered: (buffered: number) => void;
  setIsBuffering: (isBuffering: boolean) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  setChapters: (chapters: Chapter[]) => void;
  
  // Reaction Actions
  setReactionMode: (active: boolean) => void;
  setMovieReactions: (reactions: any[]) => void;
  setActiveReaction: (reaction: any | null) => void;
  setReactionLayout: (layout: 'pip' | 'split') => void;
}

export interface WatchPartyUser {
  id: string;
  name: string;
  avatarUrl?: string;
  currentTime: number;
  isPlaying: boolean;
}

export interface WatchPartyState {
  isActive: boolean;
  users: WatchPartyUser[];
  hostId: string;
  syncOffset: number; // How far off from host in seconds
}
