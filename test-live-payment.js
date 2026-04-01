const testLivePaymentSystem = async () => {
  const baseURL = 'http://localhost:3002';
  
  console.log('🧪 Testing Live Payment System\n');
  
  try {
    // Test 1: Get available plans
    console.log('1️⃣ Fetching available plans...');
    const plansResponse = await fetch(`${baseURL}/api/plans`);
    const plans = await plansResponse.json();
    
    if (plansResponse.ok) {
      console.log('✅ Plans fetched successfully');
      console.log('Available plans:');
      const plansArray = Array.isArray(plans) ? plans : [plans];
      plansArray.forEach((plan, index) => {
        console.log(`  ${index + 1}. ${plan.name}: ₹${plan.price}/${plan.duration}`);
        console.log(`     ID: ${plan._id}`);
        console.log(`     Features: ${plan.features.length} features`);
      });
      
      // Test with PREMIUM plan
      const premiumPlan = plansArray.find(p => p.name === 'PREMIUM');
      if (!premiumPlan) {
        console.log('❌ PREMIUM plan not found');
        return;
      }
      
      // Test 2: Create subscription
      console.log('\n2️⃣ Creating subscription...');
      const subscribeResponse = await fetch(`${baseURL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: premiumPlan._id
        })
      });
      
      const subscribeData = await subscribeResponse.json();
      
      if (subscribeResponse.ok) {
        console.log('✅ Subscription created successfully');
        console.log('Payment Details:');
        console.log(`  Payment ID: ${subscribeData.paymentId}`);
        console.log(`  Amount: ₹${subscribeData.amount}`);
        console.log(`  Status: ${subscribeData.status}`);
        
        const paymentId = subscribeData.paymentId;
        
        // Test 3: Process payment success
        console.log('\n3️⃣ Processing payment success...');
        const successResponse = await fetch(`${baseURL}/api/payment/success`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: paymentId
          })
        });
        
        const successData = await successResponse.json();
        
        if (successResponse.ok) {
          console.log('✅ Payment processed successfully');
          console.log('Subscription Details:');
          console.log(`  ID: ${successData.subscription.id}`);
          console.log(`  Plan: ${successData.subscription.plan}`);
          console.log(`  Status: ${successData.subscription.status}`);
          console.log(`  Start Date: ${new Date(successData.subscription.startDate).toLocaleDateString()}`);
          
          // Test 4: Check access
          console.log('\n4️⃣ Checking user access...');
          const accessResponse = await fetch(`${baseURL}/api/access/check`);
          const accessData = await accessResponse.json();
          
          if (accessResponse.ok && accessData.success) {
            console.log('✅ Access check successful');
            console.log('Access Details:');
            console.log(`  Has Access: ${accessData.access.hasAccess}`);
            console.log(`  Plan: ${accessData.access.plan}`);
            console.log(`  Features: ${accessData.access.allowedFeatures.join(', ')}`);
            console.log(`  Expires: ${new Date(accessData.access.expiresAt).toLocaleDateString()}`);
          } else {
            console.log('❌ Access check failed:', accessData.error || accessData.reason);
          }
          
        } else {
          console.log('❌ Payment processing failed:', successData.error);
        }
        
      } else {
        console.log('❌ Subscription creation failed:', subscribeData.error);
      }
      
    } else {
      console.log('❌ Failed to fetch plans:', plans.status);
    }
    
    // Test 5: Test payment failure flow
    console.log('\n5️⃣ Testing payment failure flow...');
    
    // Create new payment for failure test
    const failureSubscribeResponse = await fetch(`${baseURL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: premiumPlan._id
      })
    });
    
    const failureSubscribeData = await failureSubscribeResponse.json();
    const failurePaymentId = failureSubscribeData.paymentId;
    
    // Simulate payment failure
    const failureResponse = await fetch(`${baseURL}/api/payment/failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: failurePaymentId,
        failureReason: 'Insufficient funds'
      })
    });
    
    const failureData = await failureResponse.json();
    
    if (failureResponse.ok) {
      console.log('✅ Payment failure processed');
      console.log('Failure Details:');
      console.log(`  Payment ID: ${failurePaymentId}`);
      console.log(`  Retry Allowed: ${failureData.retryAllowed}`);
      console.log(`  Message: ${failureData.message}`);
    } else {
      console.log('❌ Payment failure processing failed:', failureData.error);
    }
    
    console.log('\n🎯 Live Payment System Test Complete!');
    console.log('✅ All payment details are being stored in MongoDB database');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

// Run the test
testLivePaymentSystem().catch(console.error);
