import type { Movie, MovieSection, AISuggestion, FilterChip } from '../types';

export const continueWatching: Movie[] = [
  {
    id: '1',
    title: 'Dark City',
    poster: '/dark-city.jpg',
    rating: 8.2,
    runtime: '2h 15m',
    genres: ['Thriller', 'Sci-Fi'],
    year: 2024,
    progress: 65,
    episodeInfo: 'Ep 5 - 23m left',
  },
  {
    id: '2',
    title: 'The Heist',
    poster: '/the-heist.jpg',
    rating: 7.8,
    runtime: '2h 05m',
    genres: ['Action', 'Crime'],
    year: 2024,
    progress: 30,
    episodeInfo: '1h 10m left',
  },
  {
    id: '3',
    title: 'Fantasy Quest',
    poster: '/fantasy-quest.jpg',
    rating: 8.5,
    runtime: '2h 30m',
    genres: ['Fantasy', 'Adventure'],
    year: 2023,
    progress: 80,
    episodeInfo: 'Season 2 - Ep 4',
  },
  {
    id: '4',
    title: 'Comedy Night',
    poster: '/comedy-night.jpg',
    rating: 7.5,
    runtime: '1h 30m',
    genres: ['Comedy'],
    year: 2024,
    progress: 45,
    episodeInfo: '20m left',
  },
  {
    id: '5',
    title: 'The Untold Shadows',
    poster: '/woman-drama.jpg',
    rating: 8.7,
    runtime: '2h 20m',
    genres: ['Drama', 'Mystery'],
    year: 2024,
    progress: 20,
    episodeInfo: 'Ep 3 - 45m left',
  },
];

export const watchTonight: Movie[] = [
  {
    id: '6',
    title: 'Midnight Escape',
    poster: '/midnight-escape.jpg',
    rating: 7.9,
    runtime: '1h 45m',
    genres: ['Action', 'Thriller'],
    year: 2024,
  },
  {
    id: '7',
    title: 'The Resort',
    poster: '/the-resort.jpg',
    rating: 8.1,
    runtime: '1h 30m',
    genres: ['Mystery', 'Drama'],
    year: 2024,
  },
  {
    id: '8',
    title: 'The Negotiator',
    poster: '/the-negotiator.jpg',
    rating: 8.3,
    runtime: '1h 35m',
    genres: ['Crime', 'Thriller'],
    year: 2023,
  },
  {
    id: '9',
    title: "Damnation's Due",
    poster: '/the-boys.jpg',
    rating: 8.8,
    runtime: '1h 55m',
    genres: ['Action', 'Superhero'],
    year: 2024,
  },
];

export const bingeWorthy: Movie[] = [
  {
    id: '10',
    title: 'Space Frontier',
    poster: '/space-frontier.jpg',
    rating: 9.0,
    runtime: '45m per ep',
    genres: ['Sci-Fi', 'Drama'],
    year: 2024,
    episodeInfo: '3 Episodes Left',
  },
  {
    id: '11',
    title: 'World of Aethel',
    poster: '/lush-landing.jpg',
    rating: 8.6,
    runtime: '50m per ep',
    genres: ['Fantasy', 'Adventure'],
    year: 2023,
    episodeInfo: 'Season 3 - Continue',
  },
  {
    id: '12',
    title: 'The Silent City',
    poster: '/crime-files.jpg',
    rating: 8.4,
    runtime: '55m per ep',
    genres: ['Crime', 'Mystery'],
    year: 2024,
    episodeInfo: '4 Unwatched',
  },
];

export const expiringSoon: Movie[] = [
  {
    id: '13',
    title: 'Desert Storm',
    poster: '/desert-chase.jpg',
    rating: 7.7,
    runtime: '2h 10m',
    genres: ['Action', 'Adventure'],
    year: 2022,
    expiryInfo: 'Leaving in 4 Days',
  },
  {
    id: '14',
    title: 'Ancient Odyssey',
    poster: '/ancient-secrets.jpg',
    rating: 8.0,
    runtime: '2h 25m',
    genres: ['Adventure', 'History'],
    year: 2021,
    expiryInfo: 'Leaving in 2 Days',
  },
  {
    id: '15',
    title: 'Mayhem Manor',
    poster: '/laugh-out-loud.jpg',
    rating: 7.4,
    runtime: '1h 40m',
    genres: ['Comedy'],
    year: 2023,
    expiryInfo: 'Leaving Tomorrow',
  },
  {
    id: '16',
    title: 'Whispers & Echoes',
    poster: '/intimate-drama.jpg',
    rating: 8.2,
    runtime: '1h 55m',
    genres: ['Drama', 'Romance'],
    year: 2023,
    expiryInfo: 'Leaving in 3 Days',
  },
];

export const movieSections: MovieSection[] = [
  {
    id: 'continue-watching',
    title: 'Continue Watching',
    movies: continueWatching,
  },
  {
    id: 'watch-tonight',
    title: 'Watch Tonight (Under 2 Hours)',
    movies: watchTonight,
  },
  {
    id: 'binge-worthy',
    title: 'Binge-Worthy Series',
    movies: bingeWorthy,
  },
  {
    id: 'expiring-soon',
    title: 'Expiring Soon: Last Chance!',
    movies: expiringSoon,
  },
];

export const aiSuggestion: AISuggestion = {
  movie: {
    id: 'ai-1',
    title: 'The Silent Witness',
    poster: '/silent-witness.jpg',
    rating: 8.4,
    runtime: '2h 05m',
    genres: ['Thriller', 'Mystery'],
    year: 2024,
  },
  explanation: "In the mood for a thriller? Try watching 'The Silent Witness' next.",
  moods: [
    { emoji: '😌', label: 'Chill' },
    { emoji: '�', label: 'Thriller' },
  ],
};

export const filterChips: FilterChip[] = [
  { id: '1', label: 'Chill', icon: '😊', active: true },
  { id: '2', label: 'Thriller', icon: '🔍', active: false },
  { id: '3', label: 'Emotional', icon: '😭', active: false },
  { id: '4', label: 'Time: 1 Hour', icon: '⏱️', active: false },
  { id: '5', label: 'Filters', icon: '⚙️', active: false },
];
