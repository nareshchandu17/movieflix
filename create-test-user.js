const mongoose = require('mongoose');

const createTestUser = async () => {
  console.log('👤 Creating Test User for Profile System\n');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, index: true },
      password: { type: String, default: null },
      avatar: { type: String, default: null },
      preferences: {
        genres: { type: [String], default: [] },
        languages: { type: [String], default: ["en"] },
      },
      profilesLimit: { type: Number, default: 5, min: 1, max: 10 }
    }, { timestamps: true });

    const ProfileSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
      name: { type: String, required: true, trim: true, maxlength: 50 },
      avatar: { type: String, default: "default.png" },
      isKids: { type: Boolean, default: false },
      maturityLevel: { type: String, enum: ["U", "13+", "18+"], default: "18+" },
      isActive: { type: Boolean, default: true },
      lastWatchedAt: { type: Date, default: null },
      preferences: {
        autoplay: { type: Boolean, default: true },
        language: { type: String, default: "en" },
        subtitles: { type: Boolean, default: false }
      }
    }, { timestamps: true });

    const User = mongoose.model('User', UserSchema);
    const Profile = mongoose.model('Profile', ProfileSchema);

    // Create test user
    const testUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
      preferences: {
        genres: ['action', 'comedy'],
        languages: ['en', 'es']
      },
      profilesLimit: 5
    });

    console.log('✅ Test user created:');
    console.log(`   ID: ${testUser._id}`);
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Profiles Limit: ${testUser.profilesLimit}`);

    // Create default profile
    const defaultProfile = await Profile.create({
      userId: testUser._id,
      name: "John's Profile",
      avatar: 'default.png',
      isKids: false,
      maturityLevel: '18+',
      isActive: true,
      preferences: {
        autoplay: true,
        language: 'en',
        subtitles: false
      }
    });

    console.log('\n✅ Default profile created:');
    console.log(`   ID: ${defaultProfile._id}`);
    console.log(`   Name: ${defaultProfile.name}`);
    console.log(`   Is Kids: ${defaultProfile.isKids}`);
    console.log(`   Maturity Level: ${defaultProfile.maturityLevel}`);

    // Create kids profile
    const kidsProfile = await Profile.create({
      userId: testUser._id,
      name: 'Kids Profile',
      avatar: 'kids-default.png',
      isKids: true,
      maturityLevel: '13+',
      isActive: true,
      preferences: {
        autoplay: false,
        language: 'en',
        subtitles: true
      }
    });

    console.log('\n✅ Kids profile created:');
    console.log(`   ID: ${kidsProfile._id}`);
    console.log(`   Name: ${kidsProfile.name}`);
    console.log(`   Is Kids: ${kidsProfile.isKids}`);
    console.log(`   Maturity Level: ${kidsProfile.maturityLevel}`);

    console.log('\n🎯 Test data ready for multi-profile system!');
    console.log('📋 You can now test the complete flow:');
    console.log('   1. Login with john.doe@example.com');
    console.log('   2. Navigate to /select-profile');
    console.log('   3. Switch between profiles');
    console.log('   4. Test profile creation and management');

  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

createTestUser();
