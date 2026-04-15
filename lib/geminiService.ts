/**
 * Gemini AI Service for Movie & Series Insights
 * Clean, streamlined implementation using Gemini API
 */

import { GoogleGenAI } from "@google/genai";
import { getLogger } from "./logger";

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
  private readonly MODEL_NAME = "gemini-2.5-flash";

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
      this.logger.error("Error generating AI suggestion", { error: errorMessage });

      return {
        suggestion: {
          title: "",
          year: "",
          type: "movie",
          overview: "",
          reason: "",
          searchKeyword: "",
        },
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generates AI-powered facts using Gemini API
   */
  async generateFacts(data: MovieData): Promise<AIFactsResponse> {
    try {
      const title = data.name || data.title;

      if (!title) {
        throw new Error("Title is required");
      }

      this.logger.info("Generating AI facts", { title });

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
      this.logger.error("Error generating AI facts", { error: errorMessage });

      return {
        facts: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Extracts emotional intent from natural language user input
   */
  async extractMoodIntent(userInput: string): Promise<{
    openingEmotion: string;
    midpointEmotion: string;
    resolutionEmotion: string;
    intensityScore: number;
    cryProbability: number;
    hopeIndex: number;
    laughDensity: number;
    toneRequirement: string;
  }> {
    try {
      this.logger.info("Extracting mood intent", { userInput });

      if (this.isSimulated()) {
        const lowerInput = userInput.toLowerCase();
        // Intelligent mock based on keywords
        const isSad = lowerInput.includes("cry") || lowerInput.includes("sad");
        const isHopeful = lowerInput.includes("hope") || lowerInput.includes("happy");
        
        return {
          openingEmotion: isSad ? "sorrow" : "curiosity",
          midpointEmotion: "introspection",
          resolutionEmotion: isHopeful ? "hope" : "satisfaction",
          intensityScore: isSad ? 8 : 5,
          cryProbability: isSad ? 9 : 2,
          hopeIndex: isHopeful ? 9 : 5,
          laughDensity: lowerInput.includes("laugh") ? 8 : 1,
          toneRequirement: isSad && isHopeful ? "dark-but-hopeful" : isSad ? "purely dark" : "warm"
        };
      }

      const prompt = `You are an expert cinematic psychologist. Analyze this user mood/request: "${userInput}"
      
      Convert this natural language into a structured emotional arc profile.
      
      Requirements:
      1. openingEmotion, midpointEmotion, resolutionEmotion: Single words describing the desired journey.
      2. intensityScore: 1-10 (how emotionally intense/heavy)
      3. cryProbability: 1-10 (likelihood of wanting to cry)
      4. hopeIndex: 1-10 (level of optimism/hope)
      5. laughDensity: 1-10 (frequency of comedic relief)
      6. toneRequirement: One of: "dark-but-hopeful", "purely dark", "warm", "satirical", "absurdist"
      
      Return ONLY a JSON object:
      {
        "openingEmotion": "word",
        "midpointEmotion": "word",
        "resolutionEmotion": "word",
        "intensityScore": 5,
        "cryProbability": 2,
        "hopeIndex": 8,
        "laughDensity": 4,
        "toneRequirement": "warm"
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
      this.logger.error("Error extracting mood intent", { error: (error as Error).message });
      // Fallback defaults
      return {
        openingEmotion: "neutral",
        midpointEmotion: "curious",
        resolutionEmotion: "satisfied",
        intensityScore: 5,
        cryProbability: 3,
        hopeIndex: 5,
        laughDensity: 5,
        toneRequirement: "warm"
      };
    }
  }

  /**
   * Generates a "Why this matches" explanation
   */
  async generateMoodExplanation(movieTitle: string, userMood: string): Promise<string> {
    try {
      const prompt = `User said: "${userMood}"
      Recommended Movie: "${movieTitle}"
      
      Write a one-line explanation (max 20 words) explaining why "${movieTitle}" perfectly matches the emotional journey the user requested. Be cinematic and empathetic.`;

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      return response.text?.trim() || "Matches the emotional resonance of your request.";
    } catch (error) {
      return "A perfect emotional match for your current mood.";
    }
  }
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
    logs: any[],
    inflectionPoints: any[]
  ): Promise<{ dna: string; summary: string; evolutionTags: string[] }> {
    try {
      this.logger.info("Analyzing character arc", { name });

      const prompt = `You are a professional literary analyst and screenwriter.
      
      TASK: Analyze the narrative arc of the character "${name}" based on these logs:
      LOGS:
      ${JSON.stringify(logs.map(l => ({
        time: l.timestamp,
        emotion: l.emotionalState,
        alignment: l.moralAlignment,
        motivation: l.motivation
      })))}
      
      INFLECTION POINTS:
      ${JSON.stringify(inflectionPoints.map(p => ({
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
    try {
      const title = data.name || data.title;
      if (!title) throw new Error("Title is required");

      this.logger.info("Generating AI series insights", { title });

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
      this.logger.error("Error generating series insights", { 
        error: errorMessage,
        rawResponse: "truncated" 
      });
      return { insights: [], success: false, error: errorMessage };
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
