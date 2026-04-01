const testPaymentSystem = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Payment System End-to-End\n');
  
  // Test 1: Check if server is running
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await fetch(`${baseURL}/api/plans`);
    if (response.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }
  } catch (error) {
    console.log('❌ Server connection failed:', error.message);
    return;
  }

  // Test 2: Get available plans
  console.log('\n2️⃣ Testing plans endpoint...');
  try {
    const plansResponse = await fetch(`${baseURL}/api/plans`);
    const plans = await plansResponse.json();
    
    if (plansResponse.ok && plans.length > 0) {
      console.log('✅ Plans endpoint working');
      console.log('Available plans:', plans.map(p => `${p.name}: ₹${p.price}`));
      const testPlan = plans[0];
      
      // Test 3: Create subscription
      console.log('\n3️⃣ Testing subscription creation...');
      const subscribeResponse = await fetch(`${baseURL}/api/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: testPlan._id
        })
      });
      
      const subscribeData = await subscribeResponse.json();
      
      if (subscribeResponse.ok) {
        console.log('✅ Subscription creation initiated');
        console.log('Payment ID:', subscribeData.paymentId);
        console.log('Amount:', subscribeData.amount);
        
        const paymentId = subscribeData.paymentId;
        
        // Test 4: Simulate successful payment
        console.log('\n4️⃣ Testing payment success...');
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
          console.log('✅ Payment success processed');
          console.log('Subscription created:', successData.subscription);
          
          // Test 5: Check access
          console.log('\n5️⃣ Testing access check...');
          const accessResponse = await fetch(`${baseURL}/api/access/check`);
          const accessData = await accessResponse.json();
          
          if (accessResponse.ok && accessData.success) {
            console.log('✅ Access check working');
            console.log('Has access:', accessData.access.hasAccess);
            console.log('Plan:', accessData.access.plan);
            console.log('Features:', accessData.access.allowedFeatures);
          } else {
            console.log('❌ Access check failed:', accessData.error || accessData.reason);
          }
          
        } else {
          console.log('❌ Payment success failed:', successData.error);
        }
        
      } else {
        console.log('❌ Subscription creation failed:', subscribeData.error);
      }
      
    } else {
      console.log('❌ Plans endpoint failed or no plans available');
    }
  } catch (error) {
    console.log('❌ Plans test failed:', error.message);
  }

  // Test 6: Test payment failure flow
  console.log('\n6️⃣ Testing payment failure flow...');
  try {
    // First create a new payment
    const plansResponse = await fetch(`${baseURL}/api/plans`);
    const plans = await plansResponse.json();
    const testPlan = plans[0];
    
    const subscribeResponse = await fetch(`${baseURL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: testPlan._id
      })
    });
    
    const subscribeData = await subscribeResponse.json();
    const paymentId = subscribeData.paymentId;
    
    // Now simulate failure
    const failureResponse = await fetch(`${baseURL}/api/payment/failure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: paymentId,
        failureReason: 'Test payment failure'
      })
    });
    
    const failureData = await failureResponse.json();
    
    if (failureResponse.ok) {
      console.log('✅ Payment failure processed');
      console.log('Retry allowed:', failureData.retryAllowed);
    } else {
      console.log('❌ Payment failure processing failed:', failureData.error);
    }
    
  } catch (error) {
    console.log('❌ Payment failure test failed:', error.message);
  }

  console.log('\n🎯 Payment System Test Complete!');
};

// Run the test
testPaymentSystem().catch(console.error);
