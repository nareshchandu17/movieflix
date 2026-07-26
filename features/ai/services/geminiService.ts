/**
 * @file geminiService.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

/**
 * Gemini AI Service for Movie & Series Insights
 * Clean, streamlined implementation using Gemini API
 */

import { GoogleGenAI } from "@google/genai";
import { getLogger } from "@/lib/logger";

interface MovieData {
  title?: string;
  name?: string; // For TV series
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  vote_average?: number;
  id?: number;
  director?: string;
  cast?: string[];
  runtime?: number;
  genres?: { id?: number; name: string }[];
  production_companies?: { name: string }[];
  original_language?: string;
  // TV-specific fields
  created_by?: { name: string }[];
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  networks?: { name: string }[];
}

interface AIFactsResponse {
  facts: string[];
  success: boolean;
  error?: string;
}

interface AISuggestionResponse {
  suggestion: {
    title: string;
    year: string;
    type: "movie" | "series";
    overview: string;
    reason: string;
    searchKeyword: string;
  };
  success: boolean;
  error?: string;
}

class GeminiService {
  private ai: GoogleGenAI;
  private logger = getLogger();
  private readonly MODEL_NAME = "gemini-1.5-flash";

  constructor(apiKey?: string) {
    if (!apiKey?.trim()) {
      this.logger.warn("Gemini API key missing. Operating in SIMULATED mode.");
      this.ai = null as any; // We'll handle null checks in methods
    } else {
      this.ai = new GoogleGenAI({ apiKey });
      this.logger.info("GeminiService initialized successfully");
    }
  }

  private isSimulated(): boolean {
    return !this.ai;
  }

  /**
   * Creates prompt for generating movie/series facts
   */
  private createMoviePrompt(data: MovieData): string {
    const isTV = !!data.name;
    const title = isTV ? data.name : data.title;
    const releaseYear = isTV
      ? data.first_air_date ? new Date(data.first_air_date).getFullYear() : "Unknown"
      : data.release_date ? new Date(data.release_date).getFullYear() : "Unknown";

    return `You are an expert cinematic researcher with deep knowledge of movies and TV shows.

GOAL: Generate Top 10 most exciting and factual information about "${title}" (${releaseYear}) - a ${isTV ? "TV Series" : "Movie"}.

IMPORTANT: Use only your training data knowledge. Focus on well-known, verifiable facts that would be commonly reported.

Basic Info:
- Overview: ${data.overview || "Not available"}
- Language: ${data.original_language || "en"}
- Genres: ${data.genres?.map(g => g.name).join(", ") || "various"}
- Runtime: ${data.runtime ? `${data.runtime} minutes` : "not specified"}
${data.production_companies?.length ? `- Producers: ${data.production_companies.map(pc => pc.name).join(", ")}` : ""}
${isTV && data.created_by?.length ? `- Creators: ${data.created_by.map(c => c.name).join(", ")}` : ""}
${isTV && data.networks?.length ? `- Networks: ${data.networks.map(n => n.name).join(", ")}` : ""}
${isTV && data.number_of_seasons ? `- Seasons: ${data.number_of_seasons}, Episodes: ${data.number_of_episodes}` : ""}

Requirements:
1. Focus on widely-known, well-documented facts from your training data
2. Format as compelling, single-paragraph facts
3. Include box office/streaming performance if available
4. Cover production stories, cast details, awards, controversies
5. Make each fact attention-grabbing and viral-worthy
6. Ensure accuracy - only include information you're confident about

Return exactly 10 facts as JSON array:
["Exciting fact 1", "Exciting fact 2", ...]

Return ONLY the JSON array, no other text.`;
  }

  /**
   * Creates prompt for generating movie/series suggestions
   */
  private createSuggestionPrompt(): string {
    return `You are a film curator recommending hidden gems and underrated titles.

Recommend one exceptional movie or TV series that deserves more recognition.

Focus on:
- Hidden gems and cult classics
- International and independent films
- Critically acclaimed but overlooked titles

Return as JSON:
{
  "title": "Exact title",
  "year": "Release year",
  "type": "movie or series",
  "overview": "2-3 sentence plot summary",
  "reason": "Why this is worth watching",
  "searchKeyword": "Best search term"
}

Return ONLY the JSON object, no other text.`;
  }

