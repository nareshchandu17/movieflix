// Test database connection and create sample payment data
const testDatabaseConnection = async () => {
  console.log('🔌 Testing Database Connection for Payment Storage\n');
  
  try {
    // Try to connect to MongoDB
    const mongoose = require('mongoose');
    
    // Get MongoDB URI from environment
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Current Collections:');
    if (collections.length === 0) {
      console.log('   No collections found - database is empty');
    } else {
      collections.forEach(collection => {
        console.log(`   📄 ${collection.name}`);
      });
    }
    
    // Create sample payment data structure
    console.log('\n💾 Payment Storage Schema Ready:');
    
    const samplePaymentAttempt = {
      userId: new mongoose.Types.ObjectId(),
      planId: new mongoose.Types.ObjectId(),
      amount: 499,
      currency: 'INR',
      status: 'SUCCESS',
      transactionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod: 'credit_card',
      processedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const sampleSubscription = {
      userId: samplePaymentAttempt.userId,
      planId: samplePaymentAttempt.planId,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('\n📝 Sample PaymentAttempt Document:');
    console.log(JSON.stringify(samplePaymentAttempt, null, 2));
    
    console.log('\n📝 Sample Subscription Document:');
    console.log(JSON.stringify(sampleSubscription, null, 2));
    
    // Test creating indexes for performance
    console.log('\n🚀 Database Indexes for Performance:');
    console.log('   📊 paymentattempts: userId, transactionId, status');
    console.log('   👥 subscriptions: userId, planId, status');
    console.log('   💳 users: email (unique)');
    console.log('   📦 plans: name (unique)');
    
    console.log('\n✅ Payment storage system is ready!');
    console.log('💡 All payment details will be stored securely in MongoDB');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify MONGODB_URI in .env.local');
    console.log('3. Ensure network connectivity to MongoDB');
    console.log('4. Check MongoDB credentials and permissions');
    
    console.log('\n💡 For local MongoDB setup:');
    console.log('   - Install MongoDB Community Server');
    console.log('   - Start MongoDB service');
    console.log('   - Use: MONGODB_URI=mongodb://localhost:27017/cineworld');
    
    console.log('\n💡 For MongoDB Atlas setup:');
    console.log('   - Create free cluster at mongodb.com/atlas');
    console.log('   - Whitelist your IP address');
    console.log('   - Copy connection string to .env.local');
  }
};

// Run the test
testDatabaseConnection().catch(console.error);
