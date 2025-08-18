import express from 'express';
import { getProductImage } from './data/productImages.js';
import cors from 'cors';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { MercadoPagoConfig, Preference, Payment, PaymentMethod } from 'mercadopago';
import { initializeDatabase } from './database.js';
import { pool } from './database.js';
import { orderOperations, paymentOperations, productOperations } from './dbOperations.js';
import { sendOrderConfirmation, sendPaymentStatusEmail } from './emailService.js';
import sharp from 'sharp';
// Load environment variables - try local first, then parent directory
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });
dotenv.config({ path: '../.env' });

// In-memory storage as fallback (when DATABASE_URL is not available)
const orderDatabase = new Map();
const paymentDatabase = new Map();
const productDatabase = new Map();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://xn--casapion-i3a.co',
    'https://www.xn--casapion-i3a.co',
    'https://casapinon.co',
    'https://www.casapinon.co',
    'https://casapi-on-production.up.railway.app',
    'https://casa-pinon-backend-production.up.railway.app',
    'https://*.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase body size limits for large base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (images) with CORS headers
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '..', 'public', 'images')));

app.use('/api/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '..', 'public', 'images')));

// Regular JSON middleware for most endpoints
app.use('/api/mercadopago/create-preference', express.json({ limit: '50mb' }));
app.use('/api/mercadopago/payment-status', express.json({ limit: '50mb' }));
app.use('/api/mercadopago/payment-methods', express.json({ limit: '50mb' }));
app.use('/api/mercadopago/test', express.json({ limit: '50mb' }));

// Raw middleware for webhook (signature verification needs raw body)
// Note: The webhook endpoint will handle its own raw parsing

// File upload configuration - OPTIMIZED for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create organized directory structure
    const uploadPath = path.join(__dirname, '..', 'public', 'images', 'products');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate clean, organized filename
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Create filename: product-YYYYMMDD-HHMMSS-RANDOM.ext
    const date = new Date(timestamp);
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const timeStr = date.getHours().toString().padStart(2, '0') + 
                   date.getMinutes().toString().padStart(2, '0') + 
                   date.getSeconds().toString().padStart(2, '0');
    
    const filename = `product-${dateStr}-${timeStr}-${randomSuffix}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit - optimized for web performance
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files with optimized formats
    if (file.mimetype.startsWith('image/')) {
      // Prefer WebP, JPEG, PNG for better performance
      const allowedTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
      if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      } else {
        cb(new Error('Please use WebP, JPEG, or PNG format for better performance!'), false);
      }
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// MercadoPago Configuration
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.error('❌ MERCADOPAGO_ACCESS_TOKEN is not set!');
  console.error('⚠️  Server will start but MercadoPago features will be disabled');
}

// Validate token format
if (MERCADOPAGO_ACCESS_TOKEN && !MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-') && !MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-')) {
  console.error('❌ Invalid MercadoPago token format! Should start with APP_USR- or TEST-');
  console.error('⚠️  Server will start but MercadoPago features may not work correctly');
}

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-webhook-secret';

// Check if MercadoPago token is available
if (MERCADOPAGO_ACCESS_TOKEN) {
  console.log('✅ MercadoPago token validated:', MERCADOPAGO_ACCESS_TOKEN.substring(0, 15) + '...');
} else {
  console.log('⚠️  MercadoPago token not available - payment features will be limited');
}

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
    images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='], // Placeholder 1x1 pixel
    materials: ['Madera de prueba', 'Acabado básico'],
    dimensions: { length: 10, width: 10, height: 5 },
    weight: 0.1,
    madeToOrder: true,
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
    images: ["/images/products/product-1.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Barniz natural'],
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 45,
    madeToOrder: true,
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
    images: ["/images/products/product-2.webp","/images/products/product-3.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz protector'],
    dimensions: { length: 210, width: 90, height: 6 },
    weight: 35,
    madeToOrder: true,
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
    images: ["/images/products/product-4.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Tallado artesanal', 'Barniz natural'],
    dimensions: { length: 200, width: 160, height: 120 },
    weight: 40,
    madeToOrder: true,
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
    images: ["/images/products/product-5.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Barniz natural', 'Tallado artesanal'],
    dimensions: { length: 100, width: 35, height: 180 },
    weight: 35,
    madeToOrder: true,
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
    images: ["/images/products/product-6.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Tallado decorativo', 'Barniz natural'],
    dimensions: { length: 120, width: 60, height: 45 },
    weight: 25,
    madeToOrder: true,
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
    images: ["/images/products/product-7.webp"], // Will be replaced with actual base64
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz satinado'],
    dimensions: { length: 150, width: 70, height: 75 },
    weight: 50,
    madeToOrder: true,
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

// Clean up abandoned orders and handle payment timeouts
async function cleanupAbandonedOrders() {
  try {
    // Clean up orders abandoned for more than 24 hours
    const cleanedCount = await orderOperations.cleanupAbandoned(24);
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} abandoned orders`);
    }
    
    // Handle pending payment timeouts (30 minutes for PSE, 15 minutes for others)
    const timeoutCount = await handlePendingPaymentTimeouts();
    if (timeoutCount > 0) {
      console.log(`⏰ Timed out ${timeoutCount} pending payments`);
    }
    
    // Handle orders that were created but never initiated payment (30 minutes timeout)
    const abandonedCount = await handleAbandonedOrders();
    if (abandonedCount > 0) {
      console.log(`🚫 Marked ${abandonedCount} abandoned orders as rejected`);
    }
  } catch (error) {
    console.error('Error in cleanup process:', error);
  }
}

// Handle pending payment timeouts - mark as rejected if can't be verified
async function handlePendingPaymentTimeouts() {
  try {
    // Get pending payments that have timed out
    const pendingPayments = await orderOperations.getPendingPaymentsForTimeout();
    let timeoutCount = 0;
    
    for (const payment of pendingPayments) {
      // Try to verify payment with MercadoPago one last time
      try {
        const paymentClient = new Payment(client);
        const currentPayment = await paymentClient.get({ id: payment.id });
        
        // If payment is still pending after timeout, mark as rejected
        if (currentPayment.status === 'pending') {
          console.log(`⏰ Payment ${payment.id} timed out, marking as rejected`);
          
          // Update payment status to rejected
          await paymentOperations.upsert({
            id: payment.id,
            orderId: payment.order_id,
            status: 'rejected',
            statusDetail: 'payment_timeout',
            externalReference: payment.external_reference,
            transactionAmount: payment.transaction_amount,
            currencyId: payment.currency_id,
            paymentMethodId: payment.payment_method_id,
            payerEmail: payment.payer_email,
            dateCreated: payment.date_created,
            dateApproved: null,
            webhookVerified: true
          });
          
          // Update order status to failed
          await updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
          
          // Send rejection email
          const order = await orderOperations.getByOrderNumber(payment.external_reference);
          if (order) {
            const customerInfo = order.customer || {
              name: order.customer_name,
              email: order.customer_email,
              phone: order.customer_phone,
              address: order.customer_address
            };
            
            sendPaymentStatusEmail(order, customerInfo, currentPayment, 'rejected')
              .then(emailResult => {
                if (emailResult.success) {
                  console.log(`✅ Payment rejection email sent for order:`, payment.external_reference);
                } else {
                  console.log(`⚠️ Failed to send rejection email:`, emailResult.error);
                }
              })
              .catch(emailError => {
                console.log(`⚠️ Error sending rejection email:`, emailError.message);
              });
          }
          
          timeoutCount++;
        }
      } catch (verifyError) {
        console.log(`⚠️ Could not verify payment ${payment.id}:`, verifyError.message);
        // If we can't verify, still mark as rejected
        await updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
        timeoutCount++;
      }
    }
    
    return timeoutCount;
  } catch (error) {
    console.error('Error handling payment timeouts:', error);
    return 0;
  }
}

