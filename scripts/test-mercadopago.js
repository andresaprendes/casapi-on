#!/usr/bin/env node

/**
 * MercadoPago API Test Script
 * 
 * This script tests the MercadoPago API configuration
 * to identify any issues with the integration.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY;

async function testMercadoPagoAPI() {
  console.log('🧪 Testing MercadoPago API Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('✅ MERCADOPAGO_ACCESS_TOKEN:', MERCADOPAGO_ACCESS_TOKEN ? 'SET' : 'NOT SET');
  console.log('✅ MERCADOPAGO_PUBLIC_KEY:', MERCADOPAGO_PUBLIC_KEY ? 'SET' : 'NOT SET');
  
  if (MERCADOPAGO_ACCESS_TOKEN) {
    console.log('🔍 Token starts with:', MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...');
    console.log('🔍 Token type:', MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-') ? 'Production' : 
                MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') ? 'Test' : 'Unknown');
  }
  
  console.log('');
  
  // Test 1: Check if we can create a preference
  console.log('📧 Test 1: Creating payment preference...');
  try {
    const preferenceData = {
      items: [
        {
          title: "Test Product",
          unit_price: 100,
          quantity: 1,
        }
      ],
      payer: {
        email: "test@example.com",
        name: "Test User"
      },
      back_urls: {
        success: "https://casapi-on-production.up.railway.app/success",
        failure: "https://casapi-on-production.up.railway.app/failure",
        pending: "https://casapi-on-production.up.railway.app/pending"
      },
      auto_return: "approved",
      external_reference: "TEST-" + Date.now()
    };
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Preference created successfully!');
      console.log('🔗 Init Point:', result.init_point);
      console.log('🆔 Preference ID:', result.id);
      console.log('');
      
      // Test 2: Check payment methods
      console.log('📧 Test 2: Getting payment methods...');
      const methodsResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      if (methodsResponse.ok) {
        const methods = await methodsResponse.json();
        console.log('✅ Payment methods retrieved successfully!');
        console.log('📊 Available methods:', methods.length);
        console.log('💳 Sample methods:', methods.slice(0, 3).map(m => m.name).join(', '));
      } else {
        console.log('❌ Failed to get payment methods:', methodsResponse.status);
      }
      
    } else {
      const error = await response.text();
      console.log('❌ Failed to create preference:', response.status);
      console.log('❌ Error details:', error);
    }
    
  } catch (error) {
    console.log('❌ Error testing MercadoPago API:', error.message);
  }
  
  console.log('');
  console.log('🎉 MercadoPago API testing completed!');
}

// Run the test
testMercadoPagoAPI();
