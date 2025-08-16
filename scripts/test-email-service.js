#!/usr/bin/env node

/**
 * Test Email Service Script
 * 
 * This script tests the email service with various data formats
 * to ensure it handles edge cases properly.
 */

const { sendOrderConfirmation, sendPaymentStatusEmail } = require('../server/emailService');

// Test data with various formats (simulating real database responses)
const testOrderData = {
  // Test case 1: Complete data
  complete: {
    orderNumber: 'ORD-001',
    createdAt: new Date().toISOString(),
    paymentStatus: 'pending',
    total: 50000,
    shippingZone: 'Bogotá',
    estimatedDelivery: '15-20 días',
    items: [
      { name: 'Mesa de Piñón', price: 50000 }
    ],
    customer: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '3001234567',
      address: {
        street: 'Calle 123',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia'
      }
    }
  },
  
  // Test case 2: Missing data (simulating the issue you encountered)
  incomplete: {
    orderNumber: undefined,
    createdAt: 'Invalid Date',
    paymentStatus: 'failed',
    total: NaN,
    shippingZone: undefined,
    estimatedDelivery: undefined,
    items: [
      { name: undefined, price: undefined }
    ],
    customer: {
      name: 'andres mesa',
      email: 'camm89@hotmail.com',
      phone: '3007327978',
      address: '[object Object]'
    }
  },
  
  // Test case 3: Database format (snake_case)
  databaseFormat: {
    order_number: 'ORD-002',
    created_at: new Date().toISOString(),
    payment_status: 'cancelled',
    total: 75000,
    shipping_zone: 'Medellín',
    estimated_delivery: '20-25 días',
    items: [
      { name: 'Silla de Piñón', price: 75000 }
    ],
    customer_name: 'María García',
    customer_email: 'maria@example.com',
    customer_phone: '3009876543',
    customer_address: {
      street: 'Carrera 456',
      city: 'Medellín',
      state: 'Antioquia',
      zipCode: '050001',
      country: 'Colombia'
    }
  }
};

// Test customer info in different formats
const testCustomerInfo = {
  // Format 1: Direct properties
  direct: {
    name: 'Ana López',
    email: 'ana@example.com',
    phone: '3005551234',
    address: 'Calle 789, Cali, Valle del Cauca'
  },
  
  // Format 2: Nested in customer object
  nested: {
    customer: {
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      phone: '3007778888',
      address: {
        street: 'Avenida 321',
        city: 'Barranquilla',
        state: 'Atlántico'
      }
    }
  }
};

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');
  
  try {
    // Test 1: Complete data
    console.log('📧 Test 1: Complete order data');
    const email1 = await sendOrderConfirmation(testOrderData.complete, testCustomerInfo.direct);
    console.log('✅ Result:', email1.success ? 'Success' : 'Failed');
    if (!email1.success) console.log('❌ Error:', email1.error);
    console.log('');
    
    // Test 2: Incomplete data (the issue you encountered)
    console.log('📧 Test 2: Incomplete order data (simulating your issue)');
    const email2 = await sendOrderConfirmation(testOrderData.incomplete, testCustomerInfo.direct);
    console.log('✅ Result:', email2.success ? 'Success' : 'Failed');
    if (!email2.success) console.log('❌ Error:', email2.error);
    console.log('');
    
    // Test 3: Database format data
    console.log('📧 Test 3: Database format data (snake_case)');
    const email3 = await sendOrderConfirmation(testOrderData.databaseFormat, testCustomerInfo.nested);
    console.log('✅ Result:', email3.success ? 'Success' : 'Failed');
    if (!email3.success) console.log('❌ Error:', email3.error);
    console.log('');
    
    // Test 4: Payment status email - cancelled
    console.log('📧 Test 4: Payment status email - cancelled');
    const email4 = await sendPaymentStatusEmail(
      testOrderData.databaseFormat, 
      testCustomerInfo.nested, 
      { id: 'MP-123', payment_method_id: 'credit_card', date_created: new Date().toISOString(), transaction_amount: 75000 },
      'cancelled'
    );
    console.log('✅ Result:', email4.success ? 'Success' : 'Failed');
    if (!email4.success) console.log('❌ Error:', email4.error);
    console.log('');
    
    console.log('🎉 Email service testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testEmailService();
}

module.exports = { testEmailService };