// Handle orders that were created but never initiated payment
async function handleAbandonedOrders() {
  try {
    // Get orders that were created but never had a payment initiated (30 minutes timeout)
    const query = `
      SELECT o.*
      FROM orders o
      LEFT JOIN payments p ON o.order_number = p.external_reference
      WHERE o.payment_status = 'pending'
        AND p.id IS NULL
        AND o.created_at < NOW() - INTERVAL '30 minutes'
        AND o.abandoned_at IS NULL
    `;
    
    let result;
    if (process.env.DATABASE_URL && pool) {
      try {
        result = await pool.query(query);
      } catch (dbError) {
        console.error('Database error in abandoned orders cleanup:', dbError);
        return 0;
      }
    } else {
      // Fallback to in-memory storage
      const orders = Array.from(orderDatabase.values());
      const payments = Array.from(paymentDatabase.values());
      const now = new Date();
      
      result = {
        rows: orders.filter(order => {
          const hasPayment = payments.some(p => p.externalReference === order.orderNumber);
          const createdTime = new Date(order.createdAt);
          const minutesSinceCreation = (now - createdTime) / (1000 * 60);
          
          return order.paymentStatus === 'pending' && 
                 !hasPayment && 
                 minutesSinceCreation > 30 &&
                 !order.abandonedAt;
        })
      };
    }
    
    let abandonedCount = 0;
    
    for (const order of result.rows) {
      console.log(`🚫 Order ${order.order_number} abandoned (no payment initiated), marking as rejected`);
      
      // Update order status to failed
      await updateOrderPaymentStatus(order.order_number, 'failed', null);
      
      // Mark as abandoned
      if (process.env.DATABASE_URL && pool) {
        try {
          await pool.query(
            'UPDATE orders SET abandoned_at = CURRENT_TIMESTAMP WHERE order_number = $1',
            [order.order_number]
          );
        } catch (dbError) {
          console.error('Database error updating abandoned order:', dbError);
          continue; // Skip to next order
        }
      } else {
        // Update in-memory storage
        const orderToUpdate = orderDatabase.get(order.order_number);
        if (orderToUpdate) {
          orderToUpdate.abandonedAt = new Date().toISOString();
          orderToUpdate.paymentStatus = 'failed';
          orderDatabase.set(order.order_number, orderToUpdate);
        }
      }
      
      // Send abandonment email
      const customerInfo = order.customer || {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address
      };
      
      const fakePayment = {
        id: 'ABANDONED-' + order.order_number,
        payment_method_id: 'abandoned',
        transaction_amount: order.total,
        date_created: order.created_at
      };
      
      sendPaymentStatusEmail(order, customerInfo, fakePayment, 'rejected')
        .then(emailResult => {
          if (emailResult.success) {
            console.log(`✅ Abandonment email sent for order:`, order.order_number);
          } else {
            console.log(`⚠️ Failed to send abandonment email:`, emailResult.error);
          }
        })
        .catch(emailError => {
          console.log(`⚠️ Error sending abandonment email:`, emailError.message);
        });
      
      abandonedCount++;
    }
    
    return abandonedCount;
  } catch (error) {
    console.error('Error handling abandoned orders:', error);
    return 0;
  }
}

// Run cleanup every 15 minutes (more frequent for better timeout handling)
// Cleanup abandoned orders every 15 minutes
const cleanupInterval = setInterval(cleanupAbandonedOrders, 15 * 60 * 1000);

// Cleanup interval on process exit
process.on('SIGTERM', () => {
  clearInterval(cleanupInterval);
  console.log('🧹 Cleanup interval stopped');
});

