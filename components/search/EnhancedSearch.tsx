"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Mic, MicOff } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  price: string;
}

export default function EnhancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearchActive(true);
    } else {
      setIsSearchActive(false);
    }
  }, [searchQuery]);

  const mockResults: SearchResult[] = [
    { id: "1", title: 'Emergency Plumbing', category: 'Plumbing', price: '$80/hr' },
    { id: "2", title: 'AC Deep Cleaning', category: 'HVAC', price: '$120/hr' },
    { id: "3", title: 'Smart Home Installation', category: 'Electrical', price: '$200/hr' },
    { id: "4", title: 'Pest Control - Full Villa', category: 'Sanitation', price: '$150/hr' },
  ];

  return (
    <div className="min-h-screen font-sans relative">
      {/* Background Layer */}
      <div 
        className={`fixed inset-0 transition-colors duration-700 ease-in-out ${
          isSearchActive ? 'bg-black' : 'bg-white'
        }`}
      />

      {/* Blurred Overlay for Search Results - Outside any stacking contexts */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300 ${
          isSearchActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 5 }}
      />

      {/* Header / Search Bar Container - Always on top */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center" style={{ zIndex: 100 }}>
        <div className={`text-2xl font-display font-bold transition-colors duration-500 ${isSearchActive ? 'text-white' : 'text-black'}`}>
          FIXORA<span className="text-emerald-500">.</span>
        </div>

        <div className="relative group">
          <div className={`flex items-center rounded-full transition-all duration-500 border ${
            isSearchActive 
              ? 'bg-white/10 border-white/20 w-[400px] shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
              : 'bg-black/5 border-black/10 w-[240px] hover:w-[280px]'
          }`}>
            <div className="pl-4">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={isSearchActive ? "white" : "black"} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="opacity-50"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search home services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-3 px-4 bg-transparent outline-none font-medium transition-colors duration-500 ${
                isSearchActive ? 'text-white placeholder:text-white/40' : 'text-black placeholder:text-black/40'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 pt-32 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!isSearchActive ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mt-20"
            >
              <h1 className="text-7xl font-display font-bold tracking-tighter mb-6">
                Home services, <br />
                <span className="gradient-text">reimagined by AI.</span>
              </h1>
              <p className="text-xl text-black/60 max-w-2xl mx-auto font-light">
                Connect with the top 1% of service providers in your area. 
                Smart matching, instant booking, and guaranteed quality.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10"
            >
              {mockResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-3xl group cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
                    {result.category}
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-4 group-hover:text-emerald-300 transition-colors">
                    {result.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 font-mono">{result.price}</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className={`fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none transition-opacity duration-1000 ${isSearchActive ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
}
