const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkOrdersStatus() {
  try {
    console.log('🔍 Checking orders in database...\n');
    
    // Get all orders with payment details
    const query = `
      SELECT 
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.total,
        o.payment_status,
        o.payment_method,
        o.created_at,
        o.updated_at,
        p.id as payment_id,
        p.status as payment_status_mp,
        p.date_created as payment_date_created,
        p.status_detail,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 as minutes_since_creation,
        EXTRACT(EPOCH FROM (NOW() - p.date_created))/60 as minutes_since_payment
      FROM orders o
      LEFT JOIN payments p ON o.order_number = p.external_reference
      ORDER BY o.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No orders found in database');
      return;
    }
    
    console.log(`📊 Found ${result.rows.length} orders:\n`);
    
    const now = new Date();
    let pendingCount = 0;
    let timeoutCount = 0;
    
    result.rows.forEach((order, index) => {
      const minutesSinceCreation = Math.round(order.minutes_since_creation || 0);
      const minutesSincePayment = Math.round(order.minutes_since_payment || 0);
      const timeoutLimit = order.payment_method === 'pse' ? 45 : 20;
      const shouldHaveTimedOut = order.payment_status === 'pending' && minutesSincePayment > timeoutLimit;
      
      console.log(`📦 Order ${index + 1}:`);
      console.log(`   Order Number: ${order.order_number}`);
      console.log(`   Customer: ${order.customer_name} (${order.customer_email})`);
      console.log(`   Total: $${order.total?.toLocaleString() || 'N/A'}`);
      console.log(`   Order Status: ${order.payment_status}`);
      console.log(`   Payment Method: ${order.payment_method || 'N/A'}`);
      console.log(`   Payment ID: ${order.payment_id || 'N/A'}`);
      console.log(`   Payment Status (MP): ${order.payment_status_mp || 'N/A'}`);
      console.log(`   Created: ${order.created_at} (${minutesSinceCreation} minutes ago)`);
      console.log(`   Payment Date: ${order.payment_date_created || 'N/A'} (${minutesSincePayment} minutes ago)`);
      console.log(`   Timeout Limit: ${timeoutLimit} minutes`);
      console.log(`   Should Timeout: ${shouldHaveTimedOut ? 'YES ⚠️' : 'No'}`);
      
      if (order.payment_status === 'pending') {
        pendingCount++;
        if (shouldHaveTimedOut) {
          timeoutCount++;
          console.log(`   ⚠️  TIMEOUT OVERDUE: ${minutesSincePayment - timeoutLimit} minutes past limit!`);
        }
      }
      
      console.log('');
    });
    
    // Summary
    console.log('📈 SUMMARY:');
    console.log(`   Total Orders: ${result.rows.length}`);
    console.log(`   Pending Orders: ${pendingCount}`);
    console.log(`   Orders Past Timeout: ${timeoutCount}`);
    
    if (timeoutCount > 0) {
      console.log('\n⚠️  ORDERS THAT SHOULD BE TIMED OUT:');
      result.rows.forEach((order, index) => {
        const minutesSincePayment = Math.round(order.minutes_since_payment || 0);
        const timeoutLimit = order.payment_method === 'pse' ? 45 : 20;
        const shouldHaveTimedOut = order.payment_status === 'pending' && minutesSincePayment > timeoutLimit;
        
        if (shouldHaveTimedOut) {
          console.log(`   - ${order.order_number}: ${minutesSincePayment} minutes (${timeoutLimit} min limit)`);
        }
      });
    }
    
    // Check if cleanup process is working
    console.log('\n🔧 SYSTEM STATUS:');
    console.log(`   Current Time: ${now.toISOString()}`);
    console.log(`   Cleanup Interval: Every 15 minutes`);
    console.log(`   PSE Timeout: 45 minutes`);
    console.log(`   Other Timeout: 20 minutes`);
    
  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkOrdersStatus();
