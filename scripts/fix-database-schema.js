import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Check current table structure
    console.log('📋 Checking current orders table structure...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:', tableInfo.rows.map(row => row.column_name));
    
    // Add missing columns
    const requiredColumns = [
      { name: 'customer_name', type: 'VARCHAR(255)', nullable: 'NOT NULL' },
      { name: 'customer_email', type: 'VARCHAR(255)', nullable: 'NOT NULL' },
      { name: 'customer_phone', type: 'VARCHAR(50)', nullable: 'NULL' },
      { name: 'customer_address', type: 'JSONB', nullable: 'NOT NULL' },
      { name: 'items', type: 'JSONB', nullable: 'NOT NULL' },
      { name: 'subtotal', type: 'DECIMAL(10,2)', nullable: 'NOT NULL' },
      { name: 'shipping', type: 'DECIMAL(10,2)', nullable: 'DEFAULT 0' },
      { name: 'tax', type: 'DECIMAL(10,2)', nullable: 'DEFAULT 0' },
      { name: 'total', type: 'DECIMAL(10,2)', nullable: 'NOT NULL' },
      { name: 'status', type: 'VARCHAR(50)', nullable: 'DEFAULT \'pending\'' },
      { name: 'payment_status', type: 'VARCHAR(50)', nullable: 'DEFAULT \'pending\'' },
      { name: 'payment_method', type: 'VARCHAR(50)', nullable: 'DEFAULT \'mercadopago\'' },
      { name: 'payment_id', type: 'VARCHAR(100)', nullable: 'NULL' },
      { name: 'shipping_zone', type: 'VARCHAR(100)', nullable: 'NULL' },
      { name: 'notes', type: 'TEXT', nullable: 'NULL' },
      { name: 'estimated_delivery', type: 'VARCHAR(100)', nullable: 'NULL' },
      { name: 'abandoned_at', type: 'TIMESTAMP', nullable: 'NULL' },
      { name: 'retry_count', type: 'INTEGER', nullable: 'DEFAULT 0' },
      { name: 'last_payment_attempt', type: 'TIMESTAMP', nullable: 'NULL' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: 'DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: 'DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    const existingColumns = tableInfo.rows.map(row => row.column_name);
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adding missing column: ${column.name}`);
        try {
          await pool.query(`ALTER TABLE orders ADD COLUMN ${column.name} ${column.type} ${column.nullable}`);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          console.log(`⚠️ Error adding column ${column.name}:`, error.message);
        }
      } else {
        console.log(`✅ Column exists: ${column.name}`);
      }
    }
    
    // Create payments table if it doesn't exist
    console.log('💳 Creating payments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(100) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        status_detail VARCHAR(100),
        external_reference VARCHAR(100),
        transaction_amount DECIMAL(10,2),
        currency_id VARCHAR(10),
        payment_method_id VARCHAR(50),
        payer_email VARCHAR(255),
        date_created TIMESTAMP,
        date_approved TIMESTAMP,
        webhook_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database schema fixed successfully!');
    
    // Test order creation
    console.log('🧪 Testing order creation...');
    const testOrder = {
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '3001234567',
        address: {
          street: 'Test St',
          city: 'Bogota',
          state: 'Cundinamarca',
          zipCode: '11001',
          country: 'Colombia'
        }
      },
      items: [{
        product: {
          id: '1',
          name: 'Test Product',
          price: 100000
        },
        quantity: 1
      }],
      total: 100000
    };
    
    const orderId = `TEST-${Date.now()}`;
    const orderData = {
      id: orderId,
      orderNumber: orderId,
      customer: testOrder.customer,
      items: testOrder.items,
      subtotal: 100000,
      shipping: 0,
      tax: 0,
      total: 100000,
      shippingZone: 'other',
      paymentMethod: 'mercadopago',
      notes: 'Test order',
      estimatedDelivery: '5-7 días',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Insert test order
    const insertQuery = `
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        customer_address, items, subtotal, shipping, tax, total,
        shipping_zone, payment_method, notes, estimated_delivery, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    
    const values = [
      orderData.id,
      orderData.orderNumber,
      orderData.customer.name,
      orderData.customer.email,
      orderData.customer.phone,
      JSON.stringify(orderData.customer.address),
      JSON.stringify(orderData.items),
      orderData.subtotal,
      orderData.shipping,
      orderData.tax,
      orderData.total,
      orderData.shippingZone,
      orderData.paymentMethod,
      orderData.notes,
      orderData.estimatedDelivery,
      orderData.status,
      orderData.createdAt
    ];
    
    const result = await pool.query(insertQuery, values);
    console.log('✅ Test order created successfully:', result.rows[0].order_number);
    
    // Clean up test order
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    console.log('🧹 Test order cleaned up');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await pool.end();
  }
}

fixDatabaseSchema();
