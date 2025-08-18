#!/usr/bin/env node

/**
 * Test script to verify duplicate email prevention
 * This script tests that only one email is sent per order cancellation
 */

const API_URL = 'https://casa-pinon-backend-production.up.railway.app';

async function testDuplicatePrevention() {
  console.log('🧪 Testing Duplicate Email Prevention...\n');
  
  const testOrderNumber = 'TEST-DUPLICATE-' + Date.now();
  const testCustomerInfo = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '3001234567',
    address: {}
  };

  console.log('📧 Test order number:', testOrderNumber);
  console.log('📧 Test customer email:', testCustomerInfo.email);

  try {
    // First cancellation request
    console.log('\n📧 Test 1: First cancellation request...');
    const response1 = await fetch(`${API_URL}/api/mercadopago/payment-cancelled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        customerInfo: testCustomerInfo,
        reason: 'user_cancelled'
      })
    });

    const result1 = await response1.json();
    console.log('📥 Response 1:', result1);
    console.log('📧 Email sent:', result1.emailSent);
    console.log('📧 Already sent:', result1.alreadySent || false);

    // Second cancellation request (should be prevented)
    console.log('\n📧 Test 2: Second cancellation request (should be prevented)...');
    const response2 = await fetch(`${API_URL}/api/mercadopago/payment-cancelled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        customerInfo: testCustomerInfo,
        reason: 'user_cancelled'
      })
    });

    const result2 = await response2.json();
    console.log('📥 Response 2:', result2);
    console.log('📧 Email sent:', result2.emailSent);
    console.log('📧 Already sent:', result2.alreadySent || false);

    // Third cancellation request (should also be prevented)
    console.log('\n📧 Test 3: Third cancellation request (should be prevented)...');
    const response3 = await fetch(`${API_URL}/api/mercadopago/payment-cancelled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: testOrderNumber,
        customerInfo: testCustomerInfo,
        reason: 'user_cancelled'
      })
    });

    const result3 = await response3.json();
    console.log('📥 Response 3:', result3);
    console.log('📧 Email sent:', result3.emailSent);
    console.log('📧 Already sent:', result3.alreadySent || false);

    // Analysis
    console.log('\n🎯 Analysis:');
    console.log('✅ First request - Email sent:', result1.emailSent);
    console.log('✅ Second request - Already sent:', result2.alreadySent);
    console.log('✅ Third request - Already sent:', result3.alreadySent);

    if (result1.emailSent && result2.alreadySent && result3.alreadySent) {
      console.log('\n🎉 SUCCESS: Duplicate prevention is working correctly!');
      console.log('📧 Only 1 email was sent for 3 requests');
    } else {
      console.log('\n❌ FAILED: Duplicate prevention is not working correctly');
      console.log('📧 Multiple emails might have been sent');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\n🎉 Duplicate prevention testing completed!');
}

// Run the test
testDuplicatePrevention();
