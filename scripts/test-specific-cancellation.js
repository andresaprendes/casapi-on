#!/usr/bin/env node

/**
 * Specific Order Cancellation Test
 * 
 * This script tests the cancellation email for a specific order
 * that was just created during testing.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const API_URL = process.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';

async function testSpecificCancellation() {
  console.log('🧪 Testing Specific Order Cancellation...\n');
  console.log('🌐 Using API URL:', API_URL);
  
  try {
    // Get the most recent order (the one you just created)
    console.log('📧 Getting most recent order...');
    const ordersResponse = await fetch(`${API_URL}/api/orders`);
    const ordersResult = await ordersResponse.json();
    
    if (ordersResult.success && ordersResult.orders && ordersResult.orders.length > 0) {
      // Get the most recent order
      const recentOrder = ordersResult.orders[0]; // Assuming orders are sorted by date
      console.log('📋 Most recent order:', {
        id: recentOrder.id,
        orderNumber: recentOrder.order_number,
        customerEmail: recentOrder.customer_email,
        total: recentOrder.total,
        createdAt: recentOrder.created_at
      });
      
      // Test cancellation for this specific order
      console.log('\n📧 Testing cancellation for this order...');
      const customerInfo = {
        name: recentOrder.customer_name || 'Test User',
        email: recentOrder.customer_email || 'camm89@hotmail.com',
        phone: recentOrder.customer_phone || '3001234567',
        address: recentOrder.customer_address || 'Test Address'
      };
      
      const cancellationResponse = await fetch(`${API_URL}/api/mercadopago/payment-cancelled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber: recentOrder.order_number,
          customerInfo,
          reason: 'user_cancelled'
        })
      });
      
      console.log('📥 Cancellation API response status:', cancellationResponse.status);
      const cancellationResult = await cancellationResponse.json();
      console.log('📥 Cancellation API response:', cancellationResult);
      
      if (cancellationResult.success) {
        console.log('✅ Cancellation email triggered successfully for order:', recentOrder.order_number);
        console.log('📧 Email sent to:', recentOrder.customer_email);
        console.log('📧 Check your inbox at:', recentOrder.customer_email);
      } else {
        console.log('❌ Failed to trigger cancellation email:', cancellationResult.error);
      }
      
    } else {
      console.log('❌ No orders found in database');
    }
    
  } catch (error) {
    console.error('❌ Error testing specific cancellation:', error);
  }
  
  console.log('\n🎉 Specific cancellation testing completed!');
}

// Run the test
testSpecificCancellation();
