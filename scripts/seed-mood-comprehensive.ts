import fs from 'fs';
import path from 'path';

// Manual .env.local loader (Run this BEFORE imports that might use env vars)
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const firstEquals = trimmedLine.indexOf('=');
        if (firstEquals !== -1) {
          const key = trimmedLine.substring(0, firstEquals).trim();
          const value = trimmedLine.substring(firstEquals + 1).trim();
          process.env[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    console.log('📖 Loaded .env.local manually');
  }
} catch (e) {
  console.warn('⚠️ Failed to load .env.local:', e);
}

const comprehensiveMoodData = [
  // --- TOLLYWOOD (TELUGU) - 60% ---
  {
    title: "RRR",
    tmdbId: 579047,
    language: "te",
    openingEmotion: "passion",
    midpointEmotion: "loyalty",
    resolutionEmotion: "fire",
    intensityScore: 10,
    cryProbability: 6,
    hopeIndex: 9,
    laughDensity: 3,
    endingType: "triumphant",
    pacing: "fast",
    tone: "warm",
    payoffReliability: 10
  },
  {
    title: "Eega",
    tmdbId: 110416,
    language: "te",
    openingEmotion: "revenge",
    midpointEmotion: "determination",
    resolutionEmotion: "satisfaction",
    intensityScore: 7,
    cryProbability: 4,
    hopeIndex: 7,
    laughDensity: 8,
    endingType: "triumphant",
    pacing: "fast",
    tone: "satirical",
    payoffReliability: 10
  },
  {
    title: "Baahubali: The Beginning",
    tmdbId: 256040,
    language: "te",
    openingEmotion: "wonder",
    midpointEmotion: "revelation",
    resolutionEmotion: "mystery",
    intensityScore: 9,
    cryProbability: 3,
    hopeIndex: 8,
    laughDensity: 4,
    endingType: "open",
    pacing: "steady",
    tone: "warm",
    payoffReliability: 9
  },
  {
    title: "Pushpa: The Rise",
    tmdbId: 760161,
    language: "te",
    openingEmotion: "ambition",
    midpointEmotion: "power",
    resolutionEmotion: "rebellion",
    intensityScore: 8,
    cryProbability: 2,
    hopeIndex: 5,
    laughDensity: 5,
    endingType: "open",
    pacing: "fast",
    tone: "purely dark",
    payoffReliability: 8
  },
  {
    title: "Arjun Reddy",
    tmdbId: 468334,
    language: "te",
    openingEmotion: "intensity",
    midpointEmotion: "destruction",
    resolutionEmotion: "redemption",
    intensityScore: 10,
    cryProbability: 9,
    hopeIndex: 4,
    laughDensity: 2,
    endingType: "triumphant",
    pacing: "slow-burn",
    tone: "purely dark",
    payoffReliability: 9
  },
  {
    title: "Evaru",
    tmdbId: 618355,
    language: "te",
    openingEmotion: "suspense",
    midpointEmotion: "confusion",
    resolutionEmotion: "shock",
    intensityScore: 8,
    cryProbability: 1,
    hopeIndex: 3,
    laughDensity: 1,
    endingType: "ambiguous",
    pacing: "steady",
    tone: "purely dark",
    payoffReliability: 10
  },

  // --- OTHERS (ENGLISH, HINDI, MALAYALAM) - 40% ---
  {
    title: "Inception",
    tmdbId: 27205,
    language: "en",
    openingEmotion: "curiosity",
    midpointEmotion: "confusion",
    resolutionEmotion: "wonder",
    intensityScore: 8,
    cryProbability: 3,
    hopeIndex: 6,
    laughDensity: 2,
    endingType: "ambiguous",
    pacing: "steady",
    tone: "dark-but-hopeful",
    payoffReliability: 10
  },
  {
    title: "3 Idiots",
    tmdbId: 20453,
    language: "hi",
    openingEmotion: "joy",
    midpointEmotion: "pressure",
    resolutionEmotion: "inspiration",
    intensityScore: 5,
    cryProbability: 8,
    hopeIndex: 10,
    laughDensity: 10,
    endingType: "triumphant",
    pacing: "fast",
    tone: "warm",
    payoffReliability: 10
  },
  {
    title: "Drishyam",
    tmdbId: 242084,
    language: "ml",
    openingEmotion: "peace",
    midpointEmotion: "panic",
    resolutionEmotion: "relief",
    intensityScore: 9,
    cryProbability: 2,
    hopeIndex: 5,
    laughDensity: 3,
    endingType: "closed",
    pacing: "slow-burn",
    tone: "dark-but-hopeful",
    payoffReliability: 10
  },
  {
    title: "The Shawshank Redemption",
    tmdbId: 278,
    language: "en",
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
  }
];

async function seedComprehensiveMoods() {
  console.log('🚀 Starting COMPREHENSIVE Mood Engine Seeding...');
  console.log('🎯 Targeting 60% Tollywood / 40% Global content\n');

  try {
    // Dynamic imports after env is loaded
    const mongoose = (await import('mongoose')).default;
    const connectDB = (await import('../lib/db')).default;
    const Movie = (await import('../models/Movie')).default;
    const MoodProfile = (await import('../models/MoodProfile')).default;

    await connectDB();
    console.log('✅ Connected to MongoDB');

    for (const data of comprehensiveMoodData) {
      // 1. Ensure Movie exists
      const movie = await Movie.findOneAndUpdate(
        { tmdbId: data.tmdbId },
        { 
          title: data.title,
          tmdbId: data.tmdbId,
          originalLanguage: data.language,
          description: `A masterpiece in ${data.language} cinema.`,
          year: 2020 
        },
        { upsert: true, new: true }
      );

      // 2. Create/Update Mood Profile
      const { title, tmdbId, language, ...profileData } = data;
      await MoodProfile.findOneAndUpdate(
        { contentId: movie._id.toString() },
        { 
          ...profileData,
          contentId: movie._id.toString(),
          contentType: "Movie",
          language: data.language
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Seeded: [${data.language.toUpperCase()}] ${data.title}`);
    }

    console.log('\n✨ Seeding successful! Your Mood Engine is now balanced and ready.');
    console.log('📊 Total Profiles: ', await MoodProfile.countDocuments());

    await mongoose.disconnect();
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedComprehensiveMoods();
