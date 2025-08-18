import { Pool } from 'pg';

// Database configuration - using the same setup as database.js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function setupWebhookSchema() {
  try {
    console.log('🔧 Setting up webhook schema...');
    
    // Create webhook_events table
    const createWebhookEventsTable = `
      CREATE TABLE IF NOT EXISTS webhook_events (
        id SERIAL PRIMARY KEY,
        payment_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB NOT NULL,
        processed_at TIMESTAMP DEFAULT NOW(),
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await pool.query(createWebhookEventsTable);
    console.log('✅ webhook_events table created');
    
    // Add email_status column to orders table if it doesn't exist
    const addEmailStatusColumn = `
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'email_status'
        ) THEN
          ALTER TABLE orders ADD COLUMN email_status JSONB DEFAULT '{}';
        END IF;
      END $$;
    `;
    
    await pool.query(addEmailStatusColumn);
    console.log('✅ email_status column added to orders table');
    
    // Create indexes for better performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_webhook_events_payment_id ON webhook_events(payment_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);
    `;
    
    await pool.query(createIndexes);
    console.log('✅ Indexes created for webhook_events table');
    
    console.log('🎉 Webhook schema setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up webhook schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupWebhookSchema().catch(console.error);
