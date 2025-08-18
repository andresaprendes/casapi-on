#!/usr/bin/env node

/**
 * Real Email Test Script
 * 
 * This script sends a real email to your actual email address
 * to verify the email functionality is working.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { sendOrderConfirmation, sendPaymentStatusEmail } from '../server/emailService.js';

// Real test data with your actual email
const realOrderData = {
  orderNumber: 'TEST-001',
  createdAt: new Date().toISOString(),
  paymentStatus: 'pending',
  total: 150000,
  shippingZone: 'Bogotá',
  estimatedDelivery: '15-20 días',
  items: [
    { name: 'Mesa de Piñón Artesanal', price: 150000, quantity: 1 }
  ],
  customer: {
    name: 'Andrés Mesa',
    email: 'camm89@hotmail.com',
    phone: '3007327978',
    address: {
      street: 'Calle 123 #45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110111',
      country: 'Colombia'
    }
  }
};

const realCustomerInfo = {
  name: 'Andrés Mesa',
  email: 'camm89@hotmail.com',
  phone: '3007327978',
  address: 'Calle 123 #45-67, Bogotá, Cundinamarca'
};

async function testRealEmail() {
  console.log('🧪 Testing Real Email Service...\n');
  console.log('📧 Sending test email to: camm89@hotmail.com\n');
  
  try {
    // Test 1: Order confirmation email
    console.log('📧 Test 1: Order confirmation email');
    const email1 = await sendOrderConfirmation(realOrderData, realCustomerInfo);
    console.log('✅ Result:', email1.success ? 'Success' : 'Failed');
    if (email1.success) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', email1.messageId);
      console.log('📧 Check your inbox at camm89@hotmail.com');
    } else {
      console.log('❌ Error:', email1.error);
    }
    console.log('');
    
    // Wait 2 seconds before sending the second email
    console.log('⏳ Waiting 2 seconds before sending payment status email...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Payment status email - approved
    console.log('📧 Test 2: Payment status email - approved');
    const email2 = await sendPaymentStatusEmail(
      realOrderData, 
      realCustomerInfo, 
      { 
        id: 'MP-TEST-123', 
        payment_method_id: 'credit_card', 
        date_created: new Date().toISOString(), 
        transaction_amount: 150000 
      },
      'approved'
    );
    console.log('✅ Result:', email2.success ? 'Success' : 'Failed');
    if (email2.success) {
      console.log('✅ Payment status email sent successfully!');
      console.log('📧 Message ID:', email2.messageId);
      console.log('📧 Check your inbox at camm89@hotmail.com');
    } else {
      console.log('❌ Error:', email2.error);
    }
    console.log('');
    
    console.log('🎉 Real email testing completed!');
    console.log('📧 Please check your email at camm89@hotmail.com');
    console.log('📧 Check both your inbox and spam folder');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRealEmail();
