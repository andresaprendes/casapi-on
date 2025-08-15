const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Drop and recreate orders table to fix schema issues
    // Create orders table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        customer_address JSONB NOT NULL,
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'mercadopago',
        payment_id VARCHAR(100),
        shipping_zone VARCHAR(100),
        notes TEXT,
        estimated_delivery VARCHAR(100),
        abandoned_at TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        last_payment_attempt TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to orders table if they don't exist
    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMP`);
    } catch (error) {
      // Column might already exist
    }
    
    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist
    }
    
    try {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_payment_attempt TIMESTAMP`);
    } catch (error) {
      // Column might already exist
    }

    // Create products table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        images JSONB,
        materials JSONB,
        dimensions JSONB,
        weight DECIMAL(8,2),
        in_stock BOOLEAN DEFAULT TRUE,
        is_custom BOOLEAN DEFAULT FALSE,
        estimated_delivery VARCHAR(100),
        features JSONB,
        specifications JSONB,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to products table if they don't exist
    try {
      await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist
    }

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(100) PRIMARY KEY,
        order_id VARCHAR(50) REFERENCES orders(id),
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

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        images JSONB,
        materials JSONB,
        dimensions JSONB,
        weight DECIMAL(8,2),
        in_stock BOOLEAN DEFAULT TRUE,
        is_custom BOOLEAN DEFAULT FALSE,
        estimated_delivery VARCHAR(100),
        features JSONB,
        specifications JSONB,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Helper function to update updated_at timestamp
const updateTimestamp = async (table, id) => {
  try {
    await pool.query(
      `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
  } catch (error) {
    console.error(`Error updating timestamp for ${table}:`, error);
  }
};

module.exports = {
  pool,
  initializeDatabase,
  updateTimestamp
};
