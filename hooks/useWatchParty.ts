import { useEffect, useState } from 'react';
import { usePlayerState } from './usePlayerState';
import { WatchPartyState } from '@/types/player.types';

// Mock Socket.io Hook
export function useWatchParty(roomId?: string) {
  const { playing, currentTime, seek, setPlaying } = usePlayerState();
  const [partyState, setPartyState] = useState<WatchPartyState>({
    isActive: false,
    users: [],
    hostId: '',
    syncOffset: 0
  });

  useEffect(() => {
    if (!roomId) return;

    // Simulate connecting to room
    setPartyState({
      isActive: true,
      hostId: 'host-123',
      syncOffset: 0,
      users: [
        { id: 'local', name: 'You', currentTime: 0, isPlaying: false },
        { id: 'host-123', name: 'Host User', avatarUrl: '/avatars/1.jpg', currentTime: 0, isPlaying: false },
        { id: 'guest-1', name: 'Alice', avatarUrl: '/avatars/2.jpg', currentTime: 0, isPlaying: false }
      ]
    });

    console.log(`[Socket.io] Connected to watch party room: ${roomId}`);

    return () => {
      console.log(`[Socket.io] Disconnected from room: ${roomId}`);
      setPartyState(prev => ({ ...prev, isActive: false }));
    };
  }, [roomId]);

  // Synchronize local events out to the party (if host) or log them
  useEffect(() => {
    if (partyState.isActive) {
      console.log(`[Socket.io] local event: play=${playing}, time=${currentTime}`);
      // Send events to backend
    }
  }, [playing, partyState.isActive]); // Deliberately omit currentTime to avoid spamming the log

  return { partyState };
}
