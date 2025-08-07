const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Bold API Configuration
const BOLD_API_KEY = '-UZc_b5KipIwXTleez8I7YKSnYOVpJPxh2EMhiUUUXU';
const BOLD_SECRET_KEY = 'mT883fJcnT7_U2auI8JjpQ';
const BOLD_BASE_URL = 'https://integrations.api.bold.co';

// Helper function to make Bold API calls
async function callBoldAPI(endpoint, method = 'GET', data = null) {
  try {
    const url = `${BOLD_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `x-api-key ${BOLD_API_KEY}`
    };

    const options = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return {
      success: response.ok,
      data: result,
      status: response.status
    };
  } catch (error) {
    console.error('Bold API Error:', error);
    return {
      success: false,
      error: error.message,
      status: 500
    };
  }
}

// 1. Get available payment methods
app.get('/api/bold/payment-methods', async (req, res) => {
  try {
    const result = await callBoldAPI('/payments/payment-methods');
    
    if (result.success) {
      res.json({
        success: true,
        paymentMethods: result.data.payload.payment_methods
      });
    } else {
      res.status(result.status).json({
        success: false,
        error: 'Error fetching payment methods'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. Get available terminals
app.get('/api/bold/terminals', async (req, res) => {
  try {
    const result = await callBoldAPI('/payments/terminals');
    
    if (result.success) {
      res.json({
        success: true,
        terminals: result.data.payload.terminals
      });
    } else {
      res.status(result.status).json({
        success: false,
        error: 'Error fetching terminals'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Create payment link (Botón de Pagos) - MOCK VERSION FOR TESTING
app.post('/api/bold/create-payment-link', async (req, res) => {
  try {
    const {
      amount,
      reference,
      description,
      customerEmail,
      customerName,
      customerPhone,
      returnUrl,
      cancelUrl
    } = req.body;

    // Validate required fields
    if (!amount || !reference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, reference'
      });
    }

    // MOCK RESPONSE - For testing purposes
    // In production, this would call the real Bold API
    const mockPaymentUrl = `http://localhost:3000/bold-payment?amount=${amount}&reference=${reference}&return_url=${encodeURIComponent(returnUrl || 'http://localhost:3000/checkout/success')}&cancel_url=${encodeURIComponent(cancelUrl || 'http://localhost:3000/checkout')}`;
    
    console.log('Creating mock payment link:', {
      amount,
      reference,
      description,
      customerEmail,
      returnUrl,
      cancelUrl,
      mockPaymentUrl
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      paymentUrl: mockPaymentUrl,
      paymentId: `mock-${Date.now()}`,
      message: 'Mock payment link created successfully'
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. Get payment status
app.get('/api/bold/payment-status/:integrationId', async (req, res) => {
  try {
    const { integrationId } = req.params;
    
    if (!integrationId) {
      return res.status(400).json({
        success: false,
        error: 'Integration ID is required'
      });
    }

    const result = await callBoldAPI(`/payments/${integrationId}`);
    
    if (result.success) {
      res.json({
        success: true,
        payment: result.data.payload
      });
    } else {
      res.status(result.status).json({
        success: false,
        error: 'Error fetching payment status'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. Webhook endpoint for Bold notifications
app.post('/api/bold/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Bold Webhook received:', { event, data });
    
    // Handle different webhook events
    switch (event) {
      case 'payment.succeeded':
        // Update order status to paid
        console.log('Payment succeeded:', data);
        break;
      case 'payment.failed':
        // Update order status to failed
        console.log('Payment failed:', data);
        break;
      case 'payment.pending':
        // Update order status to pending
        console.log('Payment pending:', data);
        break;
      default:
        console.log('Unknown webhook event:', event);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Bold Payment API server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`- GET  /api/bold/payment-methods`);
  console.log(`- GET  /api/bold/terminals`);
  console.log(`- POST /api/bold/create-payment-link`);
  console.log(`- GET  /api/bold/payment-status/:paymentId`);
  console.log(`- POST /api/bold/webhook`);
});

module.exports = app;
