"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Users, Shield, Link, LogOut, Settings } from 'lucide-react';

interface RoomSettingsModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoomSettingsModal({ roomId, isOpen, onClose }: RoomSettingsModalProps) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/watch-party/${roomId}`;
    navigator.clipboard.writeText(url);
    // You could add a toast here
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[hsl(240,20%,8%)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-600/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Room Settings</h2>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Watch Party Management</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Room ID Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Link className="w-3 h-3" /> Invite Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white/60 overflow-hidden whitespace-nowrap text-ellipsis">
                    {window.location.host}/watch-party/{roomId}
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Participants Section (Placeholder for functional state) */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3 h-3" /> Active Members
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">Y</div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          You <span className="px-1.5 py-0.5 rounded-md bg-red-600/20 text-[10px] text-red-400">HOST</span>
                        </p>
                        <p className="text-[10px] text-white/40 font-medium">Organizer</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </div>
                </div>
              </div>

              {/* Management Actions */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold text-sm">
                  <Shield className="w-4 h-4" />
                  Permissions
                </button>
                <button 
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600/20 transition-all font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Close Room
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-center">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Cineworld Secure Session</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
