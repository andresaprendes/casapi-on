const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment, PaymentMethod } = require('mercadopago');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://casapi-on-production.up.railway.app',
    'https://casa-pinon-backend-production.up.railway.app',
    'https://*.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MercadoPago Configuration
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-12345678-1234-1234-1234-123456789012';
console.log('Initializing MercadoPago with token:', MERCADOPAGO_ACCESS_TOKEN ? MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...' : 'NONE');

const client = new MercadoPagoConfig({ 
  accessToken: MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 10000
  }
});

// Environment variables for URLs
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// 1. Create payment preference
app.post('/api/mercadopago/create-preference', async (req, res) => {
  try {
    const {
      amount,
      orderId,
      customerEmail,
      customerName,
      description
    } = req.body;

    // Validate required fields
    if (!amount || !orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, orderId, customerEmail'
      });
    }

    // Create preference for MercadoPago Colombia production
    const preference = {
      items: [
        {
          title: description || `Orden ${orderId} - Casa Piñón Ebanistería`,
          unit_price: Number(amount),
          quantity: 1,
          currency_id: 'COP'
        }
      ],
      payer: {
        email: customerEmail
      },
      external_reference: orderId,
      back_urls: {
        success: `${BASE_URL}/checkout/success`,
        failure: `${BASE_URL}/checkout`,
        pending: `${BASE_URL}/checkout`
      },
      auto_return: 'approved',
      expires: false,
      marketplace_fee: 0
    };

    console.log('Creating MercadoPago preference:', {
      amount,
      orderId,
      customerEmail,
      customerName,
      description
    });

    console.log('MercadoPago Access Token:', MERCADOPAGO_ACCESS_TOKEN ? 'SET' : 'NOT SET');
    console.log('Token starts with:', MERCADOPAGO_ACCESS_TOKEN ? MERCADOPAGO_ACCESS_TOKEN.substring(0, 10) + '...' : 'N/A');

    // Test token validity first
    try {
      const paymentMethodClient = new PaymentMethod(client);
      console.log('PaymentMethod client created successfully');
      // Skip validation for now and proceed with preference creation
    } catch (tokenError) {
      console.error('Token validation failed:', tokenError.message);
      // Don't throw error, let's try creating preference directly
    }

    console.log('Preference object:', JSON.stringify(preference, null, 2));

    const preferenceClient = new Preference(client);
    const result = await preferenceClient.create({ body: preference });

    console.log('MercadoPago API response:', JSON.stringify(result, null, 2));
    console.log('Response body:', result.body);
    console.log('Response keys:', Object.keys(result || {}));
    
    // Check different possible response structures
    let preferenceId = null;
    let initPoint = null;
    let sandboxInitPoint = null;
    
    if (result && result.body && result.body.id) {
      // Standard response structure
      preferenceId = result.body.id;
      initPoint = result.body.init_point;
      sandboxInitPoint = result.body.sandbox_init_point;
    } else if (result && result.id) {
      // Direct response structure
      preferenceId = result.id;
      initPoint = result.init_point;
      sandboxInitPoint = result.sandbox_init_point;
    } else if (result && result.response && result.response.id) {
      // Nested response structure
      preferenceId = result.response.id;
      initPoint = result.response.init_point;
      sandboxInitPoint = result.response.sandbox_init_point;
    }
    
    if (preferenceId) {
      res.json({
        success: true,
        preferenceId: preferenceId,
        initPoint: initPoint,
        sandboxInitPoint: sandboxInitPoint,
        message: 'Preference created successfully'
      });
    } else {
      console.error('No preference ID found in response structure');
      throw new Error('Failed to create preference - no ID returned');
    }
  } catch (error) {
    console.error('MercadoPago preference creation error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error cause:', error.cause);
    
    // Don't let this crash the server
    try {
      res.status(500).json({
        success: false,
        error: error.message || 'Error creating payment preference',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } catch (responseError) {
      console.error('Error sending response:', responseError);
    }
  }
});

// 2. Get payment status
app.get('/api/mercadopago/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ paymentId });

    res.json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('MercadoPago payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Webhook for payment notifications
app.post('/api/mercadopago/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('MercadoPago webhook received:', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ paymentId });
      
      console.log('Payment details:', {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        amount: payment.transaction_amount
      });

      // Here you would typically:
      // 1. Update your database with payment status
      // 2. Send confirmation email to customer
      // 3. Update inventory
      // 4. Send notification to admin
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('MercadoPago webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Get available payment methods
app.get('/api/mercadopago/payment-methods', async (req, res) => {
  try {
    const paymentMethodClient = new PaymentMethod(client);
    const paymentMethods = await paymentMethodClient.list();

    res.json({
      success: true,
      paymentMethods: paymentMethods
    });
  } catch (error) {
    console.error('MercadoPago payment methods error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. Test endpoint
app.get('/api/mercadopago/test', (req, res) => {
  res.json({
    success: true,
    message: 'MercadoPago API is working',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

// Prevent process from crashing
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`MercadoPago API server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- POST /api/mercadopago/create-preference`);
  console.log(`- GET  /api/mercadopago/payment-status/:paymentId`);
  console.log(`- POST /api/mercadopago/webhook`);
  console.log(`- GET  /api/mercadopago/payment-methods`);
  console.log(`- GET  /api/mercadopago/test`);
});

module.exports = app;
