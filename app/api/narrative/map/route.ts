import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContentSegment from "@/models/ContentSegment";
import ArcInflectionPoint from "@/models/ArcInflectionPoint";
import CharacterProfile from "@/models/CharacterProfile";
import Series from "@/models/Series";
import Movie from "@/models/Movie";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("id");
    const type = searchParams.get("type") || "Series";

    if (!contentId) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
    }

    await connectDB();

    // 1. Fetch character profiles for coloring and identity
    const characters = await CharacterProfile.find({ contentId }).lean();

    // 2. Fetch general plot segments
    const segments = await ContentSegment.find({ contentId }).sort({ startTime: 1 }).lean();

    // 3. Fetch specific character arc points
    const arcPoints = await ArcInflectionPoint.find({ 
      characterId: { $in: characters.map(c => c._id) } 
    }).sort({ timestamp: 1 }).lean();

    // 4. Fallback: If no data exists, return a structured "Mock" trajectory for demo purposes
    // (In a real production app, this would trigger an AI generation task or return empty)
    if (segments.length === 0 && arcPoints.length === 0) {
      return NextResponse.json({
        success: true,
        isMock: true,
        data: generateMockNarrativeMap(contentId, characters)
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        characters,
        segments,
        arcPoints
      }
    });
  } catch (error: any) {
    console.error("NARRATIVE MAP ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateMockNarrativeMap(contentId: string, characters: any[]) {
  // Generate a plausible multiline trajectory
  const mockSegments = [
    { startTime: 0, endTime: 600, type: "exposition", summary: "Introduction of key players.", plotImportance: 5 },
    { startTime: 1200, endTime: 1800, type: "plot-critical", summary: "The inciting incident occurs.", plotImportance: 9 },
    { startTime: 2400, endTime: 3000, type: "emotional-beat", summary: "First major character conflict.", plotImportance: 7 },
  ];

  const mockArcPoints = characters.flatMap((char, idx) => [
    { 
      characterId: char._id, 
      timestamp: 1500 + (idx * 200), 
      type: "revelation", 
      description: `${char.name} discovers a hidden truth.` 
    },
    { 
      characterId: char._id, 
      timestamp: 3200 - (idx * 100), 
      type: "growth", 
      description: `${char.name} overcomes a personal obstacle.` 
    }
  ]);

  return {
    characters: characters.length > 0 ? characters : [
      { _id: "1", name: "Protagonist", initialArchetype: "Hero" },
      { _id: "2", name: "Antagonist", initialArchetype: "Villain" }
    ],
    segments: mockSegments,
    arcPoints: mockArcPoints
  };
}