  /**
   * Parses JSON response with fallback
   */
  private parseFactsResponse(responseText: string): string[] {
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const facts = JSON.parse(cleanedText);
      if (Array.isArray(facts) && facts.length > 0) {
        return facts
          .filter((fact) => typeof fact === "string" && fact.trim().length > 10)
          .slice(0, 10);
      }
    } catch {
      // Fallback: extract from text
      return responseText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 20 && !line.startsWith("{") && !line.startsWith("["))
        .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-*•]\s*/, "").trim())
        .slice(0, 10);
    }

    return [];
  }

  /**
   * Parses suggestion response
   */
  private parseSuggestionResponse(responseText: string) {
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const suggestion = JSON.parse(cleanedText);

    if (!suggestion?.title || !suggestion?.year || !suggestion?.type ||
      !suggestion?.overview || !suggestion?.reason || !suggestion?.searchKeyword) {
      throw new Error("Invalid suggestion format");
    }

    if (suggestion.type !== "movie" && suggestion.type !== "series") {
      throw new Error("Invalid suggestion type");
    }

    return {
      title: suggestion.title.trim(),
      year: suggestion.year.toString(),
      type: suggestion.type,
      overview: suggestion.overview.trim(),
      reason: suggestion.reason.trim(),
      searchKeyword: suggestion.searchKeyword.trim(),
    };
  }

  /**
   * Handles API errors
   */
  private handleError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("api key") || message.includes("authentication")) {
      return "AI service authentication failed. Please check configuration.";
    }
    if (message.includes("quota") || message.includes("rate limit")) {
      return "AI service rate limit exceeded. Please try again later.";
    }
    if (message.includes("blocked") || message.includes("safety")) {
      return "Content was blocked by safety filters. Please try again.";
    }

    return error.message;
  }

  /**
   * Generates AI-powered movie/series suggestion
   */
  async generateSuggestion(): Promise<AISuggestionResponse> {
    try {
      this.logger.info("Generating AI suggestion");

      if (this.isSimulated()) {
        await new Promise(r => setTimeout(r, 1000));
        return {
          suggestion: {
            title: "Inception",
            year: "2010",
            type: "movie",
            overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
            reason: "A masterpiece of psychological architecture that rewards multiple viewings.",
            searchKeyword: "Inception Christopher Nolan"
          },
          success: true
        };
      }

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: this.createSuggestionPrompt(),
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      const suggestion = this.parseSuggestionResponse(response.text);

      this.logger.info("Successfully generated AI suggestion", {
        title: suggestion.title,
        type: suggestion.type,
      });

      return { suggestion, success: true };
    } catch (error) {
      const errorMessage = this.handleError(error as Error);
      this.logger.warn("Live Gemini API call failed or rate-limited for suggestion. Using fallback suggestion.", { error: errorMessage });

      return {
        suggestion: {
          title: "Inception",
          year: "2010",
          type: "movie",
          overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          reason: "A masterpiece of psychological architecture that rewards multiple viewings.",
          searchKeyword: "Inception Christopher Nolan"
        },
        success: true,
        error: errorMessage,
      };
    }
  }

  private getSimulatedFacts(title: string): string[] {
    const safeTitle = title || "The production";
    return [
      `${safeTitle} was a groundbreaking production that redefined its genre with innovative storytelling.`,
      "The production faced numerous challenges during filming, including extreme weather conditions.",
      "The lead actors underwent intensive training for several months to prepare for their roles.",
      "The musical score was composed to perfectly mirror the emotional beats of the narrative.",
      "Critics praised the cinematography for its unique visual language and lighting techniques.",
      "The script went through over a dozen revisions before the final version was approved.",
      "Several scenes were filmed on location to ground the fantastical elements in reality.",
      "The series/movie has gained a significant cult following since its initial release.",
      "Production designers created hundreds of custom props to build the world's immersive atmosphere.",
      "The director utilized experimental camera rigs to capture the most intense action sequences."
    ];
  }

  /**
   * Generates AI-powered facts using Gemini API
   */
  async generateFacts(data: MovieData): Promise<AIFactsResponse> {
    const title = data.name || data.title || "Unknown Title";
    try {
      this.logger.info("Generating AI facts", { title });

      if (this.isSimulated()) {
        await new Promise(r => setTimeout(r, 800));
        return {
          facts: this.getSimulatedFacts(title),
          success: true
        };
      }

      const prompt = this.createMoviePrompt(data);

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      const facts = this.parseFactsResponse(response.text);

      if (facts.length === 0) {
        throw new Error("No valid facts extracted from AI response");
      }

      this.logger.info("Successfully generated AI facts", {
        title,
        factsCount: facts.length,
      });

      return { facts, success: true };
    } catch (error) {
      const errorMessage = this.handleError(error as Error);
      this.logger.warn("Live Gemini API call failed or rate-limited for facts. Using fallback facts.", { error: errorMessage, title });

      return {
        facts: this.getSimulatedFacts(title),
        success: true,
        error: errorMessage,
      };
    }
  }

  // Mood extraction and explanation methods have been removed.
  /**
   * Generates a spoiler-aware catch-up summary
   */
  async generateCatchUpSummary(
    skippedFacts: string[],
    futureSpoilers: string[],
    targetLength: "short" | "medium" | "long"
  ): Promise<string> {
    try {
      this.logger.info("Generating catch-up summary", { factsCount: skippedFacts.length });

      if (this.isSimulated()) {
        return `Based on the ${skippedFacts.length} key moments you missed, the narrative has shifted significantly. Characters have reached critical turning points, setting the stage for the intense episodes ahead.`;
      }

      const lengthGuidance = {
        short: "max 40 words, very concise",
        medium: "max 120 words, detailed but balanced",
        long: "up to 300 words, comprehensive breakdown"
      }[targetLength];

      const prompt = `You are a professional narrative curator. 
      
      TASK: Generate a ${targetLength} catch-up summary for a user based on these events they missed:
      SKIPPED EVENTS:
      ${skippedFacts.map(f => `- ${f}`).join("\n")}
      
      STRICT SPOILER PROTECTION: 
      Do NOT mention, reference, or hint at ANY of the following future events/spoilers:
      ${futureSpoilers.map(s => `- ${s}`).join("\n")}
      
      REQUIREMENTS:
      1. Length: ${lengthGuidance}.
      2. Tone: Cinematic, engaging, and clear.
      3. Focus on plot-critical character shifts and information reveals.
      4. Ensure the summary serves as a perfect bridge to the next scene.
      
      Return ONLY the summary text, no other formatting.`;

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      return response.text?.trim() || "Information successfully processed. You're ready to continue.";
    } catch (error) {
      this.logger.error("Error generating catch-up summary", { error: (error as Error).message });
      return "Briefly: Key plot developments occurred involving main characters. You are now up to date.";
    }
  }

  /**
   * Analyzes a character's arc based on their logs
   */
  async analyzeCharacterArc(
    name: string,
    logs: unknown[],
    inflectionPoints: unknown[]
  ): Promise<{ dna: string; summary: string; evolutionTags: string[] }> {
    try {
      this.logger.info("Analyzing character arc", { name });

      if (this.isSimulated()) {
        return {
          dna: "A resilient spirit forged in conflict.",
          summary: `The journey of ${name} is a testament to the human capacity for change. From their opening moments to their current state, they've navigated complex moral landscapes and faced internal demons that have fundamentally reshaped their identity.`,
          evolutionTags: ["Resilience", "Transformation", "Hidden Depths"]
        };
      }

      const prompt = `You are a professional literary analyst and screenwriter.
      
      TASK: Analyze the narrative arc of the character "${name}" based on these logs:
      LOGS:
      ${JSON.stringify(logs.map((l: any) => ({
        time: l.timestamp,
        emotion: l.emotionalState,
        alignment: l.moralAlignment,
        motivation: l.motivation
      })))}
      
      INFLECTION POINTS:
      ${JSON.stringify(inflectionPoints.map((p: any) => ({
        type: p.type,
        catalyst: p.catalyst,
        description: p.description
      })))}
      
      REQUIREMENTS:
      1. DNA: A concise, poetic "DNA" summary (max 20 words) representing their core essence.
      2. Summary: A detailed breakdown (max 200 words) of their journey and final state.
      3. Evolution Tags: 3-5 tags describing their path (e.g., "From Nihilism to Sacrifice").
      
      Return as a JSON object with keys: "dna", "summary", "evolutionTags".`;

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      const text = response.text?.trim() || "{}";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      this.logger.error("Error analyzing character arc", { error: (error as Error).message });
      return {
        dna: "A complex soul shaped by circumstance.",
        summary: "The character's journey is defined by significant shifts in motivation and morality.",
        evolutionTags: ["Undetermined"]
      };
    }
  }

  /**
   * Helper to return structured simulated/fallback series insights
   */
  private getSimulatedSeriesInsights(title: string): Array<{
    id: number;
    title: string;
    header: string;
    content: string;
    benefit: string;
  }> {
    const safeTitle = title || "Series";
    return [
      {
        id: 0,
        title: "Narrative Style",
        header: "1️⃣ Narrative Style Analysis",
        content: `"${safeTitle}" utilizes a non-linear storytelling approach that masterfully weaves together multiple character perspectives, creating a rich tapestry of interwoven plotlines.`,
        benefit: "Watch for subtle callbacks that reward attentive viewers."
      },
      {
        id: 1,
        title: "Viewer Experience",
        header: "2️⃣ Viewer Experience Prediction",
        content: "Audiences can expect a highly emotional journey that balances intense dramatic shifts with moments of profound character introspection and growth.",
        benefit: "Best watched in a focused environment to catch emotional nuances."
      },
      {
        id: 2,
        title: "Engagement Patterns",
        header: "3️⃣ Engagement & Retention",
        content: "The show employs an effective 'slow-burn' mystery format, utilizing strategic cliffhangers at internal season midpoints to maintain high engagement.",
        benefit: "Perfect for binge-watching due to its addictive narrative momentum."
      },
      {
        id: 3,
        title: "Social Impact",
        header: "4️⃣ Cultural & Social Impact",
        content: "By exploring themes of morality and societal structure, the series has sparked significant online discussion and critical analysis of its core themes.",
        benefit: "Join the conversation to discover deeper layers of social commentary."
      },
      {
        id: 4,
        title: "Series Trivia",
        header: "5️⃣ Series Trivia & Lore",
        content: "The production team spent over two years in pre-production to ensure every visual element correctly reflected the show's unique world-building requirements.",
        benefit: "Pay attention to the background details for hidden lore clues."
      }
    ];
  }

  /**
   * Generates structured AI insights for series
   */
  async generateSeriesInsights(data: MovieData): Promise<{
    insights: Array<{
      id: number;
      title: string;
      header: string;
      content: string;
      benefit: string;
    }>;
    success: boolean;
    error?: string;
  }> {
    const title = data.name || data.title || "Series";
    try {
      this.logger.info("Generating AI series insights", { title });

      if (this.isSimulated()) {
        await new Promise(r => setTimeout(r, 800));
        return {
          insights: this.getSimulatedSeriesInsights(title),
          success: true
        };
      }

      const prompt = `You are a professional TV critic and narrative analyst.
      
      GOAL: Generate 5 deep, professional insights about the TV series "${title}".
      
      Categories required:
      1. Narrative Style Analysis: Focus on pacing, character development, and storytelling structure.
      2. Viewer Experience Prediction: Who is the target audience and what emotional journey should they expect?
      3. Engagement & Retention Patterns: What keeps viewers hooked (cliffhangers, slow-burn mysteries, etc.)?
      4. Cultural & Social Impact: How does the show reflect or impact modern culture/society?
      5. Series Trivia & Lore: A fascinating production fact or deep lore detail.

      Format Requirement:
      Return a JSON array of 5 objects. Each object must have:
      - "id": number (0 to 4)
      - "title": Short category name (e.g. "Narrative Style")
      - "header": Full numbered title (e.g. "1️⃣ Narrative Style Analysis")
      - "content": 2-3 sentences of deep, factual analysis based on your training data.
      - "benefit": A "Why this works" or "Pro Tip" sentence (max 15 words) for the viewer.

      Return ONLY the JSON array, no other text.`;

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      // Robust JSON extraction
      let cleanedText = response.text.trim();
      const jsonMatch = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      } else {
        // Fallback: manually strip typical markdown
        cleanedText = cleanedText
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
      }

      const insights = JSON.parse(cleanedText);

      if (!Array.isArray(insights)) {
        throw new Error("AI response is not an array");
      }

      return { insights: insights.slice(0, 5), success: true };
    } catch (error) {
      const errorMessage = this.handleError(error as Error);
      this.logger.warn("Live Gemini API call failed or rate-limited for series insights. Using structured fallback insights.", {
        error: errorMessage,
        title
      });
      return {
        insights: this.getSimulatedSeriesInsights(title),
        success: true,
        error: errorMessage
      };
    }
  }

  /**
   * Generates a comprehensive Taste DNA profile based on watch history
   */
  async generateTasteDNA(profileName: string, watchHistory: unknown[]): Promise<{
    persona: string;
    summary: string;
    traits: string[];
    personality: string;
    moodDistribution: Array<{ label: string; value: number }>;
    evolution: {
      period: string;
      changes: Array<{ label: string; change: number }>;
    };
    genres: Record<string, number>;
    recommendations: string[];
  }> {
    try {
      this.logger.info("Generating Taste DNA", { profileName, historyCount: watchHistory.length });

      if (this.isSimulated() || watchHistory.length === 0) {
        // High-quality fallback for empty or simulation
        return {
          persona: "The Cinematic Voyager",
          summary: "You are just beginning your journey through the world of film. Your tastes are diverse, showing an early interest in compelling narratives and high-stakes drama.",
          traits: ["Curious Observer", "Genre Explorer", "Narrative Seeker"],
          personality: "The Open-Minded Scout",
          moodDistribution: [
            { label: "Excitement", value: 40 },
            { label: "Drama", value: 30 },
            { label: "Wonder", value: 20 },
            { label: "Mystery", value: 10 }
          ],
          evolution: {
            period: "Last 30 days",
            changes: [
              { label: "Adventure", change: 15 },
              { label: "Comedy", change: -5 }
            ]
          },
          genres: { "Action": 5, "Drama": 3 },
          recommendations: ["Inception", "The Shawshank Redemption", "Interstellar"]
        };
      }

      const historySummary = watchHistory.slice(0, 15).map((h: any) =>
        `- ${h.metadata?.title || 'Unknown Title'} (${h.contentType})`
      ).join("\n");

      const prompt = `You are a cinematic growth analyst for "${profileName}". 
      Analyze their recent watch history:
      ${historySummary}
      
      GOAL: Create a deep "Taste DNA" profile that feels like a premium personality report (Spotify Wrapped style).
      
      Requirements:
      1. persona: A catchy title (e.g. "The Cerebral Story Seeker").
      2. summary: A 2-sentence poetic analysis of their style.
      3. traits: 3 distinct emotional or technical traits.
      4. personality: A unique viewing personality (e.g. "The Night Thriller Enthusiast").
      5. moodDistribution: 4-5 core moods as labels and values (totaling 100).
      6. evolution: Compare with "previous month" (simulate trends based on history diversity).
      7. genres: A breakdown of genre counts.
      8. recommendations: 3 specific movie/series titles they would LOVE based on this DNA.
      
      Return ONLY a JSON object:
      {
        "persona": "...",
        "summary": "...",
        "traits": ["...", "...", "..."],
        "personality": "...",
        "moodDistribution": [{"label": "...", "value": 25}, ...],
        "evolution": {
          "period": "Last 30 days",
          "changes": [{"label": "Genre", "change": 12}, ...]
        },
        "genres": {"Action": 5, ...},
        "recommendations": ["Title 1", "Title 2", "Title 3"]
      }`;

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      const cleanedText = response.text
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      this.logger.error("Error generating Taste DNA", { error: (error as Error).message });
      // Safety fallback
      return {
        persona: "The Global Cinephile",
        summary: "You have a balanced appetite for stories that span across genres and cultures.",
        traits: ["Balanced", "Observant", "Diverse"],
        personality: "The Daily Streamer",
        moodDistribution: [{ label: "Joy", value: 50 }, { label: "Tension", value: 50 }],
        evolution: { period: "Last 30 days", changes: [] },
        genres: { "Drama": 1 },
        recommendations: ["Parasite", "Breaking Bad"]
      };
    }
  }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;

