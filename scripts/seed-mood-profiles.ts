import mongoose from 'mongoose';
import MoodProfile from '@/models/MoodProfile';
import Movie from '@/models/Movie';
import connectDB from '@/lib/db';

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

async function seedMoodProfiles() {
  console.log('🎬 Seeding Mood Profiles for Mood-to-Movie Engine\n');
  
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

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

  } catch (error: any) {
    console.error('❌ Failed to seed mood profiles:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Ensure the execution is from this file
if (process.argv[1] === (import.meta as any).url || process.argv[1].includes('seed-mood-profiles')) {
    seedMoodProfiles();
}

export default seedMoodProfiles;
