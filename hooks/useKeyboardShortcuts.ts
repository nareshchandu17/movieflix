import { useEffect } from 'react';
import { usePlayerState } from './usePlayerState';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  const {
    togglePlay,
    seek,
    volume,
    setVolume,
    toggleMute,
    setIsFullscreen,
    isFullscreen,
    togglePanel,
    activePanel,
    currentTime
  } = usePlayerState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Modifier combinations to avoid interfering with OS shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      let preventDefault = true;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          togglePlay();
          const isPlaying = usePlayerState.getState().playing;
          toast(isPlaying ? '⏸️ Paused' : '▶️ Playing', { position: 'top-center', duration: 1000 });
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          seek(currentTime + 10);
          window.dispatchEvent(new CustomEvent('player:seek-flash', { detail: { type: 'forward', msg: '+10s' } }));
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          seek(currentTime - 10);
          window.dispatchEvent(new CustomEvent('player:seek-flash', { detail: { type: 'rewind', msg: '-10s' } }));
          break;
        case 'ArrowUp':
          setVolume(Math.min(1, volume + 0.1));
          toast(`Volume ${Math.round(Math.min(1, volume + 0.1) * 100)}%`, { position: 'top-center', duration: 1000 });
          break;
        case 'ArrowDown':
          setVolume(Math.max(0, volume - 0.1));
          toast(`Volume ${Math.round(Math.max(0, volume - 0.1) * 100)}%`, { position: 'top-center', duration: 1000 });
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'f':
        case 'F':
          if (!isFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
          } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
          }
          break;
        case 'Escape':
          if (activePanel) {
            togglePanel(null); // Close panels first
          } else if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
          }
          break;
        case 'c':
        case 'C':
          toast('Subtitles toggled', { position: 'top-center', duration: 1000 });
          break;
        default:
          // Check for numbers 0-9
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 0 && num <= 9) {
             const pct = num / 10;
             usePlayerState.getState().seekToPercent(pct);
             toast(`Seek to ${num * 10}%`, { position: 'top-center', duration: 1000 });
          } else {
            preventDefault = false;
          }
      }

      if (preventDefault) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, volume, setVolume, toggleMute, setIsFullscreen, isFullscreen, togglePanel, activePanel, currentTime]);
}