/**
 * Get or create Gemini service instance
 */
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey?.trim()) {
      const logger = getLogger();
      logger.warn("GEMINI_API_KEY is missing. Initializing in Simulation Mode.");
      // Don't throw, create instance with null key for fallback handling
    }

    geminiServiceInstance = new GeminiService(apiKey || "");
  }
  return geminiServiceInstance;
}

export type { MovieData, AIFactsResponse, AISuggestionResponse };

/**
 * High-level wrapper for semantic search queries
 */
export async function geminiSearch(query: string): Promise<any> {
  try {
    const service = getGeminiService();
    // Use the model to categorize the query and suggest intents
    const prompt = `Analyze this search query for a movie streaming platform: "${query}"
    
    1. Identify the likely intent (KEYWORD, SEMANTIC, MOOD, PERSON, GENRE, TRENDING, HYBRID).
    2. Extract key entities (movies, actors, directors, genres).
    3. If it's a mood query, map it to TMDB genres.
    
    Return ONLY JSON:
    {
      "intent": "...",
      "entities": {
        "movies": [],
        "people": [],
        "genres": []
      },
      "mood_analysis": {
        "emotion": "...",
        "suggested_genres": []
      }
    }`;

    // Note: We use a lightweight call here
    if (!process.env.GEMINI_API_KEY) {
      return { intent: "KEYWORD", entities: { movies: [], people: [], genres: [] } };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });
    
    const text = response.text?.trim() || "{}";
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("[Gemini Search] Error:", error);
    return { intent: "KEYWORD", error: "Semantic analysis failed" };
  }
}
