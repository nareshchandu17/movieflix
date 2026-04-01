const mongoose = require('mongoose');

// Define Plan schema directly
const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['BASIC', 'PREMIUM'],
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  features: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  stripePriceId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const plans = [
  {
    name: 'BASIC',
    price: 0,
    currency: 'INR',
    features: [
      'Limited movie access',
      'Basic streaming quality',
      'Advertisements included'
    ],
    description: 'Free plan with limited access to our content library',
    duration: 'monthly',
    isActive: true
  },
  {
    name: 'PREMIUM',
    price: 499,
    currency: 'INR',
    features: [
      'Unlimited movies & TV shows',
      'Ad-free experience',
      '4K Ultra HD streaming',
      'Watch Party feature',
      'AI-powered recommendations',
      'Early access to new releases',
      'Priority customer support',
      'Download for offline viewing',
      'Multiple device streaming'
    ],
    description: 'Premium plan with unlimited access to all features',
    duration: 'monthly',
    isActive: true
  }
];

async function seedPlans() {
  try {
    console.log('🌱 Starting to seed plans...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cineworld';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create Plan model
    const Plan = mongoose.model('Plan', PlanSchema);
    
    // Clear existing plans
    await Plan.deleteMany({});
    console.log('🗑️ Cleared existing plans');
    
    // Insert new plans
    const insertedPlans = await Plan.insertMany(plans);
    console.log(`✅ Successfully inserted ${insertedPlans.length} plans`);
    
    // Log inserted plans
    console.log('\n📦 Available Plans:');
    insertedPlans.forEach((plan, index) => {
      console.log(`  ${index + 1}. ${plan.name}: ₹${plan.price}/${plan.duration}`);
      console.log(`     Features: ${plan.features.length} features`);
      console.log(`     ID: ${plan._id}`);
    });
    
    console.log('\n🎉 Plans seeding completed successfully!');
    console.log('💾 Payment database is now ready with subscription plans!');
    
    // Test creating a sample payment attempt
    console.log('\n💳 Testing Payment Storage...');
    
    // Define PaymentAttempt schema
    const PaymentAttemptSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true,
        default: 'INR'
      },
      status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
      },
      paymentMethod: {
        type: String,
        required: false
      },
      transactionId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
      },
      failureReason: {
        type: String,
        required: false
      },
      processedAt: {
        type: Date,
        required: false
      }
    }, {
      timestamps: true
    });
    
    const PaymentAttempt = mongoose.model('PaymentAttempt', PaymentAttemptSchema);
    
    // Create sample payment attempt
    const samplePayment = new PaymentAttempt({
      userId: new mongoose.Types.ObjectId(),
      planId: insertedPlans[1]._id, // Premium plan
      amount: 499,
      currency: 'INR',
      status: 'SUCCESS',
      transactionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod: 'credit_card',
      processedAt: new Date()
    });
    
    await samplePayment.save();
    console.log('✅ Sample payment attempt stored successfully!');
    console.log(`   Payment ID: ${samplePayment._id}`);
    console.log(`   Transaction ID: ${samplePayment.transactionId}`);
    console.log(`   Amount: ₹${samplePayment.amount}`);
    console.log(`   Status: ${samplePayment.status}`);
    
    console.log('\n🎯 Payment Storage System is Fully Operational!');
    
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the seeding
seedPlans();