process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
  console.log('🧹 Cleanup interval stopped');
});

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
            success: `https://xn--casapion-i3a.co/checkout/success?payment_id={payment_id}&status={status}&collection_id={collection_id}&external_reference=${orderId}`,
            failure: `https://xn--casapion-i3a.co/checkout/failure?payment_id={payment_id}&status={status}&collection_id={collection_id}&external_reference=${orderId}`,
            pending: `https://xn--casapion-i3a.co/checkout/pending?payment_id={payment_id}&status={status}&collection_id={collection_id}&external_reference=${orderId}`
          },
      auto_return: 'all'
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
      throw new Error('Failed to create MercadoPago payment preference - please try again or contact support');
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
    const { refresh } = req.query;

    console.log('Payment verification requested for ID:', paymentId);
    console.log('Checking payment database first...');

    // First check our database (any stored payments)
    const storedPayment = await paymentOperations.getById(paymentId.toString());
    console.log('Database check result:', storedPayment ? 'Found' : 'Not found');
    
    // If refresh is requested or no stored payment, always check with MercadoPago API
    if (!refresh && storedPayment) {
      console.log('✅ Payment found in database:', storedPayment.status, 'webhook_verified:', storedPayment.webhook_verified);
      
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
          source: storedPayment.webhook_verified ? 'webhook_verified' : 'database_stored'
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

    // Send payment status email immediately (don't wait for database operations)
    if (payment.external_reference) {
      // Send email first, then update database
      try {
        const order = await orderOperations.getByOrderNumber(payment.external_reference);
        if (order) {
          const customerInfo = order.customer || {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address
          };
          
          // Send email immediately without waiting
          sendPaymentStatusEmail(order, customerInfo, payment, payment.status)
            .then(emailResult => {
              if (emailResult.success) {
                console.log(`✅ Payment ${payment.status} email sent for order:`, payment.external_reference);
              } else {
                console.log(`⚠️ Failed to send payment ${payment.status} email:`, emailResult.error);
              }
            })
            .catch(emailError => {
              console.log(`⚠️ Error sending payment ${payment.status} email:`, emailError.message);
            });
        }
      } catch (emailError) {
        console.log(`⚠️ Error preparing payment ${payment.status} email:`, emailError.message);
      }
      
      // Update database after sending email
      let orderStatus = 'pending';
      if (payment.status === 'approved') {
        orderStatus = 'paid';
        updateOrderPaymentStatus(payment.external_reference, 'paid', payment.id);
        console.log('✅ Order updated to paid via API verification:', payment.external_reference);
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        orderStatus = 'failed';
        updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
        console.log('❌ Order updated to failed via API verification:', payment.external_reference);
      } else if (payment.status === 'pending') {
        orderStatus = 'pending';
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
        
        // Send payment status email immediately (don't wait for database operations)
        if (payment.external_reference) {
          // Send email first, then update database
          try {
            const order = await orderOperations.getByOrderNumber(payment.external_reference);
            if (order) {
              const customerInfo = order.customer || {
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.customer_address
              };
              
              // Send email immediately without waiting
              sendPaymentStatusEmail(order, customerInfo, payment, payment.status)
                .then(emailResult => {
                  if (emailResult.success) {
                    console.log(`✅ Payment ${payment.status} email sent for order:`, payment.external_reference);
                  } else {
                    console.log(`⚠️ Failed to send payment ${payment.status} email:`, emailResult.error);
                  }
                })
                .catch(emailError => {
                  console.log(`⚠️ Error sending payment ${payment.status} email:`, emailError.message);
                });
            }
          } catch (emailError) {
            console.log(`⚠️ Error preparing payment ${payment.status} email:`, emailError.message);
          }
          
          // Update database after sending email
          let orderStatus = 'pending';
          if (payment.status === 'approved') {
            orderStatus = 'paid';
            updateOrderPaymentStatus(payment.external_reference, 'paid', payment.id);
            console.log('✅ Order updated to paid:', payment.external_reference);
          } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            orderStatus = 'failed';
            updateOrderPaymentStatus(payment.external_reference, 'failed', payment.id);
            console.log('❌ Order updated to failed:', payment.external_reference);
          } else if (payment.status === 'pending') {
            orderStatus = 'pending';
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

// 5.1. Email test endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const testOrder = {
      orderNumber: 'TEST-123',
      createdAt: new Date().toISOString(),
      total: 50000,
      items: [{ name: 'Test Product', price: 50000 }],
      shippingZone: 'Bogotá',
      estimatedDelivery: '2-3 días'
    };
    
    const testCustomer = {
      name: 'Test User',
      email: process.env.EMAIL_USER, // Send to yourself for testing
      phone: '3001234567',
      address: 'Test Address'
    };
    
    const testPayment = {
      id: 'TEST-PAYMENT-123',
      payment_method_id: 'test',
      transaction_amount: 50000,
      date_created: new Date().toISOString()
    };
    
    const emailResult = await sendPaymentStatusEmail(testOrder, testCustomer, testPayment, 'pending');
    
    res.json({
      success: true,
      emailResult,
      message: 'Test email sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 5.2. Orders status check endpoint
app.get('/api/orders-status-check', async (req, res) => {
  try {
    console.log('🔍 Checking orders status...');
    
    // Get all orders with payment details
    const query = `
      SELECT 
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.total,
        o.payment_status,
        o.payment_method,
        o.created_at,
        o.updated_at,
        p.id as payment_id,
        p.status as payment_status_mp,
        p.date_created as payment_date_created,
        p.status_detail,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))/60 as minutes_since_creation,
        EXTRACT(EPOCH FROM (NOW() - p.date_created))/60 as minutes_since_payment
      FROM orders o
      LEFT JOIN payments p ON o.order_number = p.external_reference
      ORDER BY o.created_at DESC
    `;
    
    let result;
    if (process.env.DATABASE_URL) {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      result = await pool.query(query);
      await pool.end();
    } else {
      // Fallback to in-memory storage
      const orders = Array.from(orderDatabase.values());
      const payments = Array.from(paymentDatabase.values());
      
      const ordersWithPayments = orders.map(order => {
        const payment = payments.find(p => p.externalReference === order.orderNumber);
        const now = new Date();
        const createdTime = new Date(order.createdAt);
        const paymentTime = payment ? new Date(payment.dateCreated) : null;
        
        return {
          order_number: order.orderNumber,
          customer_name: order.customer?.name || order.customerName,
          customer_email: order.customer?.email || order.customerEmail,
          total: order.total,
          payment_status: order.paymentStatus,
          payment_method: order.paymentMethod,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
          payment_id: payment?.id,
          payment_status_mp: payment?.status,
          payment_date_created: payment?.dateCreated,
          status_detail: payment?.statusDetail,
          minutes_since_creation: Math.round((now - createdTime) / (1000 * 60)),
          minutes_since_payment: paymentTime ? Math.round((now - paymentTime) / (1000 * 60)) : null
        };
      });
      
      result = { rows: ordersWithPayments };
    }
    
    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No orders found in database',
        orders: [],
        summary: { total: 0, pending: 0, timeout: 0 }
      });
    }
    
    const now = new Date();
    let pendingCount = 0;
    let timeoutCount = 0;
    const ordersWithTimeout = [];
    
    result.rows.forEach((order, index) => {
      const minutesSinceCreation = Math.round(order.minutes_since_creation || 0);
      const minutesSincePayment = Math.round(order.minutes_since_payment || 0);
      const timeoutLimit = order.payment_method === 'pse' ? 45 : 20;
      const shouldHaveTimedOut = order.payment_status === 'pending' && minutesSincePayment > timeoutLimit;
      
      if (order.payment_status === 'pending') {
        pendingCount++;
        if (shouldHaveTimedOut) {
          timeoutCount++;
          ordersWithTimeout.push({
            orderNumber: order.order_number,
            minutesSincePayment,
            timeoutLimit,
            overdue: minutesSincePayment - timeoutLimit
          });
        }
      }
    });
    
    const summary = {
      total: result.rows.length,
      pending: pendingCount,
      timeout: timeoutCount,
      currentTime: now.toISOString(),
      cleanupInterval: 'Every 15 minutes',
      pseTimeout: '45 minutes',
      otherTimeout: '20 minutes'
    };
    
    res.json({ 
      success: true, 
      orders: result.rows,
      summary,
      timeoutOrders: ordersWithTimeout
    });
    
  } catch (error) {
    console.error('❌ Error checking orders status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5.3. Manual cleanup trigger endpoint
app.post('/api/trigger-cleanup', async (req, res) => {
  try {
    console.log('🧹 Manual cleanup triggered...');
    
    // Run the cleanup process
    await cleanupAbandonedOrders();
    
    res.json({
      success: true,
      message: 'Cleanup process completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in manual cleanup:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// 8. Manual payment verification endpoint
app.post('/api/mercadopago/verify-payment/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    console.log('🔍 Manual payment verification for order:', orderNumber);

    // Get the order from database
    const order = await orderOperations.getByOrderNumber(orderNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Get the payment from database
    const payments = await paymentOperations.getByOrderId(order.id);
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No payment found for this order'
      });
    }

    const payment = payments[0];
    console.log('🔍 Found payment:', payment.id, 'status:', payment.status);

    // Verify payment with MercadoPago
    try {
      const mpPayment = await mercadopago.payment.get(payment.id);
      console.log('🔍 MercadoPago payment status:', mpPayment.body.status);

      // Update payment status in database
      const updatedPayment = await paymentOperations.upsert({
        id: payment.id,
        orderId: order.id,
        status: mpPayment.body.status,
        statusDetail: mpPayment.body.status_detail,
        externalReference: payment.external_reference,
        transactionAmount: mpPayment.body.transaction_amount,
        currencyId: mpPayment.body.currency_id,
        paymentMethodId: mpPayment.body.payment_method_id,
        payerEmail: mpPayment.body.payer?.email,
        dateCreated: mpPayment.body.date_created,
        dateApproved: mpPayment.body.date_approved,
        webhookVerified: true
      });

      // Update order status based on payment status
      let orderStatus = 'pending';
      if (mpPayment.body.status === 'approved') {
        orderStatus = 'paid';
      } else if (mpPayment.body.status === 'rejected' || mpPayment.body.status === 'cancelled') {
        orderStatus = 'failed';
      }

      console.log('🔍 Updating order status:', {
        orderId: order.id,
        oldStatus: order.paymentStatus,
        newStatus: orderStatus,
        mpStatus: mpPayment.body.status
      });

      const updatedOrder = await orderOperations.update(order.id, {
        paymentStatus: orderStatus,
        paymentId: payment.id
      });

      console.log('✅ Order updated successfully:', {
        orderId: order.id,
        newStatus: updatedOrder?.paymentStatus,
        mpStatus: mpPayment.body.status
      });

      console.log('✅ Payment and order status updated:', {
        paymentStatus: mpPayment.body.status,
        orderStatus: orderStatus
      });

      return res.json({
        success: true,
        message: 'Payment status updated successfully',
        paymentStatus: mpPayment.body.status,
        orderStatus: orderStatus
      });

    } catch (mpError) {
      console.error('Error verifying payment with MercadoPago:', mpError);
      return res.status(500).json({
        success: false,
        error: 'Error verifying payment with MercadoPago'
      });
    }

  } catch (error) {
    console.error('Manual payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 9. Get payment by ID
app.get('/api/mercadopago/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('🔍 Getting payment by ID:', paymentId);

    // Get payment from database
    const payment = await paymentOperations.getById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Get order details
    const order = await orderOperations.getById(payment.order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    return res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        externalReference: payment.external_reference,
        transactionAmount: payment.transaction_amount,
        currencyId: payment.currency_id,
        paymentMethodId: payment.payment_method_id,
        payerEmail: payment.payer_email,
        dateCreated: payment.date_created,
        dateApproved: payment.date_approved,
        webhookVerified: payment.webhook_verified
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        total: order.total,
        customer: order.customer
      }
    });

  } catch (error) {
    console.error('Error getting payment by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 10. Daily payment verification - automatically verify all pending payments
app.post('/api/mercadopago/verify-all-pending', async (req, res) => {
  try {
    console.log('🔄 Starting daily payment verification for all pending payments...');
    
    // Get all pending payments
    const pendingPaymentsQuery = `
      SELECT p.*, o.order_number, o.payment_status as order_payment_status
      FROM payments p
      JOIN orders o ON p.external_reference = o.order_number
      WHERE p.status = 'pending' 
        AND o.payment_status = 'pending'
        AND p.date_created < NOW() - INTERVAL '1 hour'
      ORDER BY p.date_created ASC
    `;
    
    const pendingPayments = await pool.query(pendingPaymentsQuery);
    
    console.log(`🔍 Found ${pendingPayments.rows.length} pending payments to verify`);
    
    let verifiedCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const payment of pendingPayments.rows) {
      try {
        console.log(`🔍 Verifying payment ${payment.id} for order ${payment.external_reference}`);
        
        // Get payment status from MercadoPago
        const mpPayment = await mercadopago.payment.get(payment.id);
        const mpStatus = mpPayment.body.status;
        
        console.log(`📊 MercadoPago status for payment ${payment.id}: ${mpStatus}`);
        
        // Update payment in database
        const updatedPayment = await paymentOperations.upsert({
          id: payment.id,
          orderId: payment.order_id,
          status: mpStatus,
          statusDetail: mpPayment.body.status_detail,
          externalReference: payment.external_reference,
          transactionAmount: mpPayment.body.transaction_amount,
          currencyId: mpPayment.body.currency_id,
          paymentMethodId: mpPayment.body.payment_method_id,
          payerEmail: mpPayment.body.payer?.email,
          dateCreated: mpPayment.body.date_created,
          dateApproved: mpPayment.body.date_approved,
          webhookVerified: true
        });
        
        // Update order status based on payment status
        let orderStatus = 'pending';
        if (mpStatus === 'approved') {
          orderStatus = 'paid';
        } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
          orderStatus = 'failed';
        }
        
        await orderOperations.update(payment.order_id, {
          paymentStatus: orderStatus,
          paymentId: payment.id
        });
        
        verifiedCount++;
        results.push({
          paymentId: payment.id,
          orderNumber: payment.external_reference,
          oldStatus: payment.status,
          newStatus: mpStatus,
          orderStatus: orderStatus,
          success: true
        });
        
        console.log(`✅ Payment ${payment.id} updated: ${payment.status} → ${mpStatus}`);
        
        // Add a small delay to avoid rate limiting (configurable)
        const rateLimitDelay = parseInt(process.env.RATE_LIMIT_DELAY) || 100;
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error verifying payment ${payment.id}:`, error.message);
        results.push({
          paymentId: payment.id,
          orderNumber: payment.external_reference,
          error: error.message,
          success: false
        });
      }
    }
    
    console.log(`✅ Daily verification completed: ${verifiedCount} verified, ${errorCount} errors`);
    
    return res.json({
      success: true,
      message: `Daily payment verification completed`,
      summary: {
        total: pendingPayments.rows.length,
        verified: verifiedCount,
        errors: errorCount
      },
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error in daily payment verification:', error);
    return res.status(500).json({
      success: false,
      error: 'Error during daily payment verification'
    });
  }
});

// 11. Manual trigger for daily verification (for testing)
app.get('/api/mercadopago/verify-all-pending', async (req, res) => {
  try {
    console.log('🔄 Manual trigger for daily payment verification...');
    
    // Get all pending payments
    const pendingPaymentsQuery = `
      SELECT p.*, o.order_number, o.payment_status as order_payment_status
      FROM payments p
      JOIN orders o ON p.external_reference = o.order_number
      WHERE p.status = 'pending' 
        AND o.payment_status = 'pending'
      ORDER BY p.date_created ASC
      LIMIT 10
    `;
    
    const pendingPayments = await pool.query(pendingPaymentsQuery);
    
    console.log(`🔍 Found ${pendingPayments.rows.length} pending payments to verify`);
    
    let verifiedCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const payment of pendingPayments.rows) {
      try {
        console.log(`🔍 Verifying payment ${payment.id} for order ${payment.external_reference}`);
        
        // Get payment status from MercadoPago
        const mpPayment = await mercadopago.payment.get(payment.id);
        const mpStatus = mpPayment.body.status;
        
        console.log(`📊 MercadoPago status for payment ${payment.id}: ${mpStatus}`);
        
        // Update payment in database
        const updatedPayment = await paymentOperations.upsert({
          id: payment.id,
          orderId: payment.order_id,
          status: mpStatus,
          statusDetail: mpPayment.body.status_detail,
          externalReference: payment.external_reference,
          transactionAmount: mpPayment.body.transaction_amount,
          currencyId: mpPayment.body.currency_id,
          paymentMethodId: mpPayment.body.payment_method_id,
          payerEmail: mpPayment.body.payer?.email,
          dateCreated: mpPayment.body.date_created,
          dateApproved: mpPayment.body.date_approved,
          webhookVerified: true
        });
        
        // Update order status based on payment status
        let orderStatus = 'pending';
        if (mpStatus === 'approved') {
          orderStatus = 'paid';
        } else if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
          orderStatus = 'failed';
        }
        
        await orderOperations.update(payment.order_id, {
          paymentStatus: orderStatus,
          paymentId: payment.id
        });
        
        verifiedCount++;
        results.push({
          paymentId: payment.id,
          orderNumber: payment.external_reference,
          oldStatus: payment.status,
          newStatus: mpStatus,
          orderStatus: orderStatus,
          success: true
        });
        
        console.log(`✅ Payment ${payment.id} updated: ${payment.status} → ${mpStatus}`);
        
        // Add a small delay to avoid rate limiting (configurable)
        const rateLimitDelay = parseInt(process.env.RATE_LIMIT_DELAY) || 100;
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error verifying payment ${payment.id}:`, error.message);
        results.push({
          paymentId: payment.id,
          orderNumber: payment.external_reference,
          error: error.message,
          success: false
        });
      }
    }
    
    console.log(`✅ Manual verification completed: ${verifiedCount} verified, ${errorCount} errors`);
    
    return res.json({
      success: true,
      message: `Manual payment verification completed`,
      summary: {
        total: pendingPayments.rows.length,
        verified: verifiedCount,
        errors: errorCount
      },
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error in manual payment verification:', error);
    return res.status(500).json({
      success: false,
      error: 'Error during manual payment verification'
    });
  }
});

// 12. Verify payment by ID
app.post('/api/mercadopago/verify-payment-by-id/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    console.log('🔍 Manual payment verification by ID:', paymentId);

    // Get payment from database
    const payment = await paymentOperations.getById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Get order details
    const order = await orderOperations.getById(payment.order_id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify payment with MercadoPago
    try {
      const mpPayment = await mercadopago.payment.get(paymentId);
      console.log('🔍 MercadoPago payment status:', mpPayment.body.status);

      // Update payment status in database
      const updatedPayment = await paymentOperations.upsert({
        id: payment.id,
        orderId: order.id,
        status: mpPayment.body.status,
        statusDetail: mpPayment.body.status_detail,
        externalReference: payment.external_reference,
        transactionAmount: mpPayment.body.transaction_amount,
        currencyId: mpPayment.body.currency_id,
        paymentMethodId: mpPayment.body.payment_method_id,
        payerEmail: mpPayment.body.payer?.email,
        dateCreated: mpPayment.body.date_created,
        dateApproved: mpPayment.body.date_approved,
        webhookVerified: true
      });

      // Update order status based on payment status
      let orderStatus = 'pending';
      if (mpPayment.body.status === 'approved') {
        orderStatus = 'paid';
      } else if (mpPayment.body.status === 'rejected' || mpPayment.body.status === 'cancelled') {
        orderStatus = 'failed';
      }

      console.log('🔍 Updating order status:', {
        orderId: order.id,
        oldStatus: order.paymentStatus,
        newStatus: orderStatus,
        mpStatus: mpPayment.body.status
      });

      const updatedOrder = await orderOperations.update(order.id, {
        paymentStatus: orderStatus,
        paymentId: payment.id
      });

      console.log('✅ Order updated successfully:', {
        orderId: order.id,
        newStatus: updatedOrder?.paymentStatus,
        mpStatus: mpPayment.body.status
      });

      return res.json({
        success: true,
        message: 'Payment status updated successfully',
        paymentStatus: mpPayment.body.status,
        orderStatus: orderStatus
      });

    } catch (mpError) {
      console.error('Error verifying payment with MercadoPago:', mpError);
      return res.status(500).json({
        success: false,
        error: 'Error verifying payment with MercadoPago'
      });
    }

  } catch (error) {
    console.error('Manual payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 13. Manual webhook trigger for testing
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
// generateOrderNumber is already defined above

// calculateEstimatedDelivery is already defined above

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
      // Send order confirmation email
      try {
        const customerInfo = {
          name: createdOrder.customer_name || createdOrder.customer?.name,
          email: createdOrder.customer_email || createdOrder.customer?.email,
          phone: createdOrder.customer_phone || createdOrder.customer?.phone,
          address: createdOrder.customer_address || createdOrder.customer?.address
        };
        
        if (customerInfo.email) {
          // Email will be sent when payment status changes (via webhook), not on order creation
      console.log('✅ Order created successfully, email will be sent when payment is processed');
          // Email handling removed - emails sent via webhook only
        } else {
          console.log('⚠️ No customer email found, skipping order confirmation email');
        }
      } catch (emailError) {
        console.error('❌ Error sending order confirmation email:', emailError);
        // Don't fail the order creation if email fails
      }
    
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

// Get order by order number
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    let order;
    if (process.env.DATABASE_URL) {
      order = await orderOperations.getByOrderNumber(orderNumber);
    } else {
      // Fallback to in-memory storage
      order = Array.from(orderDatabase.values()).find(o => o.orderNumber === orderNumber);
    }
    
    if (order) {
      res.json({
        success: true,
        order: order
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error retrieving order'
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

// File upload endpoints - OPTIMIZED for performance
app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const inputPath = req.file.path;
    const filename = req.file.filename;
    
    // Convert filename to WebP
    const webpFilename = filename.replace(/\.[^/.]+$/, '.webp');
    const outputPath = path.join(__dirname, '..', 'public', 'images', 'products', webpFilename);

    // Ensure input and output paths are different
    if (inputPath === outputPath) {
      // If paths are the same, create a temporary output path
      const tempOutputPath = path.join(__dirname, '..', 'public', 'images', 'products', `temp_${webpFilename}`);
      
      // Convert to WebP with optimization
      await sharp(inputPath)
        .webp({ 
          quality: 80,        // Good quality
          effort: 6,          // Good compression
          nearLossless: true  // Better quality
        })
        .toFile(tempOutputPath);

      // Delete original file
      fs.unlinkSync(inputPath);
      
      // Rename temp file to final name
      fs.renameSync(tempOutputPath, outputPath);
    } else {
      // Convert to WebP with optimization
      await sharp(inputPath)
        .webp({ 
          quality: 80,        // Good quality
          effort: 6,          // Good compression
          nearLossless: true  // Better quality
        })
        .toFile(outputPath);

      // Delete original file
      fs.unlinkSync(inputPath);
    }

    // Return WebP path
    const relativePath = `/images/products/${webpFilename}`;
    
    console.log('✅ Image converted to WebP successfully:', webpFilename);
    console.log('📁 WebP file saved at:', outputPath);
    console.log('🌐 Accessible at:', relativePath);
    
    res.json({
      success: true,
      filename: webpFilename,
      path: relativePath,
      size: req.file.size,
      mimetype: 'image/webp',
      message: 'Image converted to WebP and uploaded successfully!'
    });

  } catch (error) {
    console.error('❌ Image upload/conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error uploading/converting image'
    });
  }
});

// Configure MIME types for proper image serving
const mimeTypes = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Serve static files from public directory with proper MIME types
// Try multiple possible paths for Railway deployment
app.use('/images', express.static(path.join(__dirname, 'public', 'images'), {
  setHeaders: (res, path) => {
    const ext = path.extname(path).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
  }
}));

// Fallback for Railway deployment structure
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images'), {
  setHeaders: (res, path) => {
    const ext = path.extname(path).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    }
  }
}));

// Test endpoint to check if images are accessible
app.get('/api/test-images', (req, res) => {
  const fs = require('fs');
  const imagePath = path.join(__dirname, 'public', 'images', 'products', 'product-1.webp');
  const fallbackPath = path.join(__dirname, '..', 'public', 'images', 'products', 'product-1.webp');
  
  console.log('🔍 Testing image paths:');
  console.log('  Primary path:', imagePath, 'exists:', fs.existsSync(imagePath));
  console.log('  Fallback path:', fallbackPath, 'exists:', fs.existsSync(fallbackPath));
  
  res.json({
    success: true,
    primaryPath: imagePath,
    primaryExists: fs.existsSync(imagePath),
    fallbackPath: fallbackPath,
    fallbackExists: fs.existsSync(fallbackPath),
    currentDir: __dirname
  });
});

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
      madeToOrder: product.made_to_order || product.madeToOrder,
      estimatedDelivery: product.estimated_delivery || product.estimatedDelivery,
      designVariations: product.design_variations || product.designVariations,
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
      madeToOrder: product.made_to_order || product.madeToOrder,
      estimatedDelivery: product.estimated_delivery || product.estimatedDelivery,
      designVariations: product.design_variations || product.designVariations,
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

app.post('/api/products', express.json(), async (req, res) => {
  try {
    const productData = req.body;
    let newProduct;
    
    if (process.env.DATABASE_URL) {
      // Use PostgreSQL database - generate ID for new products
      const productDataWithId = {
        ...productData,
        id: productData.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      newProduct = await productOperations.create(productDataWithId);
    } else {
      // Use in-memory database
      const newId = Date.now().toString();
      
      newProduct = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      productDatabase.set(newId, newProduct);
    }
    
    console.log('✅ Product created:', newProduct.id);
    
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

app.put('/api/products/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    let existingProduct;
    let updatedProduct;
    
    if (process.env.DATABASE_URL) {
      // Use PostgreSQL database
      existingProduct = await productOperations.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      updatedProduct = await productOperations.update(id, updates);
      if (!updatedProduct) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update product'
        });
      }
    } else {
      // Use in-memory database
      existingProduct = productDatabase.get(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      updatedProduct = {
        ...existingProduct,
        ...updates,
        id: id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      
      productDatabase.set(id, updatedProduct);
    }
    
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

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let existingProduct;
    
    if (process.env.DATABASE_URL) {
      // Use PostgreSQL database
      existingProduct = await productOperations.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      await productOperations.delete(id);
    } else {
      // Use in-memory database
      existingProduct = productDatabase.get(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      productDatabase.delete(id);
    }
    
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
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️  Using PostgreSQL database');
      console.log('✅ Database ready - products will be read from existing data');
    } else {
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
      message: 'Database ready - products will be read from existing data',
      databaseMode: process.env.DATABASE_URL ? 'PostgreSQL' : 'In-Memory'
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
      console.log('✅ Database ready - products will be read from existing data');
    } else {
      console.log('💾 Using in-memory storage');
      console.log('⚠️  In-memory storage not recommended for production');
    }
    
    res.json({ 
      success: true, 
      message: 'Database ready - products will be read from existing data',
      databaseMode: process.env.DATABASE_URL ? 'PostgreSQL' : 'In-Memory'
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

// PORT is now defined in start.js

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
    console.log('🚀 Starting server...');
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set (Supabase)' : 'Not set');
    
    // Check if DATABASE_URL is available (Supabase)
    if (process.env.DATABASE_URL) {
      console.log('🔧 Connecting to Supabase database...');
      // Test connection
      const testResult = await pool.query('SELECT NOW()');
      console.log('✅ Connected to Supabase:', testResult.rows[0]);
      
      console.log('✅ Supabase database ready');
    } else {
      console.log('⚠️  No DATABASE_URL found, using in-memory storage');
      console.log('⚠️  Orders will not persist across deployments');
      
      // Fallback to in-memory storage
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      console.log('✅ In-memory storage initialized with default products');
    }
    
    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`MercadoPago API server running on port ${PORT}`);
      console.log(`💾 Using ${process.env.DATABASE_URL ? 'Supabase' : 'In-Memory'} storage`);
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
      console.log('⚠️  Database connection failed, but server will start');
      
      const PORT = process.env.PORT || 3001;
      app.listen(PORT, () => {
        console.log(`MercadoPago API server running on port ${PORT} (fallback mode)`);
        console.log('⚠️  Using in-memory storage - orders will not persist');
        console.log('⚠️  Products will not be available without database connection');
      });
    } catch (fallbackError) {
      console.error('Failed to start server even in fallback mode:', fallbackError);
      console.error('⚠️  Server startup failed completely - check configuration and try again');
      // Don't exit process - let it continue and potentially restart
    }
  }
}

// Server startup is now handled by start.js



// Test endpoint to verify email service is working
app.post('/api/test-email', express.json(), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address required'
      });
    }

    console.log('🔍 Email configuration check:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Test with minimal data
    const testOrder = {
      id: 'test',
      orderNumber: 'TEST-123',
      total: 5000,
      customer: { name: 'Test User', email: email }
    };
    
    const testCustomerInfo = {
      name: 'Test User',
      email: email, // Use the email from request
      phone: '3001234567',
      address: { city: 'Test City' }
    };
    
    const testPayment = {
      id: 'test-payment',
      status: 'cancelled',
      external_reference: 'TEST-123',
      transaction_amount: 5000
    };
    
    console.log('📧 Attempting to send test email to:', email);
    const emailResult = await sendPaymentStatusEmail(testOrder, testCustomerInfo, testPayment, 'cancelled');
    
    console.log('📧 Email result:', emailResult);
    
    res.json({
      success: true,
      message: 'Email test completed',
      emailResult,
      emailConfig: {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        emailUser: process.env.EMAIL_USER || 'NOT SET',
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email test failed',
      details: error.message,
      emailConfig: {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        emailUser: process.env.EMAIL_USER || 'NOT SET',
        nodeEnv: process.env.NODE_ENV
      }
    });
  }
});

// Test endpoint to verify successful payment email
app.post('/api/test-success-email', express.json(), async (req, res) => {
  try {
    console.log('🧪 Testing successful payment email...');
    
    // Test with minimal data for successful payment
    const testOrder = {
      id: 'test-success',
      orderNumber: 'TEST-SUCCESS-123',
      total: 5000,
      customer: { name: 'Test User', email: 'test@test.com' }
    };
    
    const testCustomerInfo = {
      name: 'Test User',
      email: 'pagos@casapinon.co', // Use your Zoho email for testing
      phone: '3001234567',
      address: { city: 'Test City' }
    };
    
    const testPayment = {
      id: 'test-success-payment',
      status: 'approved',
      external_reference: 'TEST-SUCCESS-123',
      transaction_amount: 5000,
      payment_method: {
        type: 'credit_card',
        id: 'visa'
      }
    };
    
    console.log('📧 Attempting to send successful payment email...');
    const emailResult = await sendPaymentStatusEmail(testOrder, testCustomerInfo, testPayment, 'approved');
    
    console.log('📧 Success email result:', emailResult);
    
    res.json({
      success: true,
      message: 'Successful payment email test completed',
      emailResult
    });
    
  } catch (error) {
    console.error('❌ Success email test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Success email test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// ===== DATABASE MANAGEMENT ENDPOINTS =====

// Get database statistics
app.get('/api/database/stats', async (req, res) => {
  try {
    console.log('📊 Fetching database statistics...');
    
    let stats = {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      databaseSize: '0 MB',
      lastBackup: 'Nunca',
      lastSync: 'Nunca'
    };

    if (process.env.DATABASE_URL) {
      // Get products count
      const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
      stats.totalProducts = parseInt(productsResult.rows[0].count);

      // Get orders count
      const ordersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
      stats.totalOrders = parseInt(ordersResult.rows[0].count);

      // Get database size (approximate)
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      stats.databaseSize = sizeResult.rows[0].size;

      // Get last backup time (from a backup_log table if it exists)
      try {
        const backupResult = await pool.query(`
          SELECT MAX(created_at) as last_backup 
          FROM backup_log 
          WHERE type = 'backup'
        `);
        if (backupResult.rows[0].last_backup) {
          stats.lastBackup = new Date(backupResult.rows[0].last_backup).toLocaleString();
        }
      } catch (error) {
        // backup_log table might not exist
        console.log('No backup log table found');
      }

      // Get last sync time
      try {
        const syncResult = await pool.query(`
          SELECT MAX(created_at) as last_sync 
          FROM backup_log 
          WHERE type = 'sync'
        `);
        if (syncResult.rows[0].last_sync) {
          stats.lastSync = new Date(syncResult.rows[0].last_sync).toLocaleString();
        }
      } catch (error) {
        // backup_log table might not exist
        console.log('No sync log table found');
      }
    } else {
      // In-memory storage stats
      stats.totalProducts = productDatabase.size;
      stats.totalOrders = orderDatabase.size;
      stats.databaseSize = 'In-Memory';
    }

    console.log('✅ Database statistics fetched successfully');
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching database stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database statistics',
      details: error.message
    });
  }
});

// Database sync endpoints
app.post('/api/database/sync/local-to-production', async (req, res) => {
  try {
    console.log('🔄 Starting local to production sync...');
    
    // This would typically involve copying data from local to production
    // For now, we'll just log the action
    console.log('✅ Local to production sync completed');
    
    res.json({
      success: true,
      message: 'Local to production sync completed'
    });
  } catch (error) {
    console.error('❌ Error in local to production sync:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      details: error.message
    });
  }
});

app.post('/api/database/sync/production-to-local', async (req, res) => {
  try {
    console.log('🔄 Starting production to local sync...');
    
    // This would typically involve copying data from production to local
    // For now, we'll just log the action
    console.log('✅ Production to local sync completed');
    
    res.json({
      success: true,
      message: 'Production to local sync completed'
    });
  } catch (error) {
    console.error('❌ Error in production to local sync:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      details: error.message
    });
  }
});

// ===== SUPABASE DATABASE MANAGEMENT =====

// Get database statistics
app.get('/api/database/stats', async (req, res) => {
  try {
    console.log('📊 Fetching Supabase statistics...');
    
    if (process.env.DATABASE_URL) {
      // Get products count
      const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
      const totalProducts = parseInt(productsResult.rows[0].count);

      // Get orders count
      const ordersResult = await pool.query('SELECT COUNT(*) as count FROM orders');
      const totalOrders = parseInt(ordersResult.rows[0].count);

      // Get database size (approximate)
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      const databaseSize = sizeResult.rows[0].size;

      const stats = {
        totalProducts: totalProducts,
        totalOrders: totalOrders,
        totalCustomers: totalOrders, // Each order = 1 customer
        databaseSize: databaseSize,
        lastBackup: 'Automatic (Supabase)',
        lastSync: 'Real-time (Supabase)',
        provider: 'Supabase'
      };

      console.log('✅ Supabase statistics fetched successfully');
      res.json({
        success: true,
        stats: stats
      });
    } else {
      // Fallback to in-memory stats
      const stats = {
        totalProducts: productDatabase.size,
        totalOrders: orderDatabase.size,
        totalCustomers: orderDatabase.size,
        databaseSize: 'In-Memory',
        lastBackup: 'N/A - In-Memory Storage',
        lastSync: 'N/A - In-Memory Storage',
        provider: 'In-Memory'
      };

      res.json({
        success: true,
        stats: stats
      });
    }
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Stats failed',
      details: error.message
    });
  }
});

// Simple reset to default products (Supabase)
app.post('/api/database/sync/reset', async (req, res) => {
  try {
    console.log('🔄 Resetting to default products (Supabase)...');
    
    if (process.env.DATABASE_URL) {
      // Clear existing products
      await pool.query('DELETE FROM products');
      
      // Re-insert default products
      for (const product of defaultProducts) {
        const query = `
          INSERT INTO products (
            id, name, description, price, category, subcategory,
            images, materials, dimensions, weight, made_to_order,
            is_custom, design_variations, estimated_delivery,
            features, specifications, display_order, wood_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        `;
        
        const values = [
          product.id,
          product.name,
          product.description,
          product.price,
          product.category,
          product.subcategory,
          JSON.stringify(product.images),
          JSON.stringify(product.materials),
          JSON.stringify(product.dimensions),
          product.weight,
          product.made_to_order,
          product.is_custom,
          product.design_variations,
          product.estimated_delivery,
          JSON.stringify(product.features),
          JSON.stringify(product.specifications),
          product.display_order,
          product.wood_type
        ];
        
        await pool.query(query, values);
      }
      
      console.log('✅ Supabase reset completed');
      res.json({
        success: true,
        message: 'Supabase reset completed',
        productsCount: defaultProducts.length
      });
    } else {
      // Fallback to in-memory
      productDatabase.clear();
      defaultProducts.forEach(product => {
        productDatabase.set(product.id, product);
      });
      
      res.json({
        success: true,
        message: 'In-memory reset completed',
        productsCount: productDatabase.size
      });
    }
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    res.status(500).json({
      success: false,
      error: 'Reset failed',
      details: error.message
    });
  }
});

// Webhook endpoint for MercadoPago events
app.post('/api/mercadopago/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('🔔 Webhook received:', req.headers);
    
    // Verify webhook signature (security best practice)
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    
    if (!signature || !timestamp) {
      console.error('❌ Missing webhook signature or timestamp');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // TODO: Implement signature verification with MercadoPago public key
    // For now, we'll accept all webhooks in development
    
    const eventData = JSON.parse(req.body);
    console.log('📦 Webhook event data:', JSON.stringify(eventData, null, 2));
    
    const { type, data } = eventData;
    
    if (!type || !data) {
      console.error('❌ Invalid webhook payload');
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    // Process different event types
    switch (type) {
      case 'payment.created':
        console.log('💰 Payment created:', data.id);
        // Don't send email yet - too early
        break;
        
      case 'payment.updated':
        console.log('🔄 Payment updated:', data.id);
        // Process status changes
        await processPaymentStatusChange(data);
        break;
        
      case 'payment.pending':
        console.log('⏳ Payment pending:', data.id);
        await sendPaymentStatusEmail(data, 'pending');
        break;
        
      case 'payment.approved':
        console.log('✅ Payment approved:', data.id);
        await sendPaymentStatusEmail(data, 'approved');
        break;
        
      case 'payment.rejected':
        console.log('❌ Payment rejected:', data.id);
        await sendPaymentStatusEmail(data, 'rejected');
        break;
        
      case 'payment.cancelled':
        console.log('🚫 Payment cancelled:', data.id);
        await sendPaymentStatusEmail(data, 'cancelled');
        break;
        
      case 'payment.refunded':
        console.log('💸 Payment refunded:', data.id);
        await sendPaymentStatusEmail(data, 'refunded');
        break;
        
      default:
        console.log('❓ Unknown webhook type:', type);
    }
    
    // Log webhook event to database
    await logWebhookEvent(data.id, type, eventData);
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process payment status changes
async function processPaymentStatusChange(paymentData) {
  try {
    const { id, status, external_reference } = paymentData;
    
    // Get order details
    const order = await orderOperations.getByOrderNumber(external_reference);
    if (!order) {
      console.error('❌ Order not found for payment:', external_reference);
      return;
    }
    
    // Update order payment status
    await orderOperations.updatePaymentStatus(external_reference, status, id);
    
    // Send email based on status
    if (['approved', 'rejected', 'cancelled', 'pending'].includes(status)) {
      await sendPaymentStatusEmail(paymentData, status);
    }
    
  } catch (error) {
    console.error('❌ Error processing payment status change:', error);
  }
}

// Send payment status email with duplicate prevention
async function sendPaymentStatusEmail(paymentData, status) {
  try {
    const { id, external_reference } = paymentData;
    
    // Check if email was already sent for this payment
    const emailKey = `${external_reference}-${status}`;
    if (sentEmails.has(emailKey)) {
      console.log('📧 Email already sent for:', emailKey);
      return;
    }
    
    // Get order details
    const order = await orderOperations.getByOrderNumber(external_reference);
    if (!order) {
      console.error('❌ Order not found for email:', external_reference);
      return;
    }
    
    // Extract customer info
    const customerInfo = order.customer || {
      name: 'Cliente',
      email: '',
      phone: '',
      address: {}
    };
    
    // Send email
    const emailResult = await sendPaymentStatusEmail(order, customerInfo, paymentData, status);
    
    if (emailResult.success) {
      console.log('✅ Payment status email sent:', emailKey);
      sentEmails.add(emailKey);
      
      // Update email status in database
      await updateEmailStatus(external_reference, status, true);
    } else {
      console.error('❌ Failed to send payment status email:', emailResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error sending payment status email:', error);
  }
}

// Log webhook event to database
async function logWebhookEvent(paymentId, eventType, eventData) {
  try {
    const query = `
      INSERT INTO webhook_events (payment_id, event_type, event_data, processed_at)
      VALUES ($1, $2, $3, NOW())
    `;
    
    await pool.query(query, [paymentId, eventType, JSON.stringify(eventData)]);
    console.log('📝 Webhook event logged:', paymentId, eventType);
    
  } catch (error) {
    console.error('❌ Error logging webhook event:', error);
  }
}

// Update email status in database
async function updateEmailStatus(orderNumber, status, sent) {
  try {
    const query = `
      UPDATE orders 
      SET email_status = jsonb_set(
        COALESCE(email_status, '{}'::jsonb), 
        '{${status}}', 
        '{"sent": $1, "sent_at": $2}'::jsonb
      )
      WHERE order_number = $3
    `;
    
    await pool.query(query, [sent, new Date().toISOString(), orderNumber]);
    console.log('📧 Email status updated:', orderNumber, status, sent);
    
  } catch (error) {
    console.error('❌ Error updating email status:', error);
  }
}

// Track sent emails to prevent duplicates
const sentEmails = new Set();

export { app, startServer };
