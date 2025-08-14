// Field mapping utility to ensure consistency between database and frontend
// Database uses snake_case, Frontend expects camelCase

const mapOrderFields = (dbOrder) => {
  if (!dbOrder) return null;
  
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerName: dbOrder.customer_name,
    customerEmail: dbOrder.customer_email,
    customerPhone: dbOrder.customer_phone,
    customerAddress: dbOrder.customer_address ? JSON.parse(dbOrder.customer_address) : null,
    items: dbOrder.items ? JSON.parse(dbOrder.items) : [],
    subtotal: parseFloat(dbOrder.subtotal) || 0,
    shipping: parseFloat(dbOrder.shipping) || 0,
    tax: parseFloat(dbOrder.tax) || 0,
    total: parseFloat(dbOrder.total) || 0,
    status: dbOrder.status,
    paymentStatus: dbOrder.payment_status,
    paymentMethod: dbOrder.payment_method,
    paymentId: dbOrder.payment_id,
    shippingZone: dbOrder.shipping_zone,
    notes: dbOrder.notes,
    estimatedDelivery: dbOrder.estimated_delivery,
    abandonedAt: dbOrder.abandoned_at,
    retryCount: parseInt(dbOrder.retry_count) || 0,
    lastPaymentAttempt: dbOrder.last_payment_attempt,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at
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
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: parseFloat(dbProduct.price) || 0,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    images: dbProduct.images ? JSON.parse(dbProduct.images) : [],
    materials: dbProduct.materials ? JSON.parse(dbProduct.materials) : [],
    dimensions: dbProduct.dimensions ? JSON.parse(dbProduct.dimensions) : {},
    weight: parseFloat(dbProduct.weight) || 0,
    inStock: dbProduct.in_stock,
    isCustom: dbProduct.is_custom,
    estimatedDelivery: dbProduct.estimated_delivery,
    features: dbProduct.features ? JSON.parse(dbProduct.features) : [],
    specifications: dbProduct.specifications ? JSON.parse(dbProduct.specifications) : {},
    displayOrder: parseInt(dbProduct.display_order) || 0,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at
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
