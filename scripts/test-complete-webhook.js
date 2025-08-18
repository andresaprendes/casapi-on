import fetch from 'node-fetch';

const API_URL = 'https://casa-pinon-backend-production.up.railway.app';

// Test all webhook event types
async function testCompleteWebhook() {
  console.log('🧪 Testing complete webhook implementation...\n');

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
      name: 'Payment Updated',
      type: 'payment.updated',
      data: {
        id: 'test-payment-123',
        external_reference: 'CP-TEST-123',
        status: 'approved',
        transaction_amount: 50000
      }
    },
    {
      name: 'Payment Pending',
      type: 'payment.pending',
      data: {
        id: 'test-payment-456',
        external_reference: 'CP-TEST-456',
        status: 'pending',
        transaction_amount: 30000
      }
    },
    {
      name: 'Payment Approved',
      type: 'payment.approved',
      data: {
        id: 'test-payment-789',
        external_reference: 'CP-TEST-789',
        status: 'approved',
        transaction_amount: 75000
      }
    },
    {
      name: 'Payment Rejected',
      type: 'payment.rejected',
      data: {
        id: 'test-payment-101',
        external_reference: 'CP-TEST-101',
        status: 'rejected',
        transaction_amount: 25000
      }
    },
    {
      name: 'Payment Cancelled',
      type: 'payment.cancelled',
      data: {
        id: 'test-payment-202',
        external_reference: 'CP-TEST-202',
        status: 'cancelled',
        transaction_amount: 40000
      }
    },
    {
      name: 'Payment Refunded',
      type: 'payment.refunded',
      data: {
        id: 'test-payment-303',
        external_reference: 'CP-TEST-303',
        status: 'refunded',
        transaction_amount: 60000
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📤 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_URL}/api/mercadopago/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: testCase.type,
          data: testCase.data
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${testCase.name}: Success`);
        console.log(`   Event: ${result.event.type} - Payment ID: ${result.event.paymentId}`);
        console.log(`   Timestamp: ${result.timestamp}`);
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

  console.log('🎉 Complete webhook testing finished!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up database schema: node scripts/setup-webhook-schema-production.js');
  console.log('2. Configure MercadoPago webhook URL in their dashboard');
  console.log('3. Test with real payment events');
}

// Run tests
testCompleteWebhook().catch(console.error);
