"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { usePlayerState } from '@/hooks/usePlayerState';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoHideControls } from '@/hooks/useAutoHideControls';
import { useProgressPersistence } from '@/hooks/useProgressPersistence';
import { useChapterDetection } from '@/hooks/useChapterDetection';
import { useReactionRecorder } from '@/hooks/useReactionRecorder';
import { useGestureControls } from '@/hooks/useGestureControls';

import { VideoLayer } from './VideoLayer';
import { ControlsOverlay } from './ControlsOverlay';
import { SettingsPanel } from './SettingsPanel';
import { EpisodesPanel } from './EpisodesPanel';
import { SubtitlesPanel } from './SubtitlesPanel';
import { SubtitleRenderer } from './SubtitleRenderer';
import { SkipIntroButton } from './SkipIntroButton';
import { NextEpisodeCard } from './NextEpisodeCard';
import { TopBar } from './TopBar';
import { SeekIndicator } from './SeekIndicator';
import { BufferingSpinner } from './BufferingSpinner';
import { WatchPartyOverlay } from './WatchPartyOverlay';
import { ReactionRecorder } from '../reactions/ReactionRecorder';
import { RoomSettingsModal } from './RoomSettingsModal';
import { ReactionOverlay } from './ReactionOverlay';

interface PlayerRootProps {
  contentId: string;
  url: string;
  title: string;
  type?: 'movie' | 'series';
  roomId?: string; // For Watch Party
  isWatchParty?: boolean;
}

export function PlayerRoot({ contentId, url, title, roomId, isWatchParty }: PlayerRootProps) {
  // Initialize hooks
  useKeyboardShortcuts();
  useAutoHideControls();
  useProgressPersistence(contentId);
  useChapterDetection(contentId);
  useGestureControls();

  const { 
    isBuffering, 
    controlsVisible, 
    showControls, 
    hideControls, 
    seek, 
    playing, 
    togglePlay, 
    activeReaction, 
    reactionLayout,
    setActiveReaction,
    setMovieReactions,
    activePanel, 
    togglePanel, 
    setIsFullscreen,
    currentTime
  } = usePlayerState();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // New Reaction State
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [recorderTimestamp, setRecorderTimestamp] = useState(0);
  const [isRoomSettingsOpen, setIsRoomSettingsOpen] = useState(false);

  // Reaction Sync Initialization
  const searchParams = useSearchParams();
  const reactionId = searchParams?.get('reactionId');

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`/api/reactions?movieId=${contentId}&limit=100`);
        const data = await res.json();
        if (data.reactions) {
          setMovieReactions(data.reactions);
          
          // If we came from a specific reaction link, prime it
          if (reactionId) {
            const reaction = data.reactions.find((r: any) => r._id === reactionId);
            if (reaction) {
              seek(Math.max(0, reaction.movieTimestamp - 2));
              setActiveReaction(reaction);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch reactions for player:", err);
      }
    };

    if (contentId) {
      fetchReactions();
    }
  }, [contentId, reactionId, setMovieReactions, setActiveReaction, seek]);

  // Reaction/Party Event Listeners
  useEffect(() => {
    const handleOpenRecorder = (e: any) => {
      setRecorderTimestamp(e.detail.timestamp);
      setIsRecorderOpen(true);
      // Pause playback when recording starts
      if (usePlayerState.getState().playing) {
          usePlayerState.getState().togglePlay();
      }
    };

    const handleOpenRoomSettings = () => {
      setIsRoomSettingsOpen(true);
      // Pause playback when settings open
      if (usePlayerState.getState().playing) {
          usePlayerState.getState().togglePlay();
      }
    };

    window.addEventListener('player:open-recorder', handleOpenRecorder);
    window.addEventListener('player:open-room-settings', handleOpenRoomSettings);
    
    return () => {
      window.removeEventListener('player:open-recorder', handleOpenRecorder);
      window.removeEventListener('player:open-room-settings', handleOpenRoomSettings);
    };
  }, []);

  // Handle interaction zones
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a recorder or panel is open, close it first
    if (isRecorderOpen) return;
    if (activePanel) {
      togglePanel(null);
      return;
    }

    const { clientX } = e;
    const width = window.innerWidth;
    const isLeftThird = clientX < width / 3;
    const isRightThird = clientX > (width * 2) / 3;

    if (e.detail === 1) {
      // Single click - pause/play (with double-click prevention delay)
      clickTimeout.current = setTimeout(() => {
        togglePlay();
        
        // Dispatch center flash
        window.dispatchEvent(new CustomEvent('player:seek-flash', { 
          detail: { type: usePlayerState.getState().playing ? 'pause' : 'play', msg: usePlayerState.getState().playing ? 'Pause' : 'Play' } 
        }));
      }, 250);
    } else if (e.detail === 2) {
      // Double click
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
      
      if (isLeftThird) {
        seek(currentTime - 10);
        window.dispatchEvent(new CustomEvent('player:seek-flash', { detail: { type: 'rewind', msg: '-10s' } }));
      } else if (isRightThird) {
        seek(currentTime + 10);
        window.dispatchEvent(new CustomEvent('player:seek-flash', { detail: { type: 'forward', msg: '+10s' } }));
      } else {
        // Center double click -> toggle fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          containerRef.current?.requestFullscreen().catch(() => {});
        }
      }
    }
  };

  // Inside PlayerRoot return
  const isSplit = activeReaction && reactionLayout === 'split';

  return (
    <div 
      id="player-root"
      ref={containerRef}
      className={`relative w-full h-screen bg-black overflow-hidden select-none outline-none ${!controlsVisible ? 'cursor-none' : 'cursor-default'}`}
      onClick={handleInteraction}
      tabIndex={0}
    >
      <motion.div 
        animate={{ width: isSplit ? '60%' : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 150 }}
        className="relative h-full overflow-hidden"
      >
        <VideoLayer url={url} />
        
        <BufferingSpinner isVisible={isBuffering} />
        
        <SeekIndicator />
        <TopBar />
        <WatchPartyOverlay roomId={roomId} />
        
        <SubtitleRenderer />
        
        <SkipIntroButton />
        <NextEpisodeCard />
        
        <ControlsOverlay isWatchParty={isWatchParty} />
        
        {/* Floating Panels */}
        <SettingsPanel />
        <EpisodesPanel />
        <SubtitlesPanel />

        {/* Reaction Recorder */}
        <ReactionRecorder 
          movieId={contentId}
          movieTitle={title}
          movieTimestamp={recorderTimestamp}
          isOpen={isRecorderOpen}
          onClose={() => setIsRecorderOpen(false)}
        />

        {/* Room Settings */}
        <RoomSettingsModal
          roomId={roomId || ""}
          isOpen={isRoomSettingsOpen}
          onClose={() => setIsRoomSettingsOpen(false)}
        />
      </motion.div>

      {/* Synchronized Reaction Layer */}
      <ReactionOverlay />
    </div>
  );
}
