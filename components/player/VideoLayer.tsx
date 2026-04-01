import { useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePlayerState } from '@/hooks/usePlayerState';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface VideoLayerProps {
  url: string;
}

export function VideoLayer({ url }: VideoLayerProps) {
  const { 
    playing, 
    volume, 
    muted, 
    playbackRate, 
    quality,
    setCurrentTime,
    setDuration,
    setBuffered,
    setIsBuffering
  } = usePlayerState();
  
  const playerRef = useRef<any>(null);
  
  // We need to sync Zustand's currentTime back to ReactPlayer only when seek() is called.
  // Because onProgress constantly updates Zustand, pushing Zustand's time back to ReactPlayer
  // continuously would cause infinite seeking loops and stuttering.
  // We handle this by subscribing to specific seek commands in PlayerRoot, or using a separate trigger.
  // For robustness, Zustand acts as the source of truth for UI, ReactPlayer maintains internal time.
  useEffect(() => {
    const handleForceSeek = (e: CustomEvent<number>) => {
      if (playerRef.current) {
        playerRef.current.seekTo(e.detail, 'seconds');
      }
    };
    window.addEventListener('player:force-seek', handleForceSeek as EventListener);
    return () => window.removeEventListener('player:force-seek', handleForceSeek as EventListener);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        controls={false}
        config={{
          file: {
            forceHLS: url.includes('.m3u8'),
            hlsOptions: {
              // Standard HLS.js config to simulate quality changes
              // In a real app with pure HLS.js, we would manipulate levels manually here based on `quality` var
              startLevel: -1 
            }
          },
          youtube: {
            playerVars: { 
              modestbranding: 1, 
              rel: 0, 
              iv_load_policy: 3, 
              vq: quality === 'auto' ? 'hd1080' : quality 
            }
          }
        }}
        onProgress={(state) => {
          setCurrentTime(state.playedSeconds);
          setBuffered(state.loadedSeconds);
        }}
        onDuration={(d) => setDuration(d)}
        onBuffer={() => setIsBuffering(true)}
        onBufferEnd={() => setIsBuffering(false)}
        onEnded={() => {
          // Fire event for NextEpisodeCard or tracking
          window.dispatchEvent(new Event('player:ended'));
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
