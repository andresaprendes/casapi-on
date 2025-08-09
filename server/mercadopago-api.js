const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-webhook-secret';
console.log('Initializing MercadoPago with token:', MERCADOPAGO_ACCESS_TOKEN ? MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...' : 'NONE');

// In-memory payment storage (in production, use a real database)
const paymentDatabase = new Map();

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
        success: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`,
        failure: `${BASE_URL}/checkout?payment_status=failure&external_reference={external_reference}`,
        pending: `${BASE_URL}/checkout?payment_status=pending&external_reference={external_reference}`
      },
      notification_url: `${API_URL}/api/mercadopago/webhook`,
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
    
    if (result && result.id) {
      // Direct response structure (MercadoPago Colombia format)
      preferenceId = result.id;
      initPoint = result.init_point;
      sandboxInitPoint = result.sandbox_init_point;
    } else if (result && result.body && result.body.id) {
      // Standard response structure
      preferenceId = result.body.id;
      initPoint = result.body.init_point;
      sandboxInitPoint = result.body.sandbox_init_point;
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

// 2. Get payment status and verify payment (secure dual verification)
app.get('/api/mercadopago/payment-status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    console.log('Payment verification requested for ID:', paymentId);

    // First check our database (webhook verified payments)
    const storedPayment = paymentDatabase.get(paymentId.toString());
    if (storedPayment && storedPayment.webhook_verified) {
      console.log('✅ Payment found in database (webhook verified):', storedPayment.status);
      
      const isApproved = storedPayment.status === 'approved';
      const isPending = storedPayment.status === 'pending';
      const isRejected = storedPayment.status === 'rejected' || storedPayment.status === 'cancelled';

      return res.json({
        success: true,
        payment: storedPayment,
        verification: {
          is_approved: isApproved,
          is_pending: isPending,
          is_rejected: isRejected,
          message: getPaymentStatusMessage(storedPayment.status, storedPayment.status_detail),
          source: 'webhook_verified'
        }
      });
    }

    // Fallback: Verify with MercadoPago API directly
    console.log('⚠️ Payment not in database, verifying with MercadoPago API...');
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    console.log('API Payment verification:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount
    });

    // Store in database for future requests
    const paymentRecord = {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
      currency_id: payment.currency_id,
      payment_method_id: payment.payment_method_id,
      payer_email: payment.payer?.email,
      date_created: payment.date_created,
      date_approved: payment.date_approved,
      last_updated: new Date().toISOString(),
      webhook_verified: false
    };
    
    paymentDatabase.set(paymentId.toString(), paymentRecord);

    const isApproved = payment.status === 'approved';
    const isPending = payment.status === 'pending';
    const isRejected = payment.status === 'rejected' || payment.status === 'cancelled';

    res.json({
      success: true,
      payment: paymentRecord,
      verification: {
        is_approved: isApproved,
        is_pending: isPending,
        is_rejected: isRejected,
        message: getPaymentStatusMessage(payment.status, payment.status_detail),
        source: 'api_verified'
      }
    });
  } catch (error) {
    console.error('MercadoPago payment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error retrieving payment status'
    });
  }
});

// Helper function to get user-friendly payment status messages
function getPaymentStatusMessage(status, statusDetail) {
  const messages = {
    'approved': 'Pago aprobado exitosamente',
    'pending': 'Pago pendiente de procesamiento',
    'in_process': 'Pago en proceso de revisión',
    'rejected': 'Pago rechazado',
    'cancelled': 'Pago cancelado',
    'refunded': 'Pago reembolsado',
    'charged_back': 'Pago revertido'
  };

  return messages[status] || `Estado del pago: ${status} (${statusDetail})`;
}

// 3. Secure webhook for payment notifications
app.post('/api/mercadopago/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];
    
    console.log('Webhook received with signature:', signature ? 'YES' : 'NO');
    
    // Verify webhook signature (if configured)
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'your-webhook-secret') {
      if (!signature) {
        console.error('Missing webhook signature');
        return res.status(401).send('Unauthorized: Missing signature');
      }
      
      const expectedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(req.body)
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        console.error('Invalid webhook signature');
        return res.status(401).send('Unauthorized: Invalid signature');
      }
    }

    const body = JSON.parse(req.body.toString());
    const { action, api_version, data, date_created, id, live_mode, type, user_id } = body;
    
    console.log('Webhook payload:', { action, type, data, date_created });
    
    if (action === 'payment.updated' || action === 'payment.created') {
      const paymentId = data.id;
      console.log('Processing payment notification for ID:', paymentId);
      
      try {
        // Verify payment with MercadoPago API
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: paymentId });
        
        console.log('Webhook payment verification:', {
          id: payment.id,
          status: payment.status,
          external_reference: payment.external_reference,
          transaction_amount: payment.transaction_amount
        });
        
        // Store payment in our database
        const paymentRecord = {
          id: payment.id,
          status: payment.status,
          status_detail: payment.status_detail,
          external_reference: payment.external_reference,
          transaction_amount: payment.transaction_amount,
          currency_id: payment.currency_id,
          payment_method_id: payment.payment_method_id,
          payer_email: payment.payer?.email,
          date_created: payment.date_created,
          date_approved: payment.date_approved,
          last_updated: new Date().toISOString(),
          webhook_verified: true
        };
        
        paymentDatabase.set(paymentId.toString(), paymentRecord);
        console.log('Payment stored in database:', paymentId);
        
        // Log important payment events
        if (payment.status === 'approved') {
          console.log('✅ PAYMENT APPROVED:', {
            orderId: payment.external_reference,
            amount: payment.transaction_amount,
            paymentId: payment.id,
            email: payment.payer?.email
          });
        } else if (payment.status === 'rejected') {
          console.log('❌ PAYMENT REJECTED:', {
            orderId: payment.external_reference,
            paymentId: payment.id,
            reason: payment.status_detail
          });
        }
        
      } catch (verificationError) {
        console.error('Error verifying payment in webhook:', verificationError);
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook Error');
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
