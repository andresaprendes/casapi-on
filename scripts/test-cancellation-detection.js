#!/usr/bin/env node

/**
 * Test script to verify payment cancellation detection
 * This script simulates different URL parameter scenarios that MercadoPago might send
 */

const testScenarios = [
  {
    name: "User cancellation with external reference",
    params: {
      external_reference: "TEST-ORDER-123",
      collection_status: "null",
      status: "null"
    },
    expected: "user_cancelled"
  },
  {
    name: "Return to site (no parameters)",
    params: {},
    expected: "user_cancelled"
  },
  {
    name: "Abandoned payment",
    params: {
      error: "unknown",
      external_reference: "TEST-ORDER-456"
    },
    expected: "user_cancelled"
  },
  {
    name: "Explicit cancellation status",
    params: {
      collection_status: "cancelled",
      external_reference: "TEST-ORDER-789"
    },
    expected: "user_cancelled"
  },
  {
    name: "Payment failure (should not be cancellation)",
    params: {
      payment_id: "123456789",
      external_reference: "TEST-ORDER-999",
      error: "cc_rejected_insufficient_amount"
    },
    expected: "cc_rejected_insufficient_amount"
  }
];

function simulateCancellationDetection(params) {
  const paymentId = params.payment_id || null;
  const externalReference = params.external_reference || null;
  const errorCode = params.error || null;
  const collectionStatus = params.collection_status || null;
  const status = params.status || null;

  // Simulate the detection logic from CheckoutFailure.tsx
  const isUserCancellation = !paymentId && 
                            (collectionStatus === 'null' || !collectionStatus) && 
                            (status === 'null' || !status) && 
                            externalReference;
  
  const isReturnToSite = !paymentId && !externalReference && !errorCode;
  const isAbandonedPayment = errorCode === 'unknown' || errorCode === 'return_to_site';
  const isCancelledByUser = collectionStatus === 'cancelled' || status === 'cancelled';
  
  const isAnyTypeOfCancellation = isUserCancellation || isReturnToSite || isAbandonedPayment || isCancelledByUser;

  if (isAnyTypeOfCancellation) {
    return 'user_cancelled';
  }

  if (!paymentId && !externalReference) {
    return errorCode === 'unknown' || !errorCode ? 'user_cancelled' : (errorCode || 'unknown');
  }

  return errorCode || 'payment_failed';
}

console.log('🧪 Testing Payment Cancellation Detection Logic\n');

testScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   Parameters:`, scenario.params);
  
  const result = simulateCancellationDetection(scenario.params);
  const passed = result === scenario.expected;
  
  console.log(`   Expected: ${scenario.expected}`);
  console.log(`   Result:   ${result}`);
  console.log(`   Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!passed) {
    console.log(`   ❌ Test failed! Expected ${scenario.expected} but got ${result}`);
  }
});

console.log('\n🎯 Summary:');
const passedTests = testScenarios.filter((scenario, index) => {
  const result = simulateCancellationDetection(scenario.params);
  return result === scenario.expected;
}).length;

console.log(`✅ ${passedTests}/${testScenarios.length} tests passed`);

if (passedTests === testScenarios.length) {
  console.log('🎉 All cancellation detection tests passed!');
} else {
  console.log('⚠️  Some tests failed. Check the logic above.');
}
