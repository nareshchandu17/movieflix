import { motion } from 'framer-motion';
import { useWatchParty } from '@/hooks/useWatchParty';
import { usePlayerState } from '@/hooks/usePlayerState';
import { Users, MessageSquare } from 'lucide-react';

export function WatchPartyOverlay({ roomId }: { roomId?: string }) {
  const { partyState } = useWatchParty(roomId);
  const { controlsVisible } = usePlayerState();

  if (!partyState.isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: controlsVisible ? 1 : 0.4, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute top-8 right-8 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 pointer-events-auto shadow-2xl transition-opacity hover:!opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center -space-x-2 mr-2">
        {partyState.users.slice(0, 3).map((user, i) => (
          <div key={user.id} className="relative w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-gray-800">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
             {/* Online status indicator */}
             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
          </div>
        ))}
      </div>
      
      <div className="flex flex-col mr-2">
         <span className="text-white font-bold text-sm leading-tight tracking-wide">Watch Party</span>
         <span className="text-green-400 font-medium text-[10px] leading-none uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            In Sync
         </span>
      </div>

      <div className="w-[1px] h-6 bg-white/20 mx-1" />

      <button className="text-white hover:bg-white/10 p-2 rounded-full transition-colors relative">
        <MessageSquare className="w-5 h-5 text-white/90" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
      </button>
    </motion.div>
  );
}
