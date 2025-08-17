#!/usr/bin/env node

// Load environment variables - try local first, then production
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' });

// Debug environment variables
console.log('🔍 Environment check:');
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 PORT:', process.env.PORT);

const app = require('./mercadopago-api');

const PORT = process.env.PORT || 3001;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Import the startServer function from mercadopago-api
const { startServer } = require('./mercadopago-api');

// Start server with proper initialization
startServer();
