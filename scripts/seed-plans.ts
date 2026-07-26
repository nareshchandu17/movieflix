import mongoose from 'mongoose';
import Plan from '@/features/payments/models/Plan';
import connectDB from '@/lib/db';

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

    
    await connectDB();
    
    // Clear existing plans
    await Plan.deleteMany({});

    
    // Insert new plans
    const insertedPlans = await Plan.insertMany(plans);

    
    // Log inserted plans
    insertedPlans.forEach((plan, index) => {


    });
    

    
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedPlans();
}

export default seedPlans;
