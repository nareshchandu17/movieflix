import MoodProfile from "@/models/MoodProfile";
import WatchHistory from "@/models/WatchHistory";
import { getGeminiService } from "./geminiService";

export interface MoodVector {
  intensityScore: number;
  cryProbability: number;
  hopeIndex: number;
  laughDensity: number;
  toneRequirement?: string;
}

/**
 * Calculates cosine similarity between two numeric vectors
 */
function calculateSimilarity(v1: number[], v2: number[]): number {
  const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
}

/**
 * Core engine for matching mood to movies
 */
export async function matchMoodToMovies(
  userId: string,
  userPrompt: string,
  options: {
    intensity?: number;
    runtime?: number;
    familiarity?: 'new' | 'familiar' | 'any';
  } = {}
) {
  const gemini = getGeminiService();
  
  // 1. Extract mood vector from prompt
  const moodIntent = await gemini.extractMoodIntent(userPrompt);
  
  // Override with manual sliders if provided
  const targetVector = [
    options.intensity || moodIntent.intensityScore,
    moodIntent.cryProbability,
    moodIntent.hopeIndex,
    moodIntent.laughDensity
  ];

  // 2. Fetch all mood profiles
  const profiles = await MoodProfile.find().lean();
  
  // 3. Apply Filters
  // Recency filter: Get last 30 days of watch history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentHistory = await WatchHistory.find({
    userId,
    lastWatched: { $gte: thirtyDaysAgo }
  }).select('contentId').lean();
  
  const watchedRecentlyIds = new Set(recentHistory.map(h => h.contentId));

  // 4. Calculate scores and rank
  const allMatches = profiles
    .map((profile: {
      intensityScore: number;
      cryProbability: number;
      hopeIndex: number;
      laughDensity: number;
      tone: string;
      contentId: string;
      language: string;
    }) => {
      const profileVector: number[] = [
        profile.intensityScore,
        profile.cryProbability,
        profile.hopeIndex,
        profile.laughDensity
      ];
      
      let score = calculateSimilarity(targetVector, profileVector);
      
      // Weight tone requirement
      if (moodIntent.toneRequirement && profile.tone === moodIntent.toneRequirement) {
        score += 0.2;
      }

      // Deprioritize recently watched
      if (watchedRecentlyIds.has(profile.contentId)) {
        score -= 0.5;
      }
      
      // Familiarity filter
      if (options.familiarity === 'new' && watchedRecentlyIds.has(profile.contentId)) {
        score = -1;
      }

      return {
        ...profile,
        similarityScore: score
      };
    })
    .filter(m => m.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore);

  // 5. Apply Language Weighting (60% Tollywood/Telugu, 40% Others)
  const teluguMatches = allMatches.filter(m => m.language === 'te');
  const otherMatches = allMatches.filter(m => m.language !== 'te');

  // Take top 3 Telugu and top 2 Others
  const weightedMatches = [
    ...teluguMatches.slice(0, 3),
    ...otherMatches.slice(0, 2)
  ];

  // If we don't have enough in one bucket, fill with remaining from allMatches
  if (weightedMatches.length < 5) {
    const combinedIds = new Set(weightedMatches.map(m => m.contentId));
    const fillNeeded = 5 - weightedMatches.length;
    const remainingMatches = allMatches
      .filter(m => !combinedIds.has(m.contentId))
      .slice(0, fillNeeded);
    
    weightedMatches.push(...remainingMatches);
  }

  // Sort again by similarity among the selected top 5
  const finalMatches = weightedMatches.sort((a, b) => b.similarityScore - a.similarityScore);

  // 6. Generate explanations for top matches
  const resultsWithExplanations = await Promise.all(
    finalMatches.map(async (match) => {
      const explanation = await gemini.generateMoodExplanation(match.contentId, userPrompt);
      return {
        ...match,
        explanation
      };
    })
  );

  return resultsWithExplanations;
}
