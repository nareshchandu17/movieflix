import { usePlayerState } from '@/hooks/usePlayerState';

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function TimeDisplay() {
  const { currentTime, duration } = usePlayerState();

  return (
    <div className="text-white font-medium text-[14px] ml-2 select-none tracking-wide" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
      {formatTime(currentTime)}
      <span className="text-white/40 font-normal mx-1">/</span>
      <span className="text-white/60">{formatTime(duration)}</span>
    </div>
  );
}
