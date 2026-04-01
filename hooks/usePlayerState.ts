import { create } from 'zustand';
import { PlayerState, PlaybackQuality, PlaybackRate, ActivePanel, Chapter } from '@/types/player.types';

export const usePlayerState = create<PlayerState>((set, get) => ({
  playing: false,
  muted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  playbackRate: 1,
  quality: 'auto',
  subtitleTrack: 'off',
  audioTrack: 'Original',
  isFullscreen: false,
  isBuffering: true,
  controlsVisible: true,
  activePanel: null,
  chapters: [],
  currentChapter: null,
  isReactionMode: false,
  movieReactions: [],
  activeReaction: null,
  reactionLayout: 'pip',

  togglePlay: () => set((state) => ({ playing: !state.playing })),
  setPlaying: (playing) => set({ playing }),
  
  seek: (seconds) => {
    const { duration } = get();
    // Clamping seek time between 0 and duration
    let newTime = Math.max(0, seconds);
    if (duration > 0) {
      newTime = Math.min(newTime, duration);
    }
    set({ currentTime: newTime });
  },
  
  seekToPercent: (pct) => {
    const { duration } = get();
    if (duration > 0) {
      set({ currentTime: duration * pct });
    }
  },

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)), muted: v === 0 }),
  toggleMute: () => set((state) => ({ muted: !state.muted, volume: state.muted && state.volume === 0 ? 1 : state.volume })),
  
  setPlaybackRate: (r) => set({ playbackRate: r, activePanel: null }), // Close panel on select
  setQuality: (q) => set({ quality: q, activePanel: null }),
  setSubtitleTrack: (lang) => set({ subtitleTrack: lang, activePanel: null }),
  setAudioTrack: (lang) => set({ audioTrack: lang, activePanel: null }),
  
  showControls: () => set({ controlsVisible: true }),
  hideControls: () => {
    // Only hide if panels are closed and playing
    const { activePanel, playing } = get();
    if (!activePanel && playing) {
      set({ controlsVisible: false });
    }
  },
  
  togglePanel: (panel) => set((state) => {
    if (state.activePanel === panel) {
      return { activePanel: null };
    }
    // Opening a panel ensures controls stay visible
    return { activePanel: panel, controlsVisible: true };
  }),

  setDuration: (duration) => set({ duration }),
  setCurrentTime: (time) => set((state) => {
    // Also try to update current chapter
    let currentChapter = state.currentChapter;
    if (state.chapters.length > 0) {
      currentChapter = state.chapters.find(c => time >= c.startTime && time < c.endTime) || null;
    }
    return { currentTime: time, currentChapter };
  }),
  setBuffered: (buffered) => set({ buffered }),
  setIsBuffering: (isBuffering) => set({ isBuffering }),
  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
  setChapters: (chapters) => set({ chapters }),
  
  setReactionMode: (active) => set({ isReactionMode: active, playing: active ? false : get().playing, activeReaction: active ? get().activeReaction : null }),
  setMovieReactions: (reactions) => set({ movieReactions: reactions }),
  setActiveReaction: (reaction) => set({ activeReaction: reaction, isReactionMode: !!reaction }),
  setReactionLayout: (layout) => set({ reactionLayout: layout }),
}));
