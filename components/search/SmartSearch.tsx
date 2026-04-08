"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import { X, Loader2, Mic, MicOff, Film, Tv, Star, TrendingUp, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useSearch } from "@/contexts/SearchContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { toast } from "sonner";

// Custom debounce function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "series" | "actor";
  poster: string;
  year: number;
  rating: number;
  duration?: string;
  description: string;
  genres: string[];
  trending?: boolean;
  releaseDate?: string;
  knownFor?: string[];
  isDirector?: boolean;
  backdrop?: string;
  popularity?: number;
}

type SearchIntent = 
  | { type: 'multi'; query: string; label?: string }
  | { type: 'similar'; title: string }
  | { type: 'history' }
  | { type: 'nav'; route: string; label: string }
  | { type: 'identity' }
  | { type: 'play'; title: string }
  | { type: 'discover'; filter: Record<string, string | number | boolean>; remainingQuery: string; labels: string[] };

const ResultCard = ({ result, index, onClick }: { result: SearchResult; index: number; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="group relative cursor-pointer block w-full"
  >
    <div className="relative w-full h-0 pb-[150%] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105 bg-white/5">
      <div className="absolute inset-0">
        <Image
          src={result.poster}
          alt={result.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary text-white rounded">
            {result.type.toUpperCase()}
          </span>
          <span className="text-[10px] text-white/90">{result.year || ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{result.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
    <h3 className="mt-2 text-sm font-semibold text-white/90 group-hover:text-primary line-clamp-1">
      {result.title}
    </h3>
  </motion.div>
);

const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<SearchResult[]>([]);
  const [trendingTV, setTrendingTV] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [inputWidth, setInputWidth] = useState("w-32");
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsGridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); // Still any because SpeechRecognition is not standard in TS types yet
  const router = useRouter();
  const { isSearching, setIsSearching, setSearchQuery, searchQuery: globalSearchQuery } = useSearch();
  const { activeProfile } = useProfileContext();

  const [mounted, setMounted] = useState(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  useEffect(() => {
    const shouldSearch = isFocused && query.trim().length > 0;
    setIsSearching(shouldSearch);
  }, [isFocused, query, setIsSearching]);

  useEffect(() => {
    const loadTrendingContent = async () => {
      const fetchTrending = async (mediaType: "movie" | "tv") => {
        try {
          const res = await api.getTrending(mediaType, "day");
          return (res.results || []).slice(0, 6).map((item: any) => ({
            id: item.id.toString(),
            title: item.title || item.name || "Unknown",
            type: mediaType === "movie" ? ("movie" as const) : ("series" as const),
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
            year: (item.release_date || item.first_air_date) ? new Date(item.release_date || item.first_air_date).getFullYear() : 0,
            rating: item.vote_average || 0,
            description: item.overview || "",
            genres: [], trending: true, releaseDate: item.release_date || item.first_air_date,
            backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined,
          }));
        } catch (e) { return []; }
      };
      const [movies, tv] = await Promise.all([fetchTrending("movie"), fetchTrending("tv")]);
      setTrendingMovies(movies);
      setTrendingTV(tv);
    };
    loadTrendingContent();
  }, []);

  const genreMapping: Record<string, number> = {
    "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
    "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
    "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749, "sci fi": 878,
    "science fiction": 878, "thriller": 53, "war": 10752, "western": 37
  };

  const languageMapping: Record<string, string> = {
    "english": "en", "korean": "ko", "japanese": "ja", "spanish": "es", "french": "fr",
    "german": "de", "hindi": "hi", "chinese": "zh"
  };

  const moodKeywords: Record<string, number[]> = {
    "feel good": [155202, 180547], "sad": [18073, 155146], "mind bending": [10065, 14909, 232635],
    "dark": [10183, 9820, 155127], "romantic": [10749, 9840], "inspiring": [18073, 10751],
    "scary": [27, 232635], "funny": [35, 155202], "action packed": [28, 180547]
  };

  const themeKeywords: Record<string, number[]> = {
    "time travel": [9840, 4379], "space": [3205, 161176], "alien": [1646, 14909], 
    "zombie": [12377, 14512], "survival": [10349], "revenge": [1460, 10712],
    "heist": [9748, 14457], "superhero": [9715, 180734], "vampire": [3133], "magic": [2343],
    "ai": [10851, 6220], "artificial intelligence": [10851, 6220]
  };

  const situationKeywords: Record<string, { genres?: number[], keywords?: number[], adult?: string }> = {
    "date night": { genres: [10749, 35] },
    "kids": { genres: [16, 10751], adult: 'false' },
    "family": { genres: [10751], adult: 'false' },
    "with friends": { genres: [35, 28, 53] },
    "late night": { genres: [27, 53] },
    "relaxing": { genres: [35, 10749] }
  };

  const awardKeywords: Record<string, string> = {
    "oscar": "271101|295551", "academy award": "271101", "cannes": "3127",
    "golden globe": "271104", "award winning": "271101|271104|3127"
  };

  const parseQueryIntent = (q: string): SearchIntent => {
    let rawQ = q.toLowerCase().trim();
    let originalQ = q.trim();
    
    // 1. History personalization
    if (/^(more like this|similar to what i|based on my history|recommendations)/.test(rawQ)) {
      return { type: 'history' };
    }

    // 2. Navigation commands
    if (/^(go to|open|take me to|navigate to) (home|explore|browse)/.test(rawQ)) {
      return { type: 'nav', route: '/', label: 'Home' };
    }
    if (/^(go to|open|take me to|navigate to) (settings|account|profile)/.test(rawQ)) {
      return { type: 'nav', route: '/account', label: 'Settings' };
    }
    if (/^(go to|open|take me to|navigate to) (my list|watchlist|collection)/.test(rawQ)) {
      return { type: 'nav', route: '/mylist', label: 'My List' };
    }
    if (/^(go to|open|take me to|navigate to) (new and popular|trending|latest)/.test(rawQ)) {
      return { type: 'nav', route: '/new-popular', label: 'New & Popular' };
    }

    // 3. Identity commands
    if (/^(who am i|which profile|current profile|my profile|who is watching)/.test(rawQ)) {
      return { type: 'identity' };
    }

    // 4. Play commands
    const playMatch = rawQ.match(/^(play|watch|start) (.+)$/);
    if (playMatch) {
      return { type: 'play', title: playMatch[2] };
    }

    // 5. Exact quotes
    const quoteMatch = rawQ.match(/^"(.+)"$/);
    if (quoteMatch) return { type: 'multi', query: quoteMatch[1], label: "Quote Search" };

    // 3. Similar
    const similarMatch = rawQ.match(/^movies like (.+)$/);
    if (similarMatch) return { type: 'similar', title: similarMatch[1] };

    // Multi-pass extractor
    let remainingQuery = rawQ;
    const filter: Record<string, string | number | boolean> = {};
    const labels: string[] = [];
    
    // Runtime extraction
    const underMatch = remainingQuery.match(/under (\d+) (hour|hours|minute|minutes|min|mins)/);
    if (underMatch) {
      const val = parseInt(underMatch[1]);
      const minutes = underMatch[2].startsWith('hour') ? val * 60 : val;
      filter['with_runtime.lte'] = minutes;
      labels.push(`Under ${minutes} mins`);
      remainingQuery = remainingQuery.replace(underMatch[0], "").trim();
    }

    // Year extraction
    const yearMatch = remainingQuery.match(/from (\d{4})s?|in (\d{4})s?|(\d{4})s? movies/);
    if (yearMatch) {
      const yearStr = yearMatch[1] || yearMatch[2] || yearMatch[3];
      if (yearStr.endsWith('0') && remainingQuery.match(new RegExp(`${yearStr}s`))) {
        filter['primary_release_date.gte'] = `${yearStr}-01-01`;
        filter['primary_release_date.lte'] = `${parseInt(yearStr)+9}-12-31`;
        labels.push(`${yearStr}s`);
      } else {
        filter['primary_release_year'] = parseInt(yearStr);
        labels.push(yearStr);
      }
      remainingQuery = remainingQuery.replace(yearMatch[0], "").trim();
    }

    // Rating extraction
    const ratingMatch = remainingQuery.match(/(top rated|imdb|rating) (\d+)\+?/);
    if (ratingMatch) {
      filter['vote_average.gte'] = parseInt(ratingMatch[2]);
      labels.push(`Rating > ${ratingMatch[2]}`);
      remainingQuery = remainingQuery.replace(ratingMatch[0], "").trim();
    }

    // Keyword, Mood, Theme, Situation and Genre Extraction
    let keywords: number[] = [];
    let genres: number[] = [];
    let adult = 'false';

    const extractDict = (dict: Record<string, any>, isSituation: boolean = false) => {
      for (const [key, value] of Object.entries(dict)) {
        if (remainingQuery.includes(key)) {
          labels.push(key);
          if (isSituation) {
            if (value.genres) genres.push(...value.genres);
            if (value.keywords) keywords.push(...value.keywords);
            if (value.adult) adult = value.adult;
          } else if (typeof value === 'object' && Array.isArray(value)) {
            keywords.push(...value);
          } else if (typeof value === 'number') {
            genres.push(value);
          } else if (typeof value === 'string') {
            keywords.push(...value.split('|').map(Number));
          }
          remainingQuery = remainingQuery.replace(key, "").trim();
        }
      }
    };

    extractDict(situationKeywords, true);
    extractDict(themeKeywords);
    extractDict(moodKeywords);
    extractDict(genreMapping);
    extractDict(awardKeywords);
    
    // Deduplicate lists
    keywords = [...new Set(keywords)].filter(v => !isNaN(v));
    genres = [...new Set(genres)];

    if (genres.length > 0) filter['with_genres'] = genres.join(',');
    if (keywords.length > 0) filter['with_keywords'] = keywords.join('|');
    filter['include_adult'] = adult;

    // Remaining text cleanup
    remainingQuery = remainingQuery.replace(/movies?\s*/g, "").replace(/series?\s*/g, "").replace(/with\s*/g, "").replace(/about\s*/g, "").replace(/for\s*/g, "").trim();

    if (Object.keys(filter).length > 1 || (Object.keys(filter).length === 1 && !filter['include_adult'])) {
      return { type: 'discover', filter, remainingQuery, labels };
    }

    return { type: 'multi', query: originalQ };
  };

  const searchWithNLP = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    try {
      setIsLoading(true);
      const intent = parseQueryIntent(searchQuery);
      let rawResults: any[] = [];
      let collectionResults: SearchResult[] = [];
      let personResults: SearchResult[] = [];

      let verbalSummary = "";

      if (intent.type === 'history') {
        verbalSummary = "Finding recommendations based on recent watch history.";
        try {
          const history = JSON.parse(localStorage.getItem('watched_history') || '[]');
          if (history.length > 0) {
            const lastItem = history[0];
            const similarRes = await api.getSimilar(lastItem.type || 'movie', lastItem.id);
            rawResults = similarRes.results.map((r: any) => ({ ...r, media_type: lastItem.type || 'movie' }));
          } else {
            const res = await api.getTrending("movie", "week");
            rawResults = res.results.map((r: any) => ({ ...r, media_type: 'movie' }));
          }
        } catch {
          const res = await api.getTrending("movie", "week");
          rawResults = res.results.map((r: any) => ({ ...r, media_type: 'movie' }));
        }
      } else if (intent.type === 'similar') {
        verbalSummary = `Searching for movies similar to ${intent.title}.`;
        const searchRes = await api.search(intent.title);
        const firstId = searchRes.results[0]?.id;
        if (firstId) {
          const similarRes = await api.getSimilar('movie', firstId);
          rawResults = similarRes.results.map((r: any) => ({ ...r, media_type: 'movie' }));
        }
      } else if (intent.type === 'discover') {
        verbalSummary = `Finding content matching ${intent.labels.join(', ')}.` + (intent.remainingQuery ? ` related to ${intent.remainingQuery}` : "");
        
        const searchParams = new URLSearchParams({ ...intent.filter, 'sort_by': 'popularity.desc' } as any);
        const discoverRes = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ""}&${searchParams}`).then(r => r.json());
        let discoverResults = (discoverRes.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));

        if (intent.remainingQuery.trim().length > 0) {
           const searchRes = await api.search(intent.remainingQuery);
           rawResults = searchRes.results;
        } else {
           rawResults = discoverResults;
        }
      } else if (intent.type === 'nav') {
        verbalSummary = `Taking you to ${intent.label}.`;
        speak(verbalSummary);
        router.push(intent.route);
        setIsSearching(false);
        setShowResults(false);
        setQuery("");
        return [];
      } else if (intent.type === 'identity') {
        verbalSummary = activeProfile 
          ? `You are currently using the ${activeProfile.name} profile.` 
          : "I'm not sure which profile is active right now.";
        speak(verbalSummary);
        toast.info(verbalSummary);
        return [];
      } else if (intent.type === 'play') {
        verbalSummary = `Looking for ${intent.title} to play.`;
        const searchRes = await api.search(intent.title);
        const first = searchRes.results[0] as any;
        if (first) {
          const type = (first.media_type === 'tv' || !first.title) ? 'series' : 'movie';
          const title = first.title || first.name;
          speak(`Starting ${title}.`);
          router.push(`/${type}/${first.id}`);
          setShowResults(false);
          setQuery("");
          return [];
        } else {
          verbalSummary = `I couldn't find ${intent.title} in the library.`;
        }
      } else {
        verbalSummary = `Searching for ${searchQuery}.`;
        const [searchResponse, collectionResponse, personResponse] = await Promise.all([
          api.search(searchQuery),
          fetch(`https://api.themoviedb.org/3/search/collection?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ""}&query=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
          fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY || ""}&query=${encodeURIComponent(searchQuery)}`).then(r => r.json())
        ]);
        rawResults = searchResponse.results;
        
        if (collectionResponse?.results) {
          collectionResults = collectionResponse.results.slice(0, 6).map((c: any) => ({
            id: c.id.toString(), title: c.name, type: "movie" as const,
            poster: c.poster_path ? `https://image.tmdb.org/t/p/w500${c.poster_path}` : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
            backdrop: c.backdrop_path ? `https://image.tmdb.org/t/p/w1280${c.backdrop_path}` : undefined,
            description: "Film Collection / Franchise", year: 0, rating: 0, genres: [], popularity: 100
          }));
        }

        if (personResponse?.results) {
          personResults = (personResponse.results || []).filter((p: any) => !!p.profile_path).map((p: any) => ({
            id: p.id.toString(), title: p.name || "", type: p.known_for_department === 'Directing' ? 'movie' : 'actor',
            isDirector: p.known_for_department === 'Directing',
            poster: `https://image.tmdb.org/t/p/w500${p.profile_path}`,
            year: 0, rating: 0, description: p.known_for_department || "", genres: [], popularity: p.popularity,
            knownFor: p.known_for?.map((kf: any) => kf.title || kf.name).slice(0, 3) || []
          }));
        }
      }

      if (isListening) speak(verbalSummary);

      const movieResults: SearchResult[] = rawResults.filter(item => (item.media_type === 'movie' || 'title' in item)).map(item => ({
        id: item.id.toString(), title: item.title || item.original_title || "Unknown", type: "movie" as const,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
        backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined,
        year: item.release_date ? new Date(item.release_date).getFullYear() : 0,
        rating: item.vote_average || 0, description: item.overview || "", genres: [], trending: (item.popularity || 0) > 40,
        releaseDate: item.release_date, popularity: item.popularity
      }));

      const tvResults: SearchResult[] = rawResults.filter(item => (item.media_type === 'tv' || 'name' in item) && !('title' in item)).map(item => ({
        id: item.id.toString(), title: item.name || item.original_name || "Unknown", type: "series" as const,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500",
        backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined,
        year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : 0,
        rating: item.vote_average || 0, description: item.overview || "", genres: [], trending: (item.popularity || 0) > 40,
        releaseDate: item.first_air_date, popularity: item.popularity
      }));

      const finalResults = [...collectionResults, ...movieResults, ...tvResults, ...personResults]
        .filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.type === v.type)) === i)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      if (finalResults.length === 0 && isListening) {
        speak("I couldn't find any results for that search.");
      } else if (finalResults.length > 0 && isListening) {
        speak(`I've found ${finalResults.length} relevant matches.`);
      }

      return finalResults;
    } catch (error) { return []; } finally { setIsLoading(false); }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim()) {
        const searchResults = await searchWithNLP(searchQuery);
        setResults(searchResults);
      } else { setResults([]); }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setInputWidth(value.length > 0 ? "w-72" : (isFocused ? "w-64" : "w-40"));
    debouncedSearch(value);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on profile
    recognition.lang = activeProfile?.language || 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setQuery(t);
      debouncedSearch(t);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleResultClick = (result: SearchResult) => {
    const route = result.type === 'movie' ? `/movie/${result.id}` : result.type === 'series' ? `/series/${result.id}` : `/actors/${result.title}`;
    router.push(route); setShowResults(false); setQuery("");
  };

  const handleFocus = () => { setIsFocused(true); setShowResults(true); setInputWidth("w-64"); };
  const handleBlur = () => { setTimeout(() => { setIsFocused(false); setIsSearching(false); }, 150); setTimeout(() => setShowResults(false), 200); };
  const closeResults = () => { setShowResults(false); setQuery(""); setResults([]); setInputWidth("w-40"); };

  return (
    <div ref={searchRef} className="relative hidden sm:flex items-center">
      <div className={`flex items-center bg-black/20 backdrop-blur-md border rounded-full px-4 py-2 transition-all duration-300 z-[95] ${isFocused ? "bg-black/40 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105" : "border-white/10"}`}>
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [8, 24, 8],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="w-1 bg-primary rounded-full"
                />
              ))}
            </div>
          </div>
        )}
        <Mic className={`w-5 h-5 transition-colors ${isListening ? 'text-primary animate-pulse' : 'text-white/70'}`} />
        <input ref={inputRef} type="text" placeholder="Search movies, series, actors..." value={query} onChange={handleSearchChange} onFocus={handleFocus} onBlur={handleBlur} className={`bg-transparent outline-none text-white text-sm ml-3 transition-all duration-500 placeholder:text-white/40 ${inputWidth}`} />
        {query.length > 0 && <button onClick={closeResults} className="ml-2 text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>}
        <button onClick={toggleVoiceSearch} className={`ml-2 p-1 rounded-full ${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "text-white/50"}`}>{isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>
      </div>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isListening && !query && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-8">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-8 bg-primary/30 rounded-full blur-3xl" />
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary via-purple-500 to-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                    <Mic className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-3xl font-black text-white tracking-widest animate-pulse">I'm Listening...</h2>
                <p className="text-white/40 max-w-md text-center">Try saying "Movies like Inception" or "Action movies from the 90s"</p>
                <button onClick={() => setIsListening(false)} className="mt-8 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10">Cancel</button>
              </div>
            </motion.div>
          )}

          {showResults && (query.length > 0 || trendingMovies.length > 0) && (
            <motion.div ref={resultsGridRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed top-20 left-0 right-0 bottom-0 z-[1000] overflow-y-auto px-6 pb-20 bg-black/80">
              <div className="max-w-7xl mx-auto py-10">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-12 h-12 text-primary animate-spin mb-4" /><p className="text-white/60">Searching...</p></div>
                ) : (
                  <div className="space-y-16">
                    {query && results.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary"><TrendingUp className="w-6 h-6" /><h2 className="text-2xl font-bold">
                          {globalSearchQuery.toLowerCase().includes('like') ? "Similar Movies" : 
                           globalSearchQuery.startsWith('"') ? "Quote Matches" : "Top Result"}
                        </h2></div>
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          <motion.div onClick={() => handleResultClick(results[0])} className="relative w-full md:w-[45%] aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                            <Image src={results[0].backdrop || results[0].poster} alt={results[0].title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 45vw" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                              <h3 className="text-3xl font-black text-white mb-2">{results[0].title}</h3>
                              <p className="text-white/60 line-clamp-2">{results[0].description}</p>
                            </div>
                          </motion.div>
                          <div className="hidden lg:flex flex-col gap-4 flex-1">
                            {results.slice(1, 4).map((item, index) => (
                              <div key={`sidebar-${item.id}-${index}`} onClick={() => handleResultClick(item)} className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all group">
                                <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0"><Image src={item.poster} alt={item.title} fill className="object-cover" sizes="5rem" /></div>
                                <div><h4 className="font-bold text-white group-hover:text-primary transition-colors">{item.title}</h4><p className="text-white/40 text-xs">{item.type.toUpperCase()} • {item.year}</p></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                    
                    {query && results.filter(r => r.description === "Film Collection / Franchise").length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary/80"><Film className="w-6 h-6" /><h2 className="text-2xl font-bold text-white">Collections</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{results.filter(r => r.description === "Film Collection / Franchise").map((r, i) => <ResultCard key={`collection-${r.id}`} result={r} index={i} onClick={() => handleResultClick(r)} />)}</div>
                      </section>
                    )}

                    {((query ? results.filter(r => r.type === 'movie' && !r.isDirector && r.description !== "Film Collection / Franchise").filter(r => r.id !== results[0]?.id) : trendingMovies)).length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary/80"><Film className="w-6 h-6" /><h2 className="text-2xl font-bold text-white">{query ? "Movies" : "Trending Movies"}</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{(query ? results.filter(r => r.type === 'movie' && !r.isDirector && r.description !== "Film Collection / Franchise").filter(r => r.id !== results[0]?.id) : trendingMovies).map((r, i) => <ResultCard key={`movie-${r.id}-${i}`} result={r} index={i} onClick={() => handleResultClick(r)} />)}</div>
                      </section>
                    )}

                    {((query ? results.filter(r => r.type === 'series').filter(r => r.id !== results[0]?.id) : trendingTV)).length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary/80"><Tv className="w-6 h-6" /><h2 className="text-2xl font-bold text-white">{query ? "Series" : "Trending Series"}</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{(query ? results.filter(r => r.type === 'series').filter(r => r.id !== results[0]?.id) : trendingTV).map((r, i) => <ResultCard key={`series-${r.id}-${i}`} result={r} index={i} onClick={() => handleResultClick(r)} />)}</div>
                      </section>
                    )}

                    {query && results.filter(r => r.isDirector).length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary/80"><User className="w-6 h-6" /><h2 className="text-2xl font-bold text-white">Directors</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{results.filter(r => r.isDirector).map((r, i) => <ResultCard key={`director-${r.id}-${i}`} result={r} index={i} onClick={() => handleResultClick(r)} />)}</div>
                      </section>
                    )}

                    {query && results.filter(r => r.type === 'actor' && !r.isDirector).length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-6 text-primary/80"><User className="w-6 h-6" /><h2 className="text-2xl font-bold text-white">Actors</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">{results.filter(r => r.type === 'actor' && !r.isDirector).map((r, i) => <ResultCard key={`actor-${r.id}-${i}`} result={r} index={i} onClick={() => handleResultClick(r)} />)}</div>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default SmartSearch;
