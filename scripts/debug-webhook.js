import fetch from 'node-fetch';

const API_URL = 'https://casa-pinon-backend-production.up.railway.app';

async function debugWebhook() {
  console.log('🔍 Debugging webhook endpoint...\n');
  
  // Test 1: Simple POST without headers
  console.log('📤 Test 1: Simple POST without headers');
  try {
    const response1 = await fetch(`${API_URL}/api/mercadopago/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'test',
        data: { id: 'test' }
      })
    });

    const result1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Response:`, result1);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('');
  
  // Test 2: POST with headers
  console.log('📤 Test 2: POST with headers');
  try {
    const response2 = await fetch(`${API_URL}/api/mercadopago/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'test-signature',
        'x-timestamp': new Date().toISOString()
      },
      body: JSON.stringify({
        type: 'payment.approved',
        data: {
          id: 'test-payment-123',
          external_reference: 'CP-TEST-123',
          status: 'approved',
          transaction_amount: 50000
        }
      })
    });

    const result2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Response:`, result2);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('');
  
  // Test 3: GET request
  console.log('📤 Test 3: GET request');
  try {
    const response3 = await fetch(`${API_URL}/api/mercadopago/webhook`, {
      method: 'GET'
    });

    const result3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Response:`, result3);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
  
  console.log('');
  
  // Test 4: Check if there's a different endpoint
  console.log('📤 Test 4: Check webhook-test endpoint');
  try {
    const response4 = await fetch(`${API_URL}/api/mercadopago/webhook-test`, {
      method: 'GET'
    });

    const result4 = await response4.json();
    console.log(`   Status: ${response4.status}`);
    console.log(`   Response:`, result4);
  } catch (error) {
    console.log(`   Error:`, error.message);
  }
}

debugWebhook().catch(console.error);
