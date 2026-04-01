import CharacterProfile from "@/models/CharacterProfile";
import CharacterArcLog from "@/models/CharacterArcLog";
import RelationshipHistory from "@/models/RelationshipHistory";
import ArcInflectionPoint from "@/models/ArcInflectionPoint";
import { getGeminiService } from "./geminiService";

/**
 * Aggregates all character data and formats it for visualization
 */
export async function getCharacterCompassData(characterId: string) {
  const gemini = getGeminiService();

  // 1. Fetch character master profile
  const character = await CharacterProfile.findById(characterId).lean();
  if (!character) throw new Error("Character not found");

  // 2. Fetch logs and inflection points
  const logs = await CharacterArcLog.find({ characterId }).sort({ timestamp: 1 }).lean();
  const inflectionPoints = await ArcInflectionPoint.find({ characterId }).sort({ timestamp: 1 }).lean();

  // 3. Fetch relationship graph
  const relationships = await RelationshipHistory.find({
    $or: [{ charA: characterId }, { charB: characterId }]
  })
  .populate("charA charB", "name actorName")
  .lean();

  // 4. Generate AI analysis if DNA is missing or should be refreshed
  let analysis = {
    dna: character.dnaSummary || "",
    summary: "",
    evolutionTags: [] as string[]
  };

  if (!analysis.dna || logs.length > 0) {
    analysis = await gemini.analyzeCharacterArc(character.name, logs, inflectionPoints);
  }

  // 5. Format for SVG Visualization
  // Coordinate system: X = Normalized Time (0-100), Y = Normalized State (-10 to 10)
  const maxTime = Math.max(...logs.map(l => l.timestamp), 1);
  const minTime = Math.min(...logs.map(l => l.timestamp), 0);
  const timeRange = maxTime - minTime;

  const arcPoints = logs.map(log => ({
    x: ((log.timestamp - minTime) / timeRange) * 100,
    y: log.moralAlignment,
    stability: log.stabilityScore,
    power: log.powerLevel,
    emotion: log.emotionalState,
    timestamp: log.timestamp
  }));

  const inflectionMarkers = inflectionPoints.map(p => ({
    x: ((p.timestamp - minTime) / timeRange) * 100,
    y: logs.find(l => l.timestamp >= p.timestamp)?.moralAlignment || 0,
    type: p.type,
    description: p.description
  }));

  return {
    character,
    analysis,
    visualization: {
      arcPoints,
      inflectionMarkers,
    },
    relationships: relationships.map((r: any) => {
      const otherChar = r.charA._id.toString() === characterId ? r.charB : r.charA;
      return {
        id: otherChar._id,
        name: otherChar.name,
        history: r.evolution,
        latestState: r.evolution[r.evolution.length - 1]
      };
    })
  };
}
