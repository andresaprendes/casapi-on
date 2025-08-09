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
    timeout: 5000,
    idempotencyKey: 'casa-pinon-' + Date.now()
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

    // Create preference - simplified for testing
    const preference = {
      items: [
        {
          title: description || `Orden ${orderId} - Casa Piñón Ebanistería`,
          unit_price: Number(amount),
          quantity: 1
        }
      ],
      external_reference: orderId,
      back_urls: {
        success: `${BASE_URL}/checkout/success`,
        failure: `${BASE_URL}/checkout`,
        pending: `${BASE_URL}/checkout`
      }
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

    console.log('Preference object:', JSON.stringify(preference, null, 2));

    const preferenceClient = new Preference(client);
    const result = await preferenceClient.create({ body: preference });

    console.log('MercadoPago API response:', JSON.stringify(result, null, 2));

    if (result.body && result.body.id) {
      res.json({
        success: true,
        preferenceId: result.body.id,
        initPoint: result.body.init_point,
        sandboxInitPoint: result.body.sandbox_init_point,
        message: 'Preference created successfully'
      });
    } else {
      throw new Error('Failed to create preference - no ID returned');
    }
  } catch (error) {
    console.error('MercadoPago preference creation error:', error);
    console.error('Error details:', error.cause || error.response || 'No additional details');
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating payment preference'
    });
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
