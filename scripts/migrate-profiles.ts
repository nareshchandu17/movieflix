import mongoose from 'mongoose';
import User from '@/models/User';
import Profile from '@/lib/models/Profile';
import connectDB from '@/lib/db';

async function migrateProfiles() {
  try {
    console.log('🔄 Starting Profile Migration...\n');
    
    await connectDB();
    
    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users to migrate\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      try {
        // Check if user already has profiles
        const existingProfiles = await Profile.find({ userId: user._id });
        
        if (existingProfiles.length === 0) {
          // Create default profile for user
          const defaultProfile = await Profile.create({
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
          
          console.log(`✅ Created default profile for user: ${user.email}`);
          console.log(`   Profile ID: ${defaultProfile._id}`);
          console.log(`   Profile Name: ${defaultProfile.name}`);
          migratedCount++;
        } else {
          console.log(`⏭️ User ${user.email} already has ${existingProfiles.length} profile(s) - skipping`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Error migrating user ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ⏭️ Already had profiles: ${skippedCount} users`);
    console.log(`   📋 Total processed: ${users.length} users`);
    
    // Verify migration
    const totalProfiles = await Profile.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log(`\n🔍 Verification:`);
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   👤 Total Profiles: ${totalProfiles}`);
    console.log(`   📈 Average profiles per user: ${(totalProfiles / totalUsers).toFixed(2)}`);
    
    console.log('\n🎉 Profile Migration Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProfiles();
}

export default migrateProfiles;
