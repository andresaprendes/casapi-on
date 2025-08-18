#!/usr/bin/env node

/**
 * Payment Cancellation Email Test Script
 * 
 * This script tests the payment cancellation email functionality
 * to ensure cancelled payments send proper notifications.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { sendPaymentStatusEmail } from '../server/emailService.js';

// Test data for cancelled payment
const testOrderData = {
  orderNumber: 'CANCEL-TEST-001',
  createdAt: new Date().toISOString(),
  paymentStatus: 'cancelled',
  total: 50000,
  shippingZone: 'Bogotá',
  estimatedDelivery: '15-20 días',
  items: [
    { name: 'Mesa de Piñón Artesanal', price: 50000, quantity: 1 }
  ],
  customer: {
    name: 'Test User',
    email: 'camm89@hotmail.com',
    phone: '3001234567',
    address: {
      street: 'Calle Test 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110111',
      country: 'Colombia'
    }
  }
};

const testCustomerInfo = {
  name: 'Test User',
  email: 'camm89@hotmail.com',
  phone: '3001234567',
  address: 'Calle Test 123, Bogotá, Cundinamarca'
};

const testCancelledPayment = {
  id: 'MP-CANCEL-TEST-123',
  payment_method_id: 'credit_card',
  date_created: new Date().toISOString(),
  transaction_amount: 50000,
  status: 'cancelled',
  external_reference: 'CANCEL-TEST-001'
};

async function testCancellationEmail() {
  console.log('🧪 Testing Payment Cancellation Email...\n');
  console.log('📧 Sending cancellation email to: camm89@hotmail.com\n');
  
  try {
    // Test 1: User cancelled payment
    console.log('📧 Test 1: User cancelled payment email');
    const email1 = await sendPaymentStatusEmail(
      testOrderData, 
      testCustomerInfo, 
      testCancelledPayment, 
      'cancelled'
    );
    console.log('✅ Result:', email1.success ? 'Success' : 'Failed');
    if (email1.success) {
      console.log('✅ Cancellation email sent successfully!');
      console.log('📧 Message ID:', email1.messageId);
      console.log('📧 Check your inbox at camm89@hotmail.com');
    } else {
      console.log('❌ Error:', email1.error);
    }
    console.log('');
    
    // Test 2: Payment rejected by system
    console.log('📧 Test 2: Payment rejected by system email');
    const email2 = await sendPaymentStatusEmail(
      testOrderData, 
      testCustomerInfo, 
      { ...testCancelledPayment, status: 'rejected' }, 
      'rejected'
    );
    console.log('✅ Result:', email2.success ? 'Success' : 'Failed');
    if (email2.success) {
      console.log('✅ Rejection email sent successfully!');
      console.log('📧 Message ID:', email2.messageId);
      console.log('📧 Check your inbox at camm89@hotmail.com');
    } else {
      console.log('❌ Error:', email2.error);
    }
    console.log('');
    
    console.log('🎉 Payment cancellation email testing completed!');
    console.log('📧 Please check your email at camm89@hotmail.com');
    console.log('📧 Check both your inbox and spam folder');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCancellationEmail();
