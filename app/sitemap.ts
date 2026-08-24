import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://movieflix-nareshchandu.vercel.app';

  // Base static routes
  const routes = [
    '',
    '/search',
    '/pricing',
    '/watch-party',
    '/my-list',
    '/taste-dna'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In a full production app, you would also fetch dynamic routes here
  // (e.g., top 100 movies: `/movie/${id}`) and map them to sitemap entries.
  
  return routes;
}
