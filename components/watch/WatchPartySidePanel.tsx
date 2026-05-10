"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Smile, Image as ImageIcon, MoreHorizontal, Users, Activity, MessageSquare, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ChatMessage {
  id: string;
  userName: string;
  userId: string;
  message: string;
  timestamp: number;
  role?: 'HOST' | 'Buffering' | 'Member';
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
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
    { id: 'participants', label: 'Participants', icon: <Users size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> }
  ];

  return (
    <div className="w-[320px] h-full bg-[#0A0A0A] border-l border-white/5 flex flex-col z-[90]">
      {/* Tabs */}
      <div className="px-8 pt-8 flex items-center gap-6 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-4 text-xs font-bold transition-all relative ${
              activeTab === tab.id ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="side-tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Dummy "Joined" message from image */}
              <div className="flex items-center gap-3 py-2 px-4 bg-zinc-900/40 rounded-2xl border border-white/5 opacity-80">
                 <Users size={14} className="text-emerald-500" />
                 <span className="text-xs font-medium text-zinc-300">Alex joined the party</span>
                 <span className="ml-auto text-[10px] text-zinc-600">9:43 PM</span>
              </div>

              {messages.map((msg, i) => {
                const isHost = participants.find(p => p.userId === msg.userId)?.isHost;
                const role = isHost ? 'HOST' : (Math.random() > 0.8 ? 'Buffering' : '');
                
                return (
                  <div key={msg.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 shrink-0 overflow-hidden">
                       <Image 
                          src={`https://i.pravatar.cc/100?u=${msg.userId}`}
                          alt={msg.userName}
                          width={40}
                          height={40}
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{msg.userName}</span>
                        {role && (
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            role === 'HOST' ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-500'
                          }`}>
                            {role}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-zinc-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/5 text-sm text-zinc-300 leading-relaxed shadow-lg">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dummy Reaction from image */}
              <div className="flex items-center gap-3 py-2 px-4 bg-zinc-900/40 rounded-2xl border border-white/5 opacity-80">
                 <ImageIcon size={14} className="text-red-500" />
                 <span className="text-xs font-medium text-zinc-300">John reacted ❤️</span>
                 <span className="ml-auto text-[10px] text-zinc-600">9:44 PM</span>
              </div>

              <div ref={chatEndRef} />
            </motion.div>
          )}

          {activeTab === 'participants' && (
            <motion.div 
              key="participants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {participants.map((p) => (
                <div key={p.socketId} className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden">
                     <Image 
                        src={`https://i.pravatar.cc/100?u=${p.userId}`}
                        alt={p.userName}
                        width={40}
                        height={40}
                      />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{p.userName}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      p.status === 'watching' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>{p.status}</span>
                  </div>
                  {p.isHost && (
                    <span className="ml-auto text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded">HOST</span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="px-8 py-4 border-t border-white/5">
        <form onSubmit={handleSend} className="relative bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden focus-within:border-red-500/50 transition-all shadow-xl">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-zinc-600 resize-none h-14 py-4 px-6 pr-24 scrollbar-hide"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button type="button" className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Smile size={18} /></button>
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-8 h-8 bg-red-600 hover:bg-red-500 disabled:opacity-20 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
