#!/usr/bin/env node

/**
 * Daily Payment Verification Script
 * 
 * This script verifies all pending payments with MercadoPago
 * and updates the database with the current payment status.
 * 
 * Run this script daily using a cron job:
 * 0 6 * * * /usr/bin/node /path/to/scripts/daily-payment-verification.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
const VERIFICATION_ENDPOINT = `${API_URL}/api/mercadopago/verify-all-pending`;

async function runDailyVerification() {
  const startTime = new Date();
  console.log(`🕐 Starting daily payment verification at ${startTime.toISOString()}`);
  
  try {
    console.log(`🔍 Calling verification endpoint: ${VERIFICATION_ENDPOINT}`);
    
    const response = await fetch(VERIFICATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`✅ Daily verification completed successfully!`);
      console.log(`📊 Summary:`);
      console.log(`   - Total payments checked: ${result.summary.total}`);
      console.log(`   - Successfully verified: ${result.summary.verified}`);
      console.log(`   - Errors: ${result.summary.errors}`);
      console.log(`   - Duration: ${duration}ms`);
      
      if (result.results && result.results.length > 0) {
        console.log(`📋 Detailed results:`);
        result.results.forEach((payment, index) => {
          if (payment.success) {
            console.log(`   ${index + 1}. Payment ${payment.paymentId} (${payment.orderNumber}): ${payment.oldStatus} → ${payment.newStatus}`);
          } else {
            console.log(`   ${index + 1}. Payment ${payment.paymentId} (${payment.orderNumber}): ERROR - ${payment.error}`);
          }
        });
      }
      
      // Exit with success code
      process.exit(0);
      
    } else {
      throw new Error(result.error || 'Unknown error from verification endpoint');
    }
    
  } catch (error) {
    const endTime = new Date();
    console.error(`❌ Daily verification failed after ${endTime - startTime}ms`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack trace: ${error.stack}`);
    
    // Exit with error code
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  runDailyVerification();
}

module.exports = { runDailyVerification };
