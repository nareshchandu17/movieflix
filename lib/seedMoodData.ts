import MoodProfile from "../models/MoodProfile";
import Movie from "../models/Movie";

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

export async function seedMoodProfiles() {
  console.log("Seeding Mood Profiles...");
  
  for (const data of sampleMoodData) {
    const movie = await Movie.findOne({ title: data.title });
    if (movie) {
      await MoodProfile.findOneAndUpdate(
        { contentId: movie._id.toString() },
        { 
          ...data, 
          contentId: movie._id.toString(),
          contentType: "Movie"
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded mood profile for: ${data.title}`);
    } else {
      console.log(`Movie not found: ${data.title}`);
    }
  }
  
  console.log("Seeding complete!");
}
