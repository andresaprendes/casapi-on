#!/usr/bin/env node

/**
 * Payment Verification Test Script
 * 
 * This script tests the payment verification endpoints to ensure they're working correctly.
 * Run with: node scripts/test-payment-verification.js
 */

const API_URL = process.env.API_URL || 'https://casa-pinon-backend-production.up.railway.app';

// Test data
const testCases = [
  {
    name: 'Test Order Verification',
    endpoint: '/api/mercadopago/verify-payment/ORD-TEST-123',
    method: 'POST'
  },
  {
    name: 'Test Payment ID Verification',
    endpoint: '/api/mercadopago/verify-payment-by-id/123456789',
    method: 'POST'
  },
  {
    name: 'Test Order Status',
    endpoint: '/api/orders/ORD-TEST-123',
    method: 'GET'
  }
];

async function testEndpoint(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📍 Endpoint: ${API_URL}${testCase.endpoint}`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}${testCase.endpoint}`, {
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`📊 Status Code: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Error Response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`📝 Error Details: ${errorText}`);
    }
    
    return {
      success: response.ok,
      responseTime,
      statusCode: response.status
    };
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`❌ Network Error: ${error.message}`);
    console.log(`⏱️  Time to Error: ${responseTime}ms`);
    
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Payment Verification Tests');
  console.log(`🌐 API URL: ${API_URL}`);
  console.log(`🕐 Test Time: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testEndpoint(testCase);
    results.push({
      test: testCase.name,
      ...result
    });
    
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('================');
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`✅ Successful Tests: ${successfulTests}/${totalTests}`);
  console.log(`⏱️  Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.responseTime}ms`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations');
  console.log('==================');
  
  if (successfulTests === totalTests) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints are not responding correctly.');
    console.log('🔧 Check server logs and database connectivity.');
  }
  
  if (averageResponseTime > 5000) {
    console.log('⚠️  Response times are slow (>5s). Consider optimizing.');
  } else {
    console.log('✅ Response times are acceptable.');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Test with real payment data');
  console.log('2. Monitor webhook delivery');
  console.log('3. Check database updates');
  console.log('4. Verify email notifications');
}

// Run tests
runTests().catch(console.error);

export { testEndpoint, runTests };
