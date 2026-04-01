"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Flame, Trophy, Bell, ChevronRight, MessageSquare, Shield, Share2 } from "lucide-react";

export default function GroupDashboard({ groupId }: { groupId: string }) {
  const [activeTab, setActiveTab] = useState("feed");

  // Mock Data for Interstellar Watch Group
  const groupData = {
    name: "Tars' Team",
    streak: 12,
    goal: 3,
    members: [
      { name: "Cooper", progress: 3, avatar: "C", status: "Done" },
      { name: "Brand", progress: 2, avatar: "B", status: "Lagging" },
      { name: "Murph", progress: 1, avatar: "M", status: "Critical" },
    ]
  };

  const activityFeed = [
    { id: 1, type: "watch", user: "Cooper", msg: "just watched E12 — 'No Time for Caution' 🎹", time: "2h ago" },
    { id: 2, type: "nudge", user: "System", msg: "Group streak at risk! Murph needs 2 more episodes. ⏰", time: "1h ago" },
    { id: 3, type: "milestone", user: "System", msg: "Unlocked 'Committed Crew' — 3 months together! 🎉", time: "Yesterday" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-display p-8 md:p-12 lg:p-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic">
              {groupData.name}
            </h1>
            <div className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center gap-2 shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-white text-white" />
              <span className="text-lg font-black">{groupData.streak} Week Streak</span>
            </div>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-6">
            Watch Group • Interstellar <div className="size-1.5 bg-white/20 rounded-full" /> Goal: {groupData.goal} EPS/Week
          </p>
        </div>

        <div className="flex gap-4">
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
            <Share2 className="w-6 h-6" />
          </button>
          <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
            Invite Crew
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Streak Health & Milestones */}
        <div className="lg:col-span-8 space-y-12">
          {/* Streak Health Indicator */}
          <section className="glass-container p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Flame className="w-32 h-32" />
            </div>
            
            <h2 className="text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
              Streak Health <div className="h-px flex-1 bg-white/5" />
            </h2>

            <div className="space-y-8">
              {groupData.members.map((member, i) => (
                <div key={member.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center font-bold text-xl border border-white/5 italic">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-lg leading-none mb-1">{member.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          member.status === 'Done' ? 'text-green-500' : 
                          member.status === 'Lagging' ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {member.status} • {member.progress}/{groupData.goal} Episodes
                        </p>
                      </div>
                    </div>
                    {member.status !== 'Done' && (
                      <button className="px-5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Nudge
                      </button>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(member.progress/groupData.goal) * 100}%` }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                      className={`h-full ${
                        member.status === 'Done' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 
                        member.status === 'Lagging' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Milestone Tree (Simplified) */}
          <section className="glass-container p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
              Milestone Legacy <div className="h-px flex-1 bg-white/5" />
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'The Beginning', icon: <ChevronRight />, unlocked: true },
                { label: '4-Week Flash', icon: <Flame />, unlocked: true },
                { label: 'Season Slayers', icon: <Trophy />, unlocked: false },
                { label: 'Unbreakable', icon: <Shield />, unlocked: false },
              ].map((m, i) => (
                <div key={m.label} className={`aspect-square rounded-[2rem] border p-6 flex flex-col items-center justify-center gap-4 transition-all ${
                  m.unlocked ? 'border-white/20 bg-white/5' : 'border-white/5 bg-transparent opacity-30 grayscale'
                }`}>
                  <div className={`p-4 rounded-full ${m.unlocked ? 'bg-primary/20 text-primary' : 'bg-white/5'}`}>
                    {React.cloneElement(m.icon as React.ReactElement, { className: "w-8 h-8" })}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">{m.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-4">
          <section className="h-full glass-container p-10 rounded-[3rem] border border-white/10 flex flex-col">
             <h2 className="text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
              The Bridge <div className="h-px flex-1 bg-white/5" />
            </h2>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              {activityFeed.map((item, i) => (
                <div key={item.id} className="relative pl-8 space-y-2 group">
                  <div className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${
                    item.type === 'watch' ? 'bg-green-500' :
                    item.type === 'nudge' ? 'bg-red-600 animate-pulse' : 'bg-purple-500'
                  }`} />
                  <div className="absolute left-[2px] top-4 bottom-[-16px] w-[2px] bg-white/5 group-last:hidden" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-tight">
                      <span className="text-white/60">{item.user}</span> {item.msg}
                    </p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{item.time}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="px-2 py-1 bg-white/5 rounded-lg text-[10px] hover:bg-white/10 transition-colors">👍</button>
                    <button className="px-2 py-1 bg-white/5 rounded-lg text-[10px] hover:bg-white/10 transition-colors">🔥</button>
                    <button className="px-2 py-1 bg-white/5 rounded-lg text-[10px] hover:bg-white/10 transition-colors">🚀</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Send group reaction..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-white/20 transition-all font-bold"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5 flex-shrink-0" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
