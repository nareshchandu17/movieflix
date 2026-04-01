import ContentSegment from "@/models/ContentSegment";
import NarrativeSnapshot from "@/models/NarrativeSnapshot";
import { getGeminiService } from "./geminiService";

export interface CatchUpRequest {
  contentId: string;
  contentType: "Movie" | "Series";
  skippedFrom: { episodeId?: string; timestamp: number };
  skippedTo: { episodeId?: string; timestamp: number };
}

/**
 * Core engine for generating spoiler-safe summaries
 */
export async function getSkipSafeSummary(request: CatchUpRequest) {
  const gemini = getGeminiService();

  // 1. Identify all skipped segments
  // This logic handles intra-episode skips and multi-episode skips
  const query: any = {
    contentId: request.contentId,
  };

  if (request.contentType === "Series") {
    // Complex query for episode ranges would go here
    // For simplicity, we filter by episodeId if provided
    if (request.skippedFrom.episodeId === request.skippedTo.episodeId) {
      query.episodeId = request.skippedFrom.episodeId;
      query.startTime = { $gte: request.skippedFrom.timestamp, $lte: request.skippedTo.timestamp };
    }
  } else {
    query.startTime = { $gte: request.skippedFrom.timestamp, $lte: request.skippedTo.timestamp };
  }

  const skippedSegments = await ContentSegment.find(query).sort({ startTime: 1 }).lean();
  
  if (skippedSegments.length === 0) {
    return {
      success: false,
      message: "No narrative segments found in the skipped window."
    };
  }

  // 2. Identify future spoilers to avoid
  // Facts from segments starting AFTER request.skippedTo.timestamp
  const futureQuery = {
    contentId: request.contentId,
    startTime: { $gt: request.skippedTo.timestamp }
  };
  const futureSegments = await ContentSegment.find(futureQuery).lean();
  const futureSpoilers = futureSegments.flatMap(s => s.factsIntroduced.map(f => f.fact));

  // 3. Extract facts from skipped segments
  const skippedFacts = skippedSegments.flatMap(s => s.factsIntroduced.map(f => f.fact));

  // 4. Generate summaries in 3 formats
  const [short, medium, long] = await Promise.all([
    gemini.generateCatchUpSummary(skippedFacts, futureSpoilers, "short"),
    gemini.generateCatchUpSummary(skippedFacts, futureSpoilers, "medium"),
    gemini.generateCatchUpSummary(skippedFacts, futureSpoilers, "long")
  ]);

  // 5. Get最新的 character state snapshot
  const snapshot = await NarrativeSnapshot.findOne({
    contentId: request.contentId,
    // Add logic to get the snapshot closest to the resume point
  }).sort({ createdAt: -1 }).lean();

  return {
    success: true,
    formats: { short, medium, long },
    characterSnapshot: snapshot?.characterStates || [],
    timeline: skippedSegments.map(s => ({
      time: s.startTime,
      type: s.type,
      summary: s.summary
    }))
  };
}
