import { Clip } from "./types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Parse ISO 8601 duration (PT1H2M34S) to human-readable format
 */
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format view count to human-readable (e.g., 1.2M, 340K)
 */
function formatViews(count: string): string {
  const num = parseInt(count);
  if (isNaN(num)) return "0";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Search YouTube for clips matching a query
 */
export async function searchYouTubeClips(
  query: string,
  maxResults: number = 20
): Promise<Clip[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY not set — returning empty results");
    return [];
  }

  const searchParams = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: maxResults.toString(),
    videoEmbeddable: "true",
    videoDuration: "short",
    q: query,
    key: apiKey,
  });

  const url = `${YOUTUBE_API_BASE}/search?${searchParams.toString()}`;

  const searchRes = await fetch(url, {
    headers: {
      "Referer": process.env.APP_URL || "http://localhost:3000",
    }
  });
  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    console.error("YouTube search failed:", searchRes.status, errorText);
    return [];
  }

  const searchData = await searchRes.json();
  const items = searchData.items || [];
  if (items.length === 0) return [];

  // Extract video IDs
  const videoIds = items.map((item: { id: { videoId: string } }) => item.id.videoId);

  // Fetch video details (duration, stats)
  const details = await getVideoDetails(videoIds, apiKey);

  // Merge search results with details
  return items.map((item: {
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
    };
  }) => {
    const videoId = item.id.videoId;
    const detail = details.get(videoId);

    return {
      id: videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url ||
                 item.snippet.thumbnails?.medium?.url ||
                 `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: detail?.duration || "0:00",
      views: detail?.views || "0",
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    } satisfies Clip;
  });
}

interface VideoDetail {
  duration: string;
  views: string;
}

/**
 * Fetch video details (duration, view count) for a list of video IDs
 */
async function getVideoDetails(
  ids: string[],
  apiKey: string
): Promise<Map<string, VideoDetail>> {
  const result = new Map<string, VideoDetail>();
  if (ids.length === 0) return result;

  const params = new URLSearchParams({
    part: "contentDetails,statistics",
    id: ids.join(","),
    key: apiKey,
  });

  const res = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`, {
    headers: {
      "Referer": process.env.APP_URL || "http://localhost:3000",
    }
  });
  if (!res.ok) {
    console.error("YouTube videos API failed:", res.status);
    return result;
  }

  const data = await res.json();
  for (const item of data.items || []) {
    result.set(item.id, {
      duration: parseDuration(item.contentDetails?.duration || ""),
      views: formatViews(item.statistics?.viewCount || "0"),
    });
  }

  return result;
}
