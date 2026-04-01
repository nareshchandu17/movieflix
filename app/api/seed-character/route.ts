import { NextRequest, NextResponse } from "next/server";
import CharacterProfile from "@/models/CharacterProfile";
import CharacterArcLog from "@/models/CharacterArcLog";
import RelationshipHistory from "@/models/RelationshipHistory";
import ArcInflectionPoint from "@/models/ArcInflectionPoint";
import Movie from "@/models/Movie";
import connectDB from "@/lib/db";

const sampleCharacterData = {
  movieTitle: "Interstellar",
  characterName: "Cooper",
  actorName: "Matthew McConaughey",
  initialArchetype: "Pilot / Father",
  finalArchetype: "Savior / Explorer",
  logs: [
    { timestamp: 0, emotion: "frustrated", alignment: 7, motivation: "Saving the farm", stability: 8, power: 4 },
    { timestamp: 600, emotion: "hopeful", alignment: 8, motivation: "Solving the anomaly", stability: 7, power: 5 },
    { timestamp: 1200, emotion: "grieved", alignment: 9, motivation: "Leaving Murph", stability: 4, power: 5 },
    { timestamp: 3600, emotion: "determined", alignment: 9, motivation: "Finding a home", stability: 6, power: 6 },
    { timestamp: 5400, emotion: "desperate", alignment: 8, motivation: "Saving the mission", stability: 5, power: 7 },
    { timestamp: 7200, emotion: "enlightened", alignment: 10, motivation: "Transcending time", stability: 3, power: 10 },
  ],
  inflections: [
    { timestamp: 1200, type: "loss", catalyst: "Departure", description: "Leaves Murph behind to save humanity." },
    { timestamp: 5400, type: "betrayal", catalyst: "Dr. Mann", description: "Almost dies due to Mann's sabotage." },
    { timestamp: 7200, type: "transformation", catalyst: "The Tesseract", description: "Becomes the 'Ghost' and communicates across time." }
  ]
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const movie = await Movie.findOne({ title: sampleCharacterData.movieTitle });
    if (!movie) return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    // 1. Seed Profile
    const profile = await CharacterProfile.findOneAndUpdate(
      { contentId: movie._id.toString(), name: sampleCharacterData.characterName },
      { 
        contentId: movie._id.toString(),
        name: sampleCharacterData.characterName,
        actorName: sampleCharacterData.actorName,
        initialArchetype: sampleCharacterData.initialArchetype,
        finalArchetype: sampleCharacterData.finalArchetype
      },
      { upsert: true, new: true }
    );

    // 2. Seed Logs
    await CharacterArcLog.deleteMany({ characterId: profile._id });
    for (const log of sampleCharacterData.logs) {
      await new CharacterArcLog({ ...log, characterId: profile._id }).save();
    }

    // 3. Seed Inflections
    await ArcInflectionPoint.deleteMany({ characterId: profile._id });
    for (const inf of sampleCharacterData.inflections) {
      await new ArcInflectionPoint({ ...inf, characterId: profile._id }).save();
    }

    // 4. Seed a second character for relationship web
    const murphProfile = await CharacterProfile.findOneAndUpdate(
      { contentId: movie._id.toString(), name: "Murph" },
      { contentId: movie._id.toString(), name: "Murph", actorName: "Jessica Chastain" },
      { upsert: true, new: true }
    );

    await RelationshipHistory.deleteMany({ contentId: movie._id.toString() });
    await new RelationshipHistory({
      contentId: movie._id.toString(),
      charA: profile._id,
      charB: murphProfile._id,
      evolution: [
        { timestamp: 0, type: "family", quality: 10, description: "Strong father-daughter bond." },
        { timestamp: 1200, type: "complicated", quality: -5, description: "Resentment after Cooper departs." },
        { timestamp: 7200, type: "family", quality: 10, description: "Eternal reconciliation across time." }
      ]
    }).save();

    return NextResponse.json({ 
      success: true, 
      characterId: profile._id,
      message: "Character data and relationships seeded for Cooper!" 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
