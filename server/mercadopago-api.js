const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-12345678-1234-1234-1234-123456789012';
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-webhook-secret';
console.log('Initializing MercadoPago with token:', MERCADOPAGO_ACCESS_TOKEN ? MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...' : 'NONE');

// In-memory storage (in production, use a real database)
const paymentDatabase = new Map();
const orderDatabase = new Map();
const productDatabase = new Map();

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

// Initialize product database with default products
defaultProducts.forEach(product => {
  productDatabase.set(product.id, product);
});

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

function updateOrderPaymentStatus(orderReference, paymentStatus, paymentId) {
  try {
    // Find order by external reference (order number)
    let targetOrder = null;
    for (const [orderId, order] of orderDatabase.entries()) {
      if (order.orderNumber === orderReference || order.id === orderReference) {
        targetOrder = { id: orderId, ...order };
        break;
      }
    }
    
    if (targetOrder) {
      const updatedOrder = {
        ...targetOrder,
        paymentStatus: paymentStatus,
        paymentId: paymentId,
        updatedAt: new Date().toISOString()
      };
      
      // If payment is approved, also update order status to confirmed
      if (paymentStatus === 'paid' && targetOrder.status === 'pending') {
        updatedOrder.status = 'confirmed';
      }
      
      orderDatabase.set(targetOrder.id, updatedOrder);
      console.log('✅ Order payment status updated:', {
        orderId: targetOrder.id,
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
const BASE_URL = process.env.BASE_URL || 'https://casapi-on-production.up.railway.app';
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

    // Create preference for MercadoPago Colombia production
    const preference = {
      items: [
        {
          title: description || `Orden ${orderId} - Casa Piñón Ebanistería`,
          unit_price: Number(amount),
          quantity: 1,
          currency_id: 'COP',
          description: `Compra en Casa Piñón Ebanistería - ${description || 'Productos de madera fina'}`
        }
      ],
      payer: {
        email: customerEmail,
        name: customerName || 'Cliente Casa Piñón'
      },
      
      // Seller information to distinguish from buyer
      application_id: 'CASA_PINON_EBANISTERIA',
      statement_descriptor: 'CASA PINON',

      external_reference: orderId,
      back_urls: {
        success: `${BASE_URL}/checkout/success?payment_id={payment_id}&status={status}&external_reference={external_reference}`,
        failure: `${BASE_URL}/checkout/success?payment_id={payment_id}&status=failure&external_reference={external_reference}`,
        pending: `${BASE_URL}/checkout/success?payment_id={payment_id}&status=pending&external_reference={external_reference}`
      },
      notification_url: `${API_URL}/api/mercadopago/webhook`,
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
    const storedPayment = paymentDatabase.get(paymentId.toString());
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
app.post('/api/mercadopago/webhook', express.json(), async (req, res) => {
  try {
    console.log('🔔 WEBHOOK RECEIVED - TIMESTAMP:', new Date().toISOString());
    console.log('🔔 Webhook received:', JSON.stringify(req.body, null, 2));
    console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
    
    const { action, api_version, data, date_created, id, live_mode, type, user_id } = req.body;
    
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
        console.log('✅ Payment stored in database:', paymentId);
        
        // Log important payment events and update order status
        if (payment.status === 'approved') {
          console.log('🎉 PAYMENT APPROVED:', {
            orderId: payment.external_reference,
            amount: payment.transaction_amount,
            paymentId: payment.id,
            email: payment.payer?.email
          });
          
          // Update order payment status if external_reference exists
          if (payment.external_reference) {
            updateOrderPaymentStatus(payment.external_reference, 'paid', payment.id);
          }
          
        } else if (payment.status === 'rejected') {
          console.log('❌ PAYMENT REJECTED:', {
            orderId: payment.external_reference,
            paymentId: payment.id,
            reason: payment.status_detail
          });
          
          // Update order payment status if external_reference exists
          if (payment.external_reference) {
            updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
          }
        }
        
      } catch (verificationError) {
        console.error('Error verifying payment in webhook:', verificationError);
        // Still return success to MercadoPago to avoid retries
      }
    }
    
    console.log('✅ Webhook processed successfully');
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('Error stack:', error.stack);
    res.status(200).json({ received: true, error: error.message });
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

// 6. Order Management Endpoints

// Create a new order
app.post('/api/orders', express.json(), (req, res) => {
  try {
    const { customer, items, subtotal, shipping, tax, total, shippingZone, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!customer || !items || !total || !shippingZone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customer, items, total, shippingZone'
      });
    }

    // Generate order
    const orderId = generateOrderNumber();
    const now = new Date().toISOString();
    
    const order = {
      id: orderId,
      orderNumber: orderId,
      customer,
      items,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'mercadopago',
      createdAt: now,
      updatedAt: now,
      estimatedDelivery: calculateEstimatedDelivery(shippingZone),
      shippingZone,
      notes: notes || ''
    };

    // Store order
    orderDatabase.set(orderId, order);
    
    console.log('✅ Order created:', orderId);
    
    res.json({
      success: true,
      order
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
app.get('/api/orders', (req, res) => {
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

    let orders = Array.from(orderDatabase.values());

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
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        (order.customer.phone && order.customer.phone.includes(search))
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
      totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
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
app.get('/api/products', (req, res) => {
  try {
    const products = Array.from(productDatabase.values());
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching products'
    });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const product = productDatabase.get(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: product
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

// SYNC DATABASE - Reset to default products (for Railway sync)
app.post('/api/products/sync', (req, res) => {
  try {
    // Clear current database
    productDatabase.clear();
    
    // Re-initialize with default products
    defaultProducts.forEach(product => {
      productDatabase.set(product.id, product);
    });
    
    console.log('✅ Database synced with default products');
    res.json({ 
      success: true, 
      message: 'Database synced successfully',
      productsCount: productDatabase.size
    });
  } catch (error) {
    console.error('Error syncing database:', error);
    res.status(500).json({ success: false, error: error.message });
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

module.exports = app;
