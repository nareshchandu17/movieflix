import { NextRequest, NextResponse } from "next/server";
import ContentSegment from "@/models/ContentSegment";
import NarrativeSnapshot from "@/models/NarrativeSnapshot";
import Movie from "@/models/Movie";
import connectDB from "@/lib/db";

const sampleNarrativeData = [
  {
    startTime: 600, // 10 mins
    endTime: 900,  // 15 mins
    type: "plot-critical",
    plotImportance: 9,
    characters: ["Cooper", "Murph"],
    factsIntroduced: [
      { fact: "Cooper and Murph find secret NASA coordinates via gravity anomalies.", isSpoilerForFuture: false },
      { fact: "The 'Ghost' in Murph's room is confirmed to be communicating via binary.", isSpoilerForFuture: false }
    ],
    summary: "Discovery of NASA coordinates."
  },
  {
    startTime: 900,
    endTime: 1200, // 20 mins
    type: "exposition",
    plotImportance: 8,
    characters: ["Cooper", "Professor Brand"],
    factsIntroduced: [
      { fact: "Professor Brand reveals Plan A (moving everyone) and Plan B (population bomb).", isSpoilerForFuture: false },
      { fact: "The wormhole near Saturn was placed by 'Them'.", isSpoilerForFuture: false }
    ],
    summary: "Meeting with NASA and mission briefing."
  },
  {
    startTime: 1200,
    endTime: 1800, // 30 mins
    type: "emotional-beat",
    plotImportance: 10,
    characters: ["Cooper", "Murph"],
    factsIntroduced: [
      { fact: "Cooper leaves Earth, promising Murph he will return.", isSpoilerForFuture: false },
      { fact: "Murph is devastated and refuses to say goodbye.", isSpoilerForFuture: false }
    ],
    summary: "Emotional departure from Earth."
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const targetMovie = await Movie.findOne({ title: "Interstellar" });
    if (!targetMovie) {
      return NextResponse.json({ success: false, error: "Interstellar not found" }, { status: 404 });
    }

    const contentId = targetMovie._id.toString();

    // Clear and Seed
    await ContentSegment.deleteMany({ contentId });
    for (const s of sampleNarrativeData) {
      await new ContentSegment({ ...s, contentId, contentType: "Movie" }).save();
    }

    await NarrativeSnapshot.deleteMany({ contentId });
    await new NarrativeSnapshot({
      contentId,
      characterStates: [
        { name: "Cooper", emotionalState: "determined/grieved", location: "The Endurance (Space)" },
        { name: "Murph", emotionalState: "resentful/bitter", location: "Earth (The Farm)" }
      ]
    }).save();

    return NextResponse.json({ 
      success: true, 
      message: "Narrative data seeded for Interstellar!",
      segmentsCount: sampleNarrativeData.length
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
