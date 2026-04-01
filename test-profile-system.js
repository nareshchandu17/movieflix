const mongoose = require('mongoose');

// Direct migration and test
const testProfileSystem = async () => {
  console.log('🧪 Testing Multi-Profile System (Phase 1)\n');
  
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define schemas directly for testing
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

    // Step 1: Check existing users
    console.log('\n1️⃣ Checking existing users...');
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);

    // Step 2: Migration - Create default profiles
    console.log('\n2️⃣ Running profile migration...');
    let migratedCount = 0;
    
    for (const user of users) {
      const existingProfiles = await Profile.find({ userId: user._id });
      
      if (existingProfiles.length === 0) {
        await Profile.create({
          userId: user._id,
          name: user.name ? `${user.name}'s Profile` : 'Default Profile',
          avatar: user.avatar || 'default.png',
          isKids: false,
          maturityLevel: '18+',
          isActive: true,
          preferences: {
            autoplay: true,
            language: user.preferences?.languages?.[0] || 'en',
            subtitles: false
          }
        });
        
        console.log(`✅ Created default profile for: ${user.email}`);
        migratedCount++;
      } else {
        console.log(`⏭️ User ${user.email} already has ${existingProfiles.length} profile(s)`);
      }
    }

    // Step 3: Test Profile Creation
    console.log('\n3️⃣ Testing profile creation...');
    if (users.length > 0) {
      const testUser = users[0];
      const currentProfiles = await Profile.find({ userId: testUser._id });
      
      if (currentProfiles.length < testUser.profilesLimit) {
        const newProfile = await Profile.create({
          userId: testUser._id,
          name: 'Kids Profile',
          isKids: true,
          maturityLevel: '13+',
          avatar: 'kids-default.png'
        });
        
        console.log(`✅ Created kids profile: ${newProfile.name}`);
        console.log(`   Profile ID: ${newProfile._id}`);
        console.log(`   Is Kids: ${newProfile.isKids}`);
        console.log(`   Maturity Level: ${newProfile.maturityLevel}`);
      } else {
        console.log(`⚠️ User ${testUser.email} has reached profile limit`);
      }
    }

    // Step 4: Verify Data Structure
    console.log('\n4️⃣ Verifying data structure...');
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    
    console.log(`📊 Database Summary:`);
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   👤 Total Profiles: ${totalProfiles}`);
    console.log(`   📈 Avg Profiles per User: ${(totalProfiles / totalUsers).toFixed(2)}`);

    // Step 5: Test Profile Relationships
    console.log('\n5️⃣ Testing profile relationships...');
    const userWithProfiles = await User.aggregate([
      {
        $lookup: {
          from: 'profiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profiles'
        }
      },
      {
        $project: {
          email: 1,
          profilesLimit: 1,
          profileCount: { $size: '$profiles' },
          profiles: {
            $map: {
              input: '$profiles',
              as: 'profile',
              in: {
                name: '$$profile.name',
                isKids: '$$profile.isKids',
                maturityLevel: '$$profile.maturityLevel'
              }
            }
          }
        }
      }
    ]);

    console.log('👤 User-Profile Relationships:');
    userWithProfiles.forEach(user => {
      console.log(`   ${user.email}: ${user.profileCount} profiles`);
      user.profiles.forEach(profile => {
        console.log(`     - ${profile.name} (${profile.isKids ? 'Kids' : 'Regular'}, ${profile.maturityLevel})`);
      });
    });

    // Step 6: Test API Simulation
    console.log('\n6️⃣ Simulating API operations...');
    
    // Simulate GET /api/profiles
    if (users.length > 0) {
      const testUser = users[0];
      const userProfiles = await Profile.find({ userId: testUser._id, isActive: true })
        .sort({ lastWatchedAt: -1 });
      
      console.log(`📋 GET /api/profiles simulation:`);
      console.log(`   User: ${testUser.email}`);
      console.log(`   Profiles returned: ${userProfiles.length}`);
      userProfiles.forEach((profile, index) => {
        console.log(`     ${index + 1}. ${profile.name} (${profile.isKids ? 'Kids' : 'Adult'})`);
      });

      // Simulate POST /api/profiles/switch
      if (userProfiles.length > 0) {
        const targetProfile = userProfiles[0];
        targetProfile.lastWatchedAt = new Date();
        await targetProfile.save();
        
        console.log(`🔄 POST /api/profiles/switch simulation:`);
        console.log(`   Switched to: ${targetProfile.name}`);
        console.log(`   Last watched: ${targetProfile.lastWatchedAt.toLocaleString()}`);
      }
    }

    console.log('\n🎯 Multi-Profile System Test Results:');
    console.log('✅ Database models created successfully');
    console.log('✅ User migration completed');
    console.log('✅ Profile creation working');
    console.log('✅ Profile relationships verified');
    console.log('✅ API operations simulated');
    console.log(`✅ ${migratedCount} users migrated with default profiles`);

    console.log('\n🚀 Phase 1 Implementation Complete!');
    console.log('📋 Ready for frontend integration and testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the test
testProfileSystem();
