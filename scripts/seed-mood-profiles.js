const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function seedMoodProfiles() {
  console.log('🎬 Seeding Mood Profiles for Mood-to-Movie Engine\n');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas (minimal for seeding)
    const MovieSchema = new mongoose.Schema({
      title: String,
    });
    const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

    const MoodProfileSchema = new mongoose.Schema({
      contentId: String,
      contentType: String,
      openingEmotion: String,
      midpointEmotion: String,
      resolutionEmotion: String,
      intensityScore: Number,
      cryProbability: Number,
      hopeIndex: Number,
      laughDensity: Number,
      endingType: String,
      pacing: String,
      tone: String,
      payoffReliability: Number,
    }, { timestamps: true });
    
    const MoodProfile = mongoose.models.MoodProfile || mongoose.model('MoodProfile', MoodProfileSchema);

    const sampleMoodData = [
      {
        title: "The Shawshank Redemption",
        openingEmotion: "hopelessness",
        midpointEmotion: "perseverance",
        resolutionEmotion: "triumph",
        intensityScore: 8,
        cryProbability: 7,
        hopeIndex: 10,
        laughDensity: 3,
        endingType: "triumphant",
        pacing: "steady",
        tone: "dark-but-hopeful",
        payoffReliability: 10
      },
      {
        title: "The Hangover",
        openingEmotion: "confusion",
        midpointEmotion: "chaos",
        resolutionEmotion: "hilarity",
        intensityScore: 3,
        cryProbability: 1,
        hopeIndex: 7,
        laughDensity: 10,
        endingType: "closed",
        pacing: "fast",
        tone: "satirical",
        payoffReliability: 9
      },
      {
        title: "Interstellar",
        openingEmotion: "desperation",
        midpointEmotion: "wonder",
        resolutionEmotion: "catharsis",
        intensityScore: 9,
        cryProbability: 8,
        hopeIndex: 8,
        laughDensity: 2,
        endingType: "ambiguous",
        pacing: "slow-burn",
        tone: "dark-but-hopeful",
        payoffReliability: 9
      },
      {
        title: "Eternal Sunshine of the Spotless Mind",
        openingEmotion: "heartbreak",
        midpointEmotion: "confusion",
        resolutionEmotion: "acceptance",
        intensityScore: 7,
        cryProbability: 9,
        hopeIndex: 6,
        laughDensity: 4,
        endingType: "ambiguous",
        pacing: "steady",
        tone: "absurdist",
        payoffReliability: 8
      },
      {
        title: "Toy Story",
        openingEmotion: "anxiety",
        midpointEmotion: "jealousy",
        resolutionEmotion: "joy",
        intensityScore: 4,
        cryProbability: 3,
        hopeIndex: 9,
        laughDensity: 8,
        endingType: "closed",
        pacing: "fast",
        tone: "warm",
        payoffReliability: 10
      }
    ];

    for (const data of sampleMoodData) {
      const movie = await Movie.findOne({ title: data.title });
      if (movie) {
        const { title, ...profileData } = data;
        await MoodProfile.findOneAndUpdate(
          { contentId: movie._id.toString() },
          { 
            ...profileData, 
            contentId: movie._id.toString(),
            contentType: "Movie"
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Seeded mood profile for: ${title}`);
      } else {
        console.log(`⚠️ Movie not found in DB, skipping: ${data.title}`);
      }
    }

    console.log('\n🎯 Mood Engine seeding complete!');

  } catch (error) {
    console.error('❌ Failed to seed mood profiles:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

seedMoodProfiles();
