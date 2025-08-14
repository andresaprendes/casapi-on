// Field mapping utility to ensure consistency between database and frontend
// Database uses snake_case, Frontend expects camelCase

const mapOrderFields = (dbOrder) => {
  if (!dbOrder) return null;
  
  // Helper function to safely parse JSON
  const safeJsonParse = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse JSON:', value);
      return null;
    }
  };
  
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number || dbOrder.orderNumber,
    customerName: dbOrder.customer_name || dbOrder.customerName,
    customerEmail: dbOrder.customer_email || dbOrder.customerEmail,
    customerPhone: dbOrder.customer_phone || dbOrder.customerPhone,
    customerAddress: safeJsonParse(dbOrder.customer_address || dbOrder.customerAddress),
    items: safeJsonParse(dbOrder.items) || [],
    subtotal: parseFloat(dbOrder.subtotal) || 0,
    shipping: parseFloat(dbOrder.shipping) || 0,
    tax: parseFloat(dbOrder.tax) || 0,
    total: parseFloat(dbOrder.total) || 0,
    status: dbOrder.status,
    paymentStatus: dbOrder.payment_status || dbOrder.paymentStatus,
    paymentMethod: dbOrder.payment_method || dbOrder.paymentMethod,
    paymentId: dbOrder.payment_id || dbOrder.paymentId,
    shippingZone: dbOrder.shipping_zone || dbOrder.shippingZone,
    notes: dbOrder.notes,
    estimatedDelivery: dbOrder.estimated_delivery || dbOrder.estimatedDelivery,
    abandonedAt: dbOrder.abandoned_at || dbOrder.abandonedAt,
    retryCount: parseInt(dbOrder.retry_count) || 0,
    lastPaymentAttempt: dbOrder.last_payment_attempt || dbOrder.lastPaymentAttempt,
    createdAt: dbOrder.created_at || dbOrder.createdAt,
    updatedAt: dbOrder.updated_at || dbOrder.updatedAt
  };
};

const mapPaymentFields = (dbPayment) => {
  if (!dbPayment) return null;
  
  return {
    id: dbPayment.id,
    orderId: dbPayment.order_id,
    status: dbPayment.status,
    statusDetail: dbPayment.status_detail,
    externalReference: dbPayment.external_reference,
    transactionAmount: parseFloat(dbPayment.transaction_amount) || 0,
    currencyId: dbPayment.currency_id,
    paymentMethodId: dbPayment.payment_method_id,
    payerEmail: dbPayment.payer_email,
    dateCreated: dbPayment.date_created,
    dateApproved: dbPayment.date_approved,
    webhookVerified: dbPayment.webhook_verified,
    createdAt: dbPayment.created_at,
    updatedAt: dbPayment.updated_at
  };
};

const mapProductFields = (dbProduct) => {
  if (!dbProduct) return null;
  
  // Helper function to safely parse JSON
  const safeJsonParse = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('Failed to parse JSON:', value);
      return null;
    }
  };
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: parseFloat(dbProduct.price) || 0,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    images: safeJsonParse(dbProduct.images) || [],
    materials: safeJsonParse(dbProduct.materials) || [],
    dimensions: safeJsonParse(dbProduct.dimensions) || {},
    weight: parseFloat(dbProduct.weight) || 0,
    inStock: dbProduct.in_stock || dbProduct.inStock || true,
    isCustom: dbProduct.is_custom || dbProduct.isCustom || false,
    estimatedDelivery: dbProduct.estimated_delivery || dbProduct.estimatedDelivery,
    features: safeJsonParse(dbProduct.features) || [],
    specifications: safeJsonParse(dbProduct.specifications) || {},
    displayOrder: parseInt(dbProduct.display_order) || 0,
    createdAt: dbProduct.created_at || dbProduct.createdAt,
    updatedAt: dbProduct.updated_at || dbProduct.updatedAt
  };
};

// Map arrays of objects
const mapOrderArray = (dbOrders) => {
  return dbOrders.map(mapOrderFields);
};

const mapPaymentArray = (dbPayments) => {
  return dbPayments.map(mapPaymentFields);
};

const mapProductArray = (dbProducts) => {
  return dbProducts.map(mapProductFields);
};

module.exports = {
  mapOrderFields,
  mapPaymentFields,
  mapProductFields,
  mapOrderArray,
  mapPaymentArray,
  mapProductArray
};
