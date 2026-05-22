/**
 * @file clients.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { api as tmdb } from "@/lib/api";
import { geminiSearch } from "@/lib/geminiService";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

export const GatewayClients = {
  tmdb,
  
  gemini: {
    search: async (query: string) => {
      try {
        const result = await geminiSearch(query);
        return result;
      } catch (error) {
        console.error("[Gemini Client] Error:", error);
        return null;
      }
    }
  },

  youtube: {
    getTrailer: async (query: string) => {
      if (!YOUTUBE_API_KEY) return null;
      
      const params = new URLSearchParams({
        part: "snippet",
        maxResults: "1",
        q: `${query} trailer`,
        type: "video",
        key: YOUTUBE_API_KEY,
      });

      try {
        const response = await fetch(`${YOUTUBE_BASE_URL}/search?${params}`, {
          next: { revalidate: 86400 }, // Cache trailers for 24 hrs
        });
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          return {
            videoId: data.items[0].id.videoId,
            title: data.items[0].snippet.title,
            thumbnail: data.items[0].snippet.thumbnails.high.url,
          };
        }
        return null;
      } catch (error) {
        console.error("[YouTube Client] Error:", error);
        return null;
      }
    }
  }
};
