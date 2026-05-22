/**
 * @file AccountCards.tsx
 * @description Premium React user interface component for the MovieFlix OTT client application.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import React from 'react';
import { 
  ChevronRight, 
  Check, 
  Plus, 
  Mail, 
  Lock, 
  Smartphone, 
  CreditCard,
  Calendar,
  Gift,
  ShoppingBag,
  Monitor,
  Activity,
  LogOut,
  User,
  Shield,
  Star,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Shared Container Card ---
export const AccountCard = ({ title, icon: Icon, children, className = "" }: { 
  title: string, 
  icon: any, 
  children: React.ReactNode, 
  className?: string 
}) => (
  <div className={`bg-[#121212] rounded-xl border border-[#222] overflow-hidden shadow-2xl ${className}`}>
    <div className="px-6 py-4 border-b border-[#222] flex items-center gap-3">
      <div className="p-2 bg-[#222] rounded-lg">
        <Icon className="w-5 h-5 text-red-600" />
      </div>
      <h2 className="text-[18px] font-bold text-white uppercase tracking-wider">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// --- Sub-component: Membership Detail Row ---
export const MembershipRow = ({ icon: Icon, label, value, actionLabel, onClick }: {
  icon: any,
  label: string,
  value: string,
  actionLabel: string,
  onClick: () => void
}) => (
  <div className="flex items-center justify-between group py-3 first:pt-0 border-b border-[#222] last:border-b-0">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center text-[#808080]">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[13px] text-[#808080] font-medium">{label}</div>
        <div className="text-[15px] text-white font-semibold">{value}</div>
      </div>
    </div>
    <button 
      onClick={onClick}
      className="flex items-center gap-1 text-[14px] text-[#808080] hover:text-white transition-colors group-hover:text-blue-500"
    >
      <span>{actionLabel}</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// --- Sub-component: Plan Comparison Card ---
export const PlanTierCard = ({ id, name, resolution, devices, isActive, onClick }: {
  id: string,
  name: string,
  resolution: string,
  devices: number,
  isActive: boolean,
  onClick: () => void
}) => (
  <div 
    onClick={onClick}
    className={`relative flex-1 p-5 rounded-xl border-2 transition-all cursor-pointer select-none
      ${isActive 
        ? "border-red-600 bg-[#1a0505] ring-1 ring-red-600/30" 
        : "border-[#333] bg-[#1a1a1a] hover:border-[#444] hover:bg-[#222]"}`}
  >
    {isActive && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
        Current Plan
      </div>
    )}
    <div className="text-[18px] font-black text-white mb-1">{name}</div>
    <div className="text-[13px] text-[#808080] space-y-1">
      <div className="flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5 text-red-600" />
        <span>{resolution}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5 text-red-600" />
        <span>{devices} devices</span>
      </div>
    </div>
  </div>
);

// --- Sub-component: Static Action Card ---
export const SecurityActionCard = ({ icon: Icon, title, desc, actionLabel, onClick }: {
  icon: any,
  title: string,
  desc: string,
  actionLabel: string,
  onClick: () => void
}) => (
  <div className="flex-1 bg-[#1a1a1a] p-5 rounded-xl border border-[#333] hover:border-[#444] transition-all group">
    <div className="flex items-center gap-4 mb-3">
      <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-[15px] font-bold text-white leading-tight">{title}</div>
        <div className="text-[13px] text-[#808080]">{desc}</div>
      </div>
    </div>
    <button 
      onClick={onClick}
      className="text-[13px] font-bold text-red-600 flex items-center gap-1 hover:underline"
    >
      <span>{actionLabel}</span>
      <ChevronRight className="w-4 h-4 ml-0.5" />
    </button>
  </div>
);

// --- Sub-component: Profile Detail Tile ---
export const ProfileDetailTile = ({ profile, avatar, isCurrent, onAction }: {
  profile: any,
  avatar: any,
  isCurrent: boolean,
  onAction: (action: string) => void
}) => (
  <div className="flex-1 min-w-[240px] bg-[#1a1a1a] p-5 rounded-xl border border-[#333] hover:border-[#444] transition-all">
    <div className="flex items-center gap-4 mb-5">
      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-3xl shadow-lg relative`}>
        {avatar.emoji}
        {isCurrent && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1a1a]" title="Active" />
        )}
      </div>
      <div>
        <div className="text-[16px] font-bold text-white mb-0.5">{profile.name}</div>
        <div className="inline-block px-1.5 py-0.5 bg-[#333] text-[#808080] text-[10px] font-black rounded uppercase">
          {profile.maturityRating || "G"}
        </div>
      </div>
    </div>
    
    <div className="space-y-1">
      {[
        { label: "Manage Profile", action: "manage" },
        { label: "Viewing Activity", action: "activity" },
        { label: "Playback Settings", action: "playback" }
      ].map((btn) => (
        <button 
          key={btn.action}
          onClick={() => onAction(btn.action)}
          className="w-full flex items-center justify-between py-2 text-[13px] text-[#808080] hover:text-white transition-colors group"
        >
          <span className="group-hover:underline">{btn.label}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      ))}
    </div>
  </div>
);

// --- Sub-component: Add Profile Button ---
export const AddProfileCard = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex-1 min-w-[120px] max-w-[120px] bg-[#121212] border-2 border-dashed border-[#333] hover:border-[#555] rounded-xl flex flex-col items-center justify-center gap-2 group transition-all"
  >
    <div className="w-12 h-12 rounded-full border-2 border-[#333] group-hover:border-[#555] flex items-center justify-center text-[#333] group-hover:text-[#888] transition-colors">
      <Plus className="w-6 h-6" />
    </div>
    <div className="text-[12px] font-bold text-[#555] group-hover:text-[#888]">Add Profile</div>
  </button>
);
