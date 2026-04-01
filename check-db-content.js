const mongoose = require('mongoose');

const checkDBContent = async () => {
  console.log('🔍 Checking Database Content\n');
  
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Collections in database:');
    if (collections.length === 0) {
      console.log('   No collections found - database is empty');
    } else {
      collections.forEach(collection => {
        console.log(`   📄 ${collection.name}`);
      });
    }
    
    // Check if plans collection exists and has data
    if (collections.find(c => c.name === 'plans')) {
      const plansCollection = db.collection('plans');
      const plansCount = await plansCollection.countDocuments();
      console.log(`\n📦 Plans collection has ${plansCount} documents`);
      
      if (plansCount > 0) {
        const plans = await plansCollection.find({}).toArray();
        console.log('\n📋 Available Plans:');
        plans.forEach((plan, index) => {
          console.log(`  ${index + 1}. ${plan.name}: ₹${plan.price}/${plan.duration}`);
          console.log(`     ID: ${plan._id}`);
          console.log(`     Features: ${plan.features?.length || 0} features`);
        });
      } else {
        console.log('❌ Plans collection is empty - need to seed');
      }
    } else {
      console.log('❌ Plans collection does not exist - need to seed');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
  }
};

checkDBContent();
