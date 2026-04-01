"use client"
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ParallaxBackground } from './ParallaxBackground';
import { FilterChips } from './FilterChips';
import { MovieCarousel } from './MovieCarousel';
import { AISuggestionPanel } from './AISuggestionPanel';
import { movieSections, aiSuggestion } from './data/movies';

function App() {
  // Standard smooth scrolling
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0F0F0F]">
      {/* 3D Parallax Background */}
      <ParallaxBackground />

      {/* AI Suggestion Panel */}
      <AISuggestionPanel suggestion={aiSuggestion} />

      {/* Main Content */}
      <main className="relative z-10 pt-[72px]">
        {/* Filter Chips */}
        <FilterChips />

        {/* Movie Sections */}
        <div className="pb-20 space-y-2">
          {movieSections.map((section, index) => (
            <MovieCarousel
              key={section.id}
              title={section.title}
              movies={section.movies}
              variant={section.id === 'expiring-soon' ? 'expiring' : 'default'}
              delay={index * 0.1}
            />
          ))}

          {/* Haven't Watched Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="px-6 lg:px-10 py-12"
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.68, -0.55, 0.265, 1.55] }}
                className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center"
              >
                <span className="text-3xl">📺</span>
              </motion.div>
              <h2 className="text-xl font-semibold text-white/60">
                Haven't Watched in a While?
              </h2>
              <p className="text-sm text-white/40 max-w-md">
                Your watchlist is waiting. Discover something new or continue where you left off.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-full text-sm font-medium text-white transition-colors"
              >
                Browse Recommendations
              </motion.button>
            </div>
          </motion.section>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                Stream<span className="text-[#E50914]">Flix</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Help</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <p className="text-xs text-white/30">
              © 2024 StreamFlix. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
