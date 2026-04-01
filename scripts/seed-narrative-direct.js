const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function seedNarrativeData() {
  console.log('🎬 Seeding Narrative Data for Skip-Safe Summaries\n');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas directly
    const Movie = mongoose.models.Movie || mongoose.model('Movie', new mongoose.Schema({ title: String }));
    
    const ContentSegment = mongoose.models.ContentSegment || mongoose.model('ContentSegment', new mongoose.Schema({
        contentId: String,
        contentType: String,
        episodeId: String,
        startTime: Number,
        endTime: Number,
        type: String,
        plotImportance: Number,
        characters: [String],
        factsIntroduced: [{ fact: String, isSpoilerForFuture: Boolean, spoilerRadius: String }],
        summary: String
    }));

    const NarrativeSnapshot = mongoose.models.NarrativeSnapshot || mongoose.model('NarrativeSnapshot', new mongoose.Schema({
        contentId: String,
        characterStates: [{ name: String, emotionalState: String, location: String }],
    }));

    const targetMovie = await Movie.findOne({ title: "Interstellar" });
    if (!targetMovie) {
      console.log('⚠️ Interstellar not found in DB, skipping seeding.');
      return;
    }

    const contentId = targetMovie._id.toString();

    // 1. Seed Segments for the first 30 mins
    const segments = [
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

    await ContentSegment.deleteMany({ contentId });
    for (const s of segments) {
      await new ContentSegment({ ...s, contentId, contentType: "Movie" }).save();
    }
    console.log(`✅ Seeded ${segments.length} content segments for Interstellar.`);

    // 2. Seed Character Snapshot
    await NarrativeSnapshot.deleteMany({ contentId });
    await new NarrativeSnapshot({
      contentId,
      characterStates: [
        { name: "Cooper", emotionalState: "determined/grieved", location: "The Endurance (Space)" },
        { name: "Murph", emotionalState: "resentful/bitter", location: "Earth (The Farm)" }
      ]
    }).save();
    console.log(`✅ Seeded character snapshots for Interstellar.`);

    console.log('\n🎯 Narrative seeding complete!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedNarrativeData();
