"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Users, Activity, X, Send, Smile, Image as ImageIcon, MoreHorizontal, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  userName: string;
  userId: string;
  message: string;
  timestamp: number;
}

interface Participant {
  userName: string;
  userId: string;
  socketId: string;
  status: string;
  isHost: boolean;
}

interface WatchPartySidePanelProps {
  messages: ChatMessage[];
  participants: Participant[];
  currentUser: { id: string; name: string };
  onSendMessage: (msg: string) => void;
  isConnected: boolean;
}

export const WatchPartySidePanel = ({ 
  messages, 
  participants, 
  currentUser, 
  onSendMessage,
  isConnected 
}: WatchPartySidePanelProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'activity'>('chat');
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput("");
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
    { id: 'participants', label: 'Participants', icon: <Users size={14} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={14} /> }
  ];

  return (
    <div className="w-[440px] h-full bg-[#0A0A0A] border-l border-white/5 flex flex-col shadow-2xl z-[90]">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center">
            <Users size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-white uppercase tracking-tight leading-none">Party Chat</h2>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              {participants.length} Active Members
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Connected</span>
          </div>
          <button className="text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex items-center gap-2 border-b border-white/5 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-tighter transition-all relative ${
              activeTab === tab.id ? 'text-red-500' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {messages.map((msg, i) => {
                const isMe = msg.userId === currentUser.id;
                const isFirstFromUser = i === 0 || messages[i-1].userId !== msg.userId;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {isFirstFromUser && (
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-red-500' : 'text-white/40'}`}>
                          {msg.userName} {isMe && '(YOU)'}
                          {participants.find(p => p.userId === msg.userId)?.isHost && <Crown size={10} className="inline ml-1 text-amber-500" />}
                        </span>
                        <span className="text-[8px] text-white/10 font-bold">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] leading-relaxed shadow-xl border ${
                      isMe 
                      ? 'bg-red-600/10 border-red-500/20 text-white rounded-tr-sm' 
                      : 'bg-white/5 border-white/10 text-white/80 rounded-tl-sm shadow-black/40'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </motion.div>
          )}

          {activeTab === 'participants' && (
            <motion.div 
              key="participants"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {participants.map((p) => (
                <div key={p.socketId} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-black uppercase text-white shadow-lg">
                        {(p.userName || 'Guest').substring(0, 2)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0A] ${
                        p.status === 'watching' ? 'bg-emerald-500' : p.status === 'buffering' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        {p.userName}
                        {p.isHost && <Crown size={12} className="text-amber-500" />}
                      </span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{p.status}</span>
                    </div>
                  </div>
                  {p.isHost && (
                    <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/10">Host</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div 
              key="activity"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Users size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white/80">Alex joined the party</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">9:43 PM</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 opacity-60">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                  <Smile size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white/80">John reacted ❤️</span>
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">9:44 PM</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5">
        <form onSubmit={handleSend} className="bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col gap-2 focus-within:border-red-500/50 transition-all">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20 resize-none h-20 p-2 scrollbar-hide"
          />
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-white/20 hover:text-white transition-colors"><Smile size={18} /></button>
              <button type="button" className="p-2 text-white/20 hover:text-white transition-colors"><ImageIcon size={18} /></button>
              <button type="button" className="p-2 text-white/20 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
            </div>
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-10 h-10 bg-red-600 hover:bg-red-500 disabled:opacity-20 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
