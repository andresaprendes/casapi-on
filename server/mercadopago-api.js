const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MercadoPagoConfig, Preference, Payment, PaymentMethod } = require('mercadopago');
const { initializeDatabase } = require('./database');
const { orderOperations, paymentOperations, productOperations } = require('./dbOperations');
require('dotenv').config();

// In-memory storage as fallback (when DATABASE_URL is not available)
const orderDatabase = new Map();
const paymentDatabase = new Map();
const productDatabase = new Map();

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

// Regular JSON middleware for most endpoints
app.use('/api/mercadopago/create-preference', express.json());
app.use('/api/mercadopago/payment-status', express.json());
app.use('/api/mercadopago/payment-methods', express.json());
app.use('/api/mercadopago/test', express.json());

// Raw middleware for webhook (signature verification needs raw body)
// Note: The webhook endpoint will handle its own raw parsing

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// MercadoPago Configuration
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.error('❌ MERCADOPAGO_ACCESS_TOKEN is not set!');
  process.exit(1);
}

// Validate token format
if (!MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-') && !MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-')) {
  console.error('❌ Invalid MercadoPago token format! Should start with APP_USR- or TEST-');
  console.error('Current token:', MERCADOPAGO_ACCESS_TOKEN);
  process.exit(1);
}

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-webhook-secret';
console.log('✅ MercadoPago token validated:', MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...');

// Database will be initialized on startup

// Initialize products with default data
const defaultProducts = [
  {
    id: 'test-5000',
    name: 'Producto de Prueba - 5000 COP',
    description: 'Este es un producto de prueba económico para probar el sistema de pagos. Perfecto para realizar transacciones de prueba con un valor bajo.',
    price: 5000,
    category: 'test',
    subcategory: 'prueba',
    images: ['/logo.png'],
    materials: ['Madera de prueba', 'Acabado básico'],
    dimensions: { length: 10, width: 10, height: 5 },
    weight: 0.1,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '1-2 días',
    features: ['Producto de prueba', 'Precio mínimo', 'Entrega rápida'],
    specifications: {
      'Tipo': 'Producto de prueba',
      'Material': 'Madera de prueba',
      'Peso': '100g',
      'Garantía': 'Sin garantía'
    }
  },
  {
    id: '1',
    name: 'Mesa de Comedor de Piñón',
    description: 'Mesa de comedor elegante fabricada en madera de piñón maciza, perfecta para 6 personas. Acabados de primera calidad con barniz natural que resalta la belleza única del piñón.',
    price: 2800000,
    category: 'comedor',
    subcategory: 'mesas',
    images: ['/images/image-1755135305383-454296344.png'],
    materials: ['Piñón macizo', 'Barniz natural'],
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 45,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['Asientos para 6 personas', 'Madera de piñón auténtica', 'Diseño clásico'],
    specifications: {
      'Material': 'Piñón macizo',
      'Acabado': 'Barniz natural',
      'Capacidad': '6 personas',
      'Garantía': '3 años'
    }
  },
  {
    id: '2',
    name: 'Puerta Principal de Piñón',
    description: 'Puerta principal fabricada en madera de piñón maciza con herrajes de bronce. Diseño tradicional que aporta elegancia y seguridad a tu hogar.',
    price: 1200000,
    category: 'puertas',
    subcategory: 'principales',
    images: ['/images/image-1755136170928-605023865.webp', '/images/image-1755136180161-48892126.webp'],
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz protector'],
    dimensions: { length: 210, width: 90, height: 6 },
    weight: 35,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['Piñón macizo', 'Herrajes de bronce', 'Resistente a la intemperie'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '210x90cm',
      'Acabado': 'Barniz protector',
      'Garantía': '5 años'
    }
  },
  {
    id: '3',
    name: 'Cama Queen de Piñón',
    description: 'Cama queen size fabricada en madera de piñón con cabecera tallada a mano. Diseño único que combina tradición y elegancia para tu habitación.',
    price: 2200000,
    category: 'habitacion',
    subcategory: 'camas',
    images: [],
    materials: ['Piñón macizo', 'Tallado artesanal', 'Barniz natural'],
    dimensions: { length: 200, width: 160, height: 120 },
    weight: 40,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['Tamaño Queen', 'Cabecera tallada', 'Madera de piñón auténtica'],
    specifications: {
      'Material': 'Piñón macizo',
      'Tamaño': 'Queen (200x160cm)',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '4',
    name: 'Estantería Artesanal de Piñón',
    description: 'Estantería de 5 niveles fabricada en madera de piñón con diseño artesanal. Perfecta para exhibir libros y objetos decorativos con el toque auténtico del piñón.',
    price: 1800000,
    category: 'sala',
    subcategory: 'estanterias',
    images: [],
    materials: ['Piñón macizo', 'Barniz natural', 'Tallado artesanal'],
    dimensions: { length: 100, width: 35, height: 180 },
    weight: 35,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['5 niveles', 'Diseño artesanal', 'Madera de piñón'],
    specifications: {
      'Material': 'Piñón macizo',
      'Niveles': '5',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '5',
    name: 'Mesa de Centro de Piñón',
    description: 'Mesa de centro única fabricada en madera de piñón con detalles tallados. Pieza central perfecta para tu sala que refleja la tradición y calidad de Casa Piñón.',
    price: 1500000,
    category: 'sala',
    subcategory: 'mesas-centro',
    images: [],
    materials: ['Piñón macizo', 'Tallado decorativo', 'Barniz natural'],
    dimensions: { length: 120, width: 60, height: 45 },
    weight: 25,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '2-4 semanas',
    features: ['Diseño único', 'Tallado decorativo', 'Madera de piñón auténtica'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '120x60cm',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '6',
    name: 'Escritorio Ejecutivo de Piñón',
    description: 'Escritorio ejecutivo fabricado en madera de piñón con cajones tallados y amplío espacio de trabajo. Ideal para oficinas que valoran la elegancia y funcionalidad.',
    price: 3200000,
    category: 'oficina',
    subcategory: 'escritorios',
    images: [],
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz satinado'],
    dimensions: { length: 150, width: 70, height: 75 },
    weight: 50,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '5-7 semanas',
    features: ['Cajones tallados', 'Amplio espacio', 'Diseño ejecutivo'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '150x70cm',
      'Acabado': 'Barniz satinado',
      'Garantía': '3 años'
    }
  }
];

// Products will be initialized in database on startup

// Order utility functions
function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `CP-${timestamp}-${random}`.toUpperCase();
}

function calculateEstimatedDelivery(shippingZone) {
  const baseDate = new Date();
  let daysToAdd = 7; // Default 7 days
  
  switch (shippingZone) {
    case 'Medellín':
      daysToAdd = 3;
      break;
    case 'Oriente Antioqueño':
      daysToAdd = 5;
      break;
    case 'Resto de Antioquia':
      daysToAdd = 7;
      break;
    default:
      daysToAdd = 10;
  }
  
  baseDate.setDate(baseDate.getDate() + daysToAdd);
  return baseDate.toISOString();
}

// Clean up abandoned orders (older than 24 hours)
async function cleanupAbandonedOrders() {
  try {
    const cleanedCount = await orderOperations.cleanupAbandoned(24);
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} abandoned orders`);
    }
  } catch (error) {
    console.error('Error cleaning up abandoned orders:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupAbandonedOrders, 60 * 60 * 1000);

async function updateOrderPaymentStatus(orderReference, paymentStatus, paymentId) {
  try {
    // Find order by order number
    const order = await orderOperations.getByOrderNumber(orderReference);
    
    if (order) {
      const updates = {
        paymentStatus: paymentStatus,
        paymentId: paymentId
      };
      
      // If payment is approved, also update order status to confirmed
      if (paymentStatus === 'paid' && order.status === 'pending') {
        updates.status = 'confirmed';
      }
      
      await orderOperations.update(order.id, updates);
      console.log('✅ Order payment status updated:', {
        orderId: order.id,
        orderNumber: orderReference,
        paymentStatus: paymentStatus,
        paymentId: paymentId
      });
    } else {
      console.log('⚠️ Order not found for payment update:', orderReference);
    }
  } catch (error) {
    console.error('Error updating order payment status:', error);
  }
}

const client = new MercadoPagoConfig({ 
  accessToken: MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 10000
  }
});

// Environment variables for URLs
const BASE_URL = process.env.BASE_URL || 'https://casa-pinon-ebanisteria-production.up.railway.app';
const API_URL = process.env.API_URL || 'https://casa-pinon-backend-production.up.railway.app';

// Root endpoint to test if server is running
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Casa Piñón Backend API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/mercadopago/test',
      '/api/mercadopago/webhook-test',
      '/api/products',
      '/api/orders'
    ]
  });
});

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

    // Simple MercadoPago preference - exactly what they need
    const preference = {
      items: [
        {
          title: `Orden ${orderId}`,
          unit_price: Number(amount),
          quantity: 1
        }
      ],
      external_reference: orderId,
      back_urls: {
        success: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`,
        failure: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`,
        pending: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`
      },
      auto_return: 'approved'
    };

    console.log('Creating MercadoPago preference:', {
      amount,
      orderId,
      customerEmail,
      customerName,
      description,
      BASE_URL,
      API_URL,
      success_url: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`
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

    let result;
    try {
      const preferenceClient = new Preference(client);
      console.log('Preference client created successfully');
      
      result = await preferenceClient.create({ body: preference });
      console.log('Preference creation successful');
      
    } catch (preferenceError) {
      console.error('Preference creation failed:', preferenceError);
      console.error('Preference error message:', preferenceError.message);
      console.error('Preference error stack:', preferenceError.stack);
      throw preferenceError;
    }

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
    console.log('Checking payment database first...');

    // First check our database (webhook verified payments)
    const storedPayment = await paymentOperations.getById(paymentId.toString());
    console.log('Database check result:', storedPayment ? 'Found' : 'Not found');
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

    // If not found in database, check with MercadoPago API directly
    console.log('Payment not found in database, checking with MercadoPago API...');

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
    await paymentOperations.upsert({
      id: payment.id.toString(),
      orderId: payment.external_reference,
      status: payment.status,
      statusDetail: payment.status_detail,
      externalReference: payment.external_reference,
      transactionAmount: payment.transaction_amount,
      currencyId: payment.currency_id,
      paymentMethodId: payment.payment_method_id,
      payerEmail: payment.payer?.email,
      dateCreated: payment.date_created,
      dateApproved: payment.date_approved,
      webhookVerified: false
    });

    // Update order status based on payment status
    if (payment.external_reference) {
      if (payment.status === 'approved') {
        updateOrderPaymentStatus(payment.external_reference, 'paid', payment.id);
        console.log('✅ Order updated to paid via API verification:', payment.external_reference);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
        console.log('❌ Order updated to failed via API verification:', payment.external_reference);
      } else if (payment.status === 'pending') {
        updateOrderPaymentStatus(payment.external_reference, 'pending', payment.id);
        console.log('⏳ Order updated to pending via API verification:', payment.external_reference);
      }
    }

    const isApproved = payment.status === 'approved';
    const isPending = payment.status === 'pending';
    const isRejected = payment.status === 'rejected' || payment.status === 'cancelled';

    res.json({
      success: true,
      payment: payment,
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

// 3. Simple webhook for payment notifications
app.post('/api/mercadopago/webhook', express.json(), async (req, res) => {
  try {
    console.log('🔔 WEBHOOK RECEIVED:', new Date().toISOString());
    console.log('🔔 Webhook body:', JSON.stringify(req.body, null, 2));
    
    const { action, data } = req.body;
    
    if (action === 'payment.updated' || action === 'payment.created') {
      const paymentId = data.id;
      console.log('Processing payment:', paymentId);
      
      try {
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: paymentId });
        
        console.log('Payment status:', payment.status);
        
        // Store payment in database
        await paymentOperations.upsert({
          id: payment.id.toString(),
          orderId: payment.external_reference,
          status: payment.status,
          statusDetail: payment.status_detail,
          externalReference: payment.external_reference,
          transactionAmount: payment.transaction_amount,
          currencyId: payment.currency_id,
          paymentMethodId: payment.payment_method_id,
          payerEmail: payment.payer?.email,
          dateCreated: payment.date_created,
          dateApproved: payment.date_approved,
          webhookVerified: true
        });
        
        // Update order based on payment status
        if (payment.external_reference) {
          if (payment.status === 'approved') {
            updateOrderPaymentStatus(payment.external_reference, 'paid', payment.id);
            console.log('✅ Order updated to paid:', payment.external_reference);
          } else if (payment.status === 'rejected') {
            updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
            console.log('❌ Order updated to failed:', payment.external_reference);
          } else if (payment.status === 'pending') {
            updateOrderPaymentStatus(payment.external_reference, 'pending', payment.id);
            console.log('⏳ Order updated to pending:', payment.external_reference);
          }
        }
        
      } catch (error) {
        console.error('Webhook error:', error.message);
      }
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true });
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

// 6. Webhook test endpoint
app.get('/api/mercadopago/webhook-test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    url: `${API_URL}/api/mercadopago/webhook`
  });
});

// 7. Simple webhook test endpoint (GET)
app.get('/api/mercadopago/webhook', (req, res) => {
  console.log('🔔 WEBHOOK GET TEST - TIMESTAMP:', new Date().toISOString());
  res.json({
    success: true,
    message: 'Webhook GET endpoint is accessible',
    timestamp: new Date().toISOString()
  });
});

// 8. Manual webhook trigger for testing
app.post('/api/mercadopago/trigger-webhook/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('🔔 MANUAL WEBHOOK TRIGGER for payment:', paymentId);
    
    // Simulate webhook payload
    const webhookPayload = {
      action: 'payment.updated',
      data: { id: paymentId },
      type: 'payment'
    };
    
    // Process the webhook manually
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });
    
    console.log('Manual webhook payment verification:', {
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
    console.log('✅ Payment stored in database via manual trigger:', paymentId);
    
    // Update order payment status if external_reference exists
    if (payment.external_reference) {
      updateOrderPaymentStatus(payment.external_reference, payment.status === 'approved' ? 'paid' : 'failed', payment.id);
    }
    
    res.json({
      success: true,
      message: 'Manual webhook processed successfully',
      payment: paymentRecord
    });
    
  } catch (error) {
    console.error('Manual webhook trigger error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. Order Management Endpoints

// Helper functions
function generateOrderNumber() {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function calculateEstimatedDelivery(shippingZone) {
  const deliveryDays = {
    'bogota': '1-2 días',
    'medellin': '2-3 días',
    'cali': '2-3 días',
    'barranquilla': '3-4 días',
    'cartagena': '3-4 días',
    'other': '5-7 días'
  };
  return deliveryDays[shippingZone] || '5-7 días';
}

// Create a new order
app.post('/api/orders', express.json(), async (req, res) => {
  try {
    // Handle both old and new request formats
    const { 
      customer, 
      customerInfo, // Old format
      items, 
      subtotal, 
      shipping, 
      tax, 
      total, 
      shippingZone, 
      paymentMethod, 
      notes 
    } = req.body;

    // Use customer or customerInfo, whichever is available
    const customerData = customer || customerInfo;

    // Validate required fields
    if (!customerData || !items || !total) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customer info, items, or total'
      });
    }

    // Generate order number
    const orderId = generateOrderNumber();
    const estimatedDelivery = shippingZone ? calculateEstimatedDelivery(shippingZone) : '5-7 días';
    
    const orderData = {
      id: orderId,
      orderNumber: orderId,
      customer: customerData,
      items,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      shippingZone: shippingZone || 'other',
      paymentMethod: paymentMethod || 'mercadopago',
      notes: notes || '',
      estimatedDelivery,
      status: 'pending',
      createdAt: new Date().toISOString(),
      // Add tracking fields
      abandonedAt: null,
      retryCount: 0,
      lastPaymentAttempt: null
    };

    // Store order in appropriate storage
    let createdOrder;
    if (process.env.DATABASE_URL) {
      createdOrder = await orderOperations.create(orderData);
    } else {
      // Fallback to in-memory storage
      orderDatabase.set(orderId, orderData);
      createdOrder = orderData;
    }
    
    console.log('✅ Order created:', orderId);
    
    // Transform database response to match frontend expectations
    const orderResponse = {
      ...createdOrder,
      orderNumber: createdOrder.order_number || createdOrder.orderNumber || orderId,
      customerInfo: createdOrder.customer || createdOrder.customer_info,
      createdAt: createdOrder.created_at || createdOrder.createdAt
    };
    
    res.json({
      success: true,
      order: orderResponse
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating order'
    });
  }
});

// Get all orders with filtering and pagination
app.get('/api/orders', async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus, 
      paymentMethod, 
      dateFrom, 
      dateTo, 
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let orders;
    if (process.env.DATABASE_URL) {
      orders = await orderOperations.getAll({ status, paymentStatus, paymentMethod, dateFrom, dateTo, search });
    } else {
      orders = Array.from(orderDatabase.values());
    }

    // Apply filters
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    
    if (paymentStatus) {
      orders = orders.filter(order => order.paymentStatus === paymentStatus);
    }
    
    if (paymentMethod) {
      orders = orders.filter(order => order.paymentMethod === paymentMethod);
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      orders = orders.filter(order => new Date(order.createdAt) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      orders = orders.filter(order => new Date(order.createdAt) <= toDate);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        (order.orderNumber || order.order_number || '').toLowerCase().includes(searchLower) ||
        (order.customer?.name || order.customerName || order.customer_name || '').toLowerCase().includes(searchLower) ||
        (order.customer?.email || order.customerEmail || order.customer_email || '').toLowerCase().includes(searchLower) ||
        (order.customer?.phone || order.customerPhone || order.customer_phone || '').includes(search)
      );
    }

    // Sort orders
    orders.sort((a, b) => {
      const aValue = sortBy === 'createdAt' ? new Date(a[sortBy]) : a[sortBy];
      const bValue = sortBy === 'createdAt' ? new Date(b[sortBy]) : b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Calculate stats
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.filter(o => (o.paymentStatus || o.payment_status) === 'paid').reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0) / orders.length : 0
    };

    res.json({
      success: true,
      orders: paginatedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.length,
        pages: Math.ceil(orders.length / parseInt(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching orders'
    });
  }
});

// Get specific order by ID
app.get('/api/orders/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orderDatabase.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching order'
    });
  }
});

// Update order status
app.put('/api/orders/:orderId', express.json(), (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const order = orderDatabase.get(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update order
    const updatedOrder = {
      ...order,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If status is being set to delivered, set actual delivery date
    if (updates.status === 'delivered' && !order.actualDelivery) {
      updatedOrder.actualDelivery = new Date().toISOString();
    }

    orderDatabase.set(orderId, updatedOrder);

    console.log('✅ Order updated:', orderId, updates);

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating order'
    });
  }
});

// File upload endpoints
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Return the file path relative to public directory
    const relativePath = `/images/${req.file.filename}`;
    
    console.log('✅ Image uploaded:', req.file.filename);
    
    res.json({
      success: true,
      filename: req.file.filename,
      path: relativePath,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading image'
    });
  }
});

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Product API endpoints
app.get('/api/products', async (req, res) => {
  try {
    let products;
    if (process.env.DATABASE_URL) {
      products = await productOperations.getAll();
    } else {
      products = Array.from(productDatabase.values());
    }
    
    // Transform database fields to match frontend expectations
    const transformedProducts = products.map(product => ({
      ...product,
      inStock: product.in_stock || product.inStock,
      isCustom: product.is_custom || product.isCustom,
      createdAt: product.created_at || product.createdAt,
      updatedAt: product.updated_at || product.updatedAt
    }));
    
    res.json({
      success: true,
      products: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching products'
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let product;
    if (process.env.DATABASE_URL) {
      product = await productOperations.getById(id);
    } else {
      product = productDatabase.get(id);
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Transform database fields to match frontend expectations
    const transformedProduct = {
      ...product,
      inStock: product.in_stock || product.inStock,
      isCustom: product.is_custom || product.isCustom,
      createdAt: product.created_at || product.createdAt,
      updatedAt: product.updated_at || product.updatedAt
    };
    
    res.json({
      success: true,
      product: transformedProduct
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching product'
    });
  }
});

app.post('/api/products', express.json(), (req, res) => {
  try {
    const productData = req.body;
    const newId = Date.now().toString();
    
    const newProduct = {
      ...productData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    productDatabase.set(newId, newProduct);
    
    console.log('✅ Product created:', newId);
    
    res.json({
      success: true,
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating product'
    });
  }
});

app.put('/api/products/:id', express.json(), (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const existingProduct = productDatabase.get(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const updatedProduct = {
      ...existingProduct,
      ...updates,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    productDatabase.set(id, updatedProduct);
    
    console.log('✅ Product updated:', id);
    
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating product'
    });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProduct = productDatabase.get(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    productDatabase.delete(id);
    
    console.log('✅ Product deleted:', id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting product'
    });
  }
});

// Update product display order
app.put('/api/products/:id/order', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (typeof displayOrder !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'displayOrder must be a number'
      });
    }
    
    let updatedProduct;
    if (process.env.DATABASE_URL) {
      updatedProduct = await productOperations.update(id, { display_order: displayOrder });
    } else {
      const existingProduct = productDatabase.get(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      existingProduct.display_order = displayOrder;
      productDatabase.set(id, existingProduct);
      updatedProduct = existingProduct;
    }
    
    console.log('✅ Product order updated:', id, 'to position:', displayOrder);
    
    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating product order'
    });
  }
});

// SYNC DATABASE - Reset to default products (for Railway sync)
app.post('/api/products/sync', async (req, res) => {
  try {
    console.log('🔄 Starting product sync...');
    console.log('📊 Default products count:', defaultProducts.length);
    
    if (process.env.DATABASE_URL) {
      // Clear and re-initialize with default products
      console.log('🗄️  Using PostgreSQL database');
      await productOperations.initializeWithDefaults(defaultProducts);
      console.log('✅ Database synced with default products');
    } else {
      // Clear current database
      console.log('💾 Using in-memory storage');
      productDatabase.clear();
      
      // Re-initialize with default products
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      
      console.log('✅ In-memory storage synced with default products');
    }
    
    res.json({ 
      success: true, 
      message: 'Database synced successfully',
      productsCount: defaultProducts.length
    });
  } catch (error) {
    console.error('Error syncing database:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// MANUAL INITIALIZE - Force initialize products
app.post('/api/products/initialize', async (req, res) => {
  try {
    console.log('🚀 Manual product initialization...');
    console.log('📊 Default products count:', defaultProducts.length);
    console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️  Using PostgreSQL database');
      await productOperations.initializeWithDefaults(defaultProducts);
      console.log('✅ Products initialized in database');
    } else {
      console.log('💾 Using in-memory storage');
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      console.log('✅ Products initialized in memory');
    }
    
    res.json({ 
      success: true, 
      message: 'Products initialized successfully',
      productsCount: defaultProducts.length
    });
  } catch (error) {
    console.error('Error initializing products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// TEST ENDPOINT - Check database connection and products
app.get('/api/products/test', async (req, res) => {
  try {
    console.log('🧪 Testing products endpoint...');
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️  Testing PostgreSQL connection...');
      
      // Test database connection
      const testQuery = await pool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection test:', testQuery.rows[0]);
      
      // Check if products table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'products'
        ) as table_exists
      `);
      console.log('📋 Products table exists:', tableCheck.rows[0].table_exists);
      
      // Count products
      const productCount = await pool.query('SELECT COUNT(*) as count FROM products');
      console.log('📊 Current product count:', productCount.rows[0].count);
      
      res.json({
        success: true,
        databaseConnected: true,
        tableExists: tableCheck.rows[0].table_exists,
        productCount: parseInt(productCount.rows[0].count),
        defaultProductsCount: defaultProducts.length
      });
    } else {
      console.log('💾 Testing in-memory storage...');
      res.json({
        success: true,
        databaseConnected: false,
        tableExists: false,
        productCount: productDatabase.size,
        defaultProductsCount: defaultProducts.length
      });
    }
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT || 3001;

// Prevent process from crashing
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize database and start server
async function startServer() {
  try {
    // Check if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      console.log('🔧 Initializing PostgreSQL database...');
      // Initialize database tables
      await initializeDatabase();
      
      // Initialize with default products
      await productOperations.initializeWithDefaults(defaultProducts);
      console.log('✅ Database initialized successfully');
    } else {
      console.log('⚠️  No DATABASE_URL found, using in-memory storage');
      console.log('⚠️  Orders will not persist across deployments');
      
      // Fallback to in-memory storage for now
      // Initialize with default products in memory
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      console.log('✅ In-memory storage initialized with default products');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`MercadoPago API server running on port ${PORT}`);
      console.log(`Available endpoints:`);
      console.log(`- POST /api/mercadopago/create-preference`);
      console.log(`- GET  /api/mercadopago/payment-status/:paymentId`);
      console.log(`- POST /api/mercadopago/webhook`);
      console.log(`- GET  /api/mercadopago/payment-methods`);
      console.log(`- GET  /api/mercadopago/test`);
      console.log(`- GET  /api/mercadopago/webhook-test`);
      console.log(`- POST /api/upload/image`);
      console.log(`- GET  /api/products`);
      console.log(`- GET  /api/products/:id`);
      console.log(`- POST /api/products`);
      console.log(`- PUT  /api/products/:id`);
      console.log(`- DELETE /api/products/:id`);
      console.log(`- POST /api/products/sync`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    console.error('This might be due to database connection issues.');
    console.error('The server will continue with in-memory storage.');
    
    // Fallback: start server without database
    try {
      // Initialize with default products in memory
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      
      app.listen(PORT, () => {
        console.log(`MercadoPago API server running on port ${PORT} (fallback mode)`);
        console.log('⚠️  Using in-memory storage - orders will not persist');
      });
    } catch (fallbackError) {
      console.error('Failed to start server even in fallback mode:', fallbackError);
      process.exit(1);
    }
  }
}

startServer();

module.exports = app;
