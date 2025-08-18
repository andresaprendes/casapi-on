#!/usr/bin/env node

/**
 * Payment Cancellation Flow Test Script
 * 
 * This script tests the complete cancellation flow to identify
 * where the issue might be occurring.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const API_URL = process.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';

async function testCancellationFlow() {
  console.log('🧪 Testing Payment Cancellation Flow...\n');
  console.log('🌐 Using API URL:', API_URL);
  
  try {
    // Test 1: Check if we can get orders
    console.log('📧 Test 1: Getting orders from database...');
    const ordersResponse = await fetch(`${API_URL}/api/orders`);
    const ordersResult = await ordersResponse.json();
    
    if (ordersResult.success && ordersResult.orders && ordersResult.orders.length > 0) {
      console.log('✅ Orders found:', ordersResult.orders.length);
      const firstOrder = ordersResult.orders[0];
      console.log('📋 Sample order:', {
        id: firstOrder.id,
        orderNumber: firstOrder.order_number,
        customerEmail: firstOrder.customer_email
      });
      
      // Test 2: Try to get a specific order
      console.log('\n📧 Test 2: Getting specific order...');
      const orderResponse = await fetch(`${API_URL}/api/orders/${firstOrder.order_number}`);
      const orderResult = await orderResponse.json();
      
      if (orderResult.success && orderResult.order) {
        console.log('✅ Order found successfully');
        console.log('📋 Order details:', {
          orderNumber: orderResult.order.order_number,
          customerEmail: orderResult.order.customer_email,
          total: orderResult.order.total
        });
        
        // Test 3: Simulate cancellation email
        console.log('\n📧 Test 3: Simulating cancellation email...');
        const customerInfo = {
          name: orderResult.order.customer_name || 'Test User',
          email: orderResult.order.customer_email || 'camm89@hotmail.com',
          phone: orderResult.order.customer_phone || '3001234567',
          address: orderResult.order.customer_address || 'Test Address'
        };
        
        const cancellationResponse = await fetch(`${API_URL}/api/mercadopago/payment-cancelled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNumber: orderResult.order.order_number,
            customerInfo,
            reason: 'user_cancelled'
          })
        });
        
        console.log('📥 Cancellation API response status:', cancellationResponse.status);
        const cancellationResult = await cancellationResponse.json();
        console.log('📥 Cancellation API response:', cancellationResult);
        
        if (cancellationResult.success) {
          console.log('✅ Cancellation email triggered successfully');
          console.log('📧 Email sent:', cancellationResult.emailSent);
        } else {
          console.log('❌ Failed to trigger cancellation email:', cancellationResult.error);
        }
        
      } else {
        console.log('❌ Failed to get specific order:', orderResult.error);
      }
      
    } else {
      console.log('❌ No orders found in database');
      console.log('📋 Orders result:', ordersResult);
    }
    
  } catch (error) {
    console.error('❌ Error testing cancellation flow:', error);
  }
  
  console.log('\n🎉 Cancellation flow testing completed!');
}

// Run the test
testCancellationFlow();
