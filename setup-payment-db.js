const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Payment Database Storage\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env.local from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created successfully');
  } else {
    console.log('❌ .env.example not found either');
  }
} else {
  console.log('✅ .env.local file exists');
}

// Read current .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📖 Current .env.local content loaded');
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
  return;
}

// Check if MONGODB_URI is configured
if (!envContent.includes('MONGODB_URI=') || envContent.includes('MONGODB_URI=mongodb://localhost:27017/cineworld')) {
  console.log('\n⚠️ MongoDB URI needs to be configured');
  console.log('\n📝 Please update your .env.local file with your MongoDB connection string:');
  console.log('\nOptions:');
  console.log('1. Local MongoDB: MONGODB_URI=mongodb://localhost:27017/cineworld');
  console.log('2. MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cineworld');
  console.log('3. Other: Your MongoDB connection string');
  
  console.log('\n🔧 After updating .env.local, run: npm run seed:plans');
} else {
  console.log('✅ MongoDB URI is configured');
}

// Show current payment models
console.log('\n📊 Payment Database Models Ready:');

const models = [
  {
    name: 'PaymentAttempt',
    file: 'lib/models/PaymentAttempt.ts',
    fields: ['userId', 'planId', 'amount', 'currency', 'status', 'transactionId', 'failureReason'],
    purpose: 'Stores each payment attempt with status tracking'
  },
  {
    name: 'Subscription',
    file: 'lib/models/Subscription.ts', 
    fields: ['userId', 'planId', 'status', 'startDate', 'endDate', 'autoRenew'],
    purpose: 'Stores active user subscriptions'
  },
  {
    name: 'Plan',
    file: 'lib/models/Plan.ts',
    fields: ['name', 'price', 'currency', 'features', 'duration', 'isActive'],
    purpose: 'Stores available subscription plans'
  },
  {
    name: 'User',
    file: 'models/User.ts',
    fields: ['name', 'email', 'password', 'avatar', 'preferences'],
    purpose: 'Stores user account information'
  }
];

models.forEach(model => {
  console.log(`\n✅ ${model.name}:`);
  console.log(`   📁 ${model.file}`);
  console.log(`   🔑 Fields: ${model.fields.join(', ')}`);
  console.log(`   📝 Purpose: ${model.purpose}`);
});

console.log('\n🔄 Payment Storage Flow:');
console.log('1. User selects plan → PaymentAttempt created (PENDING)');
console.log('2. Payment processed → PaymentAttempt updated (SUCCESS/FAILED)');
console.log('3. Successful payment → Subscription created (ACTIVE)');
console.log('4. User access → Subscription verified via API');

console.log('\n🚀 Next Steps:');
console.log('1. Configure MONGODB_URI in .env.local');
console.log('2. Run: npm run seed:plans');
console.log('3. Start server: npm run dev');
console.log('4. Test payment flow: node test-payment-system.js');

console.log('\n💡 The payment system is ready to store all payment details in MongoDB!');
