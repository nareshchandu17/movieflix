import { Avatar } from '@/types/profiles';

export const AVATARS: Avatar[] = [
  // ── Characters ─────────────────────────────────────
  { id: 'hero',      name: 'Hero',      emoji: '🦸', gradient: 'from-red-900 via-rose-800 to-red-950',         ring: 'ring-red-400',     category: 'character' },
  { id: 'wizard',    name: 'Wizard',    emoji: '🧙', gradient: 'from-violet-900 via-purple-800 to-violet-950',  ring: 'ring-violet-400',  category: 'character' },
  { id: 'ninja',     name: 'Ninja',     emoji: '🥷', gradient: 'from-zinc-800 via-neutral-700 to-zinc-900',     ring: 'ring-zinc-400',    category: 'character' },
  { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', gradient: 'from-blue-900 via-indigo-800 to-blue-950',     ring: 'ring-blue-400',    category: 'character' },
  { id: 'knight',    name: 'Knight',    emoji: '⚔️',  gradient: 'from-stone-800 via-amber-900 to-stone-950',    ring: 'ring-amber-400',   category: 'character' },
  { id: 'vampire',   name: 'Vampire',   emoji: '🧛', gradient: 'from-red-950 via-rose-950 to-black',            ring: 'ring-red-600',     category: 'character' },
  // ── Animals ────────────────────────────────────────
  { id: 'panda',     name: 'Panda',     emoji: '🐼', gradient: 'from-slate-700 via-gray-600 to-slate-900',      ring: 'ring-slate-400',   category: 'animal' },
  { id: 'lion',      name: 'Lion',      emoji: '🦁', gradient: 'from-amber-800 via-yellow-700 to-amber-950',    ring: 'ring-amber-400',   category: 'animal' },
  { id: 'fox',       name: 'Fox',       emoji: '🦊', gradient: 'from-orange-800 via-red-700 to-orange-950',     ring: 'ring-orange-400',  category: 'animal' },
  { id: 'dragon',    name: 'Dragon',    emoji: '🐉', gradient: 'from-emerald-900 via-teal-800 to-emerald-950',  ring: 'ring-emerald-400', category: 'animal' },
  { id: 'wolf',      name: 'Wolf',      emoji: '🐺', gradient: 'from-slate-900 via-blue-950 to-slate-950',      ring: 'ring-slate-300',   category: 'animal' },
  { id: 'phoenix',   name: 'Phoenix',   emoji: '🦅', gradient: 'from-orange-900 via-amber-700 to-yellow-900',   ring: 'ring-yellow-400',  category: 'animal' },
  // ── Abstract ───────────────────────────────────────
  { id: 'robot',     name: 'Robot',     emoji: '🤖', gradient: 'from-cyan-900 via-teal-800 to-cyan-950',        ring: 'ring-cyan-400',    category: 'abstract' },
  { id: 'alien',     name: 'Alien',     emoji: '👽', gradient: 'from-green-900 via-emerald-800 to-green-950',   ring: 'ring-green-400',   category: 'abstract' },
  { id: 'ghost',     name: 'Ghost',     emoji: '👻', gradient: 'from-indigo-900 via-blue-800 to-indigo-950',    ring: 'ring-indigo-400',  category: 'abstract' },
  { id: 'cosmic',    name: 'Cosmic',    emoji: '🌌', gradient: 'from-purple-950 via-fuchsia-900 to-purple-950', ring: 'ring-fuchsia-400', category: 'abstract' },
  { id: 'fire',      name: 'Fire',      emoji: '🔥', gradient: 'from-orange-950 via-red-800 to-yellow-900',     ring: 'ring-orange-300',  category: 'abstract' },
  { id: 'kids',      name: 'Kids ⭐',   emoji: '⭐', gradient: 'from-yellow-800 via-amber-600 to-yellow-900',   ring: 'ring-yellow-300',  category: 'abstract' },
];

export const AVATAR_MAP: Record<string, Avatar> = Object.fromEntries(
  AVATARS.map((a) => [a.id, a])
);

export const AVATAR_CATEGORIES = ['character', 'animal', 'abstract'] as const;

export function getAvatarsByCategory(category: Avatar['category']): Avatar[] {
  return AVATARS.filter((a) => a.category === category);
}
