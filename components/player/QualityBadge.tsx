import { usePlayerState } from '@/hooks/usePlayerState';

export function QualityBadge() {
  const { quality } = usePlayerState();
  
  if (quality === 'auto') {
    return (
      <div className="px-1 border border-white/30 rounded text-[10px] font-bold text-white/70 tracking-wider">
        HD
      </div>
    );
  }

  return (
    <div className="px-1 border border-white/30 rounded text-[10px] font-bold text-white/70 tracking-wider">
      {quality.toUpperCase()}
    </div>
  );
}
