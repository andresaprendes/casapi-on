import fetch from 'node-fetch';

const API_URL = 'https://casa-pinon-backend-production.up.railway.app';

// Test webhook endpoint with different payment events
async function testWebhookImplementation() {
  console.log('🧪 Testing MercadoPago webhook implementation...\n');

  const testCases = [
    {
      name: 'Payment Created',
      type: 'payment.created',
      data: {
        id: 'test-payment-123',
        external_reference: 'CP-TEST-123',
        status: 'pending',
        transaction_amount: 50000
      }
    },
    {
      name: 'Payment Approved',
      type: 'payment.approved',
      data: {
        id: 'test-payment-123',
        external_reference: 'CP-TEST-123',
        status: 'approved',
        transaction_amount: 50000
      }
    },
    {
      name: 'Payment Rejected',
      type: 'payment.rejected',
      data: {
        id: 'test-payment-123',
        external_reference: 'CP-TEST-123',
        status: 'rejected',
        transaction_amount: 50000
      }
    },
    {
      name: 'Payment Cancelled',
      type: 'payment.cancelled',
      data: {
        id: 'test-payment-123',
        external_reference: 'CP-TEST-123',
        status: 'cancelled',
        transaction_amount: 50000
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📤 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_URL}/api/mercadopago/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': 'test-signature',
          'x-timestamp': new Date().toISOString()
        },
        body: JSON.stringify({
          type: testCase.type,
          data: testCase.data
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${testCase.name}: Success`);
        console.log(`   Response:`, result);
      } else {
        console.log(`❌ ${testCase.name}: Failed`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error:`, result);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Error`);
      console.log(`   Error:`, error.message);
    }
    
    console.log('');
  }

  console.log('🎉 Webhook testing completed!');
}

// Test webhook endpoint availability
async function testWebhookEndpoint() {
  console.log('🔍 Testing webhook endpoint availability...\n');
  
  try {
    const response = await fetch(`${API_URL}/api/mercadopago/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'test',
        data: { id: 'test' }
      })
    });

    console.log(`📡 Webhook endpoint status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Webhook endpoint is protected (requires signature)');
    } else if (response.status === 400) {
      console.log('✅ Webhook endpoint is working (invalid payload rejected)');
    } else {
      console.log('⚠️  Unexpected response from webhook endpoint');
    }
    
  } catch (error) {
    console.log('❌ Webhook endpoint not accessible:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting webhook implementation tests...\n');
  
  await testWebhookEndpoint();
  console.log('');
  await testWebhookImplementation();
}

runTests().catch(console.error);
