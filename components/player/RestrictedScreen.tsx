"use client";

import { motion } from "framer-motion";
import { Lock, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface RestrictedScreenProps {
  title: string;
  rating: string;
}

export default function RestrictedScreen({ title, rating }: RestrictedScreenProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E50914] rounded-full blur-[180px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="relative z-10 flex flex-col items-center max-w-lg"
      >
        <div className="w-20 h-20 bg-[#1f1f1f] border border-[#333] rounded-full flex items-center justify-center mb-8 shadow-2xl">
          <Lock className="w-10 h-10 text-[#E50914]" />
        </div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
        
        <div className="bg-[#E50914]/10 border border-[#E50914]/20 px-4 py-2 rounded-md mb-6 inline-flex items-center gap-2">
          <span className="text-[#E50914] font-bold text-lg uppercase tracking-wider">{rating}</span>
          <span className="text-[#ccc] text-sm">| Restricted Content</span>
        </div>

        <p className="text-[#888] text-lg leading-relaxed mb-10">
          This content is rated <span className="text-white font-medium">{rating}</span> and cannot be viewed on a Kids profile. Please switch to an adult profile to watch <span className="text-white font-medium italic">&quot;{title}&quot;</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/profiles/select"
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Switch Profile
          </Link>
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-[#1f1f1f] text-white border border-[#333] font-bold rounded-md hover:bg-[#2a2a2a] transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
