const { pool, updateTimestamp } = require('./database');

// Order operations
const orderOperations = {
  // Create a new order
  async create(orderData) {
    const {
      id,
      orderNumber,
      customer,
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingZone,
      paymentMethod,
      notes,
      estimatedDelivery
    } = orderData;

    const query = `
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        customer_address, items, subtotal, shipping, tax, total,
        shipping_zone, payment_method, notes, estimated_delivery
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      id,
      orderNumber,
      customer.name,
      customer.email,
      customer.phone,
      JSON.stringify(customer.address),
      JSON.stringify(items),
      subtotal,
      shipping,
      tax,
      total,
      shippingZone,
      paymentMethod,
      notes,
      estimatedDelivery
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get order by ID
  async getById(orderId) {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  },

  // Get order by order number
  async getByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    return result.rows[0];
  },

  // Get all orders with filtering
  async getAll(filters = {}) {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    if (filters.status) {
      query += ` AND status = $${valueIndex}`;
      values.push(filters.status);
      valueIndex++;
    }

    if (filters.paymentStatus) {
      query += ` AND payment_status = $${valueIndex}`;
      values.push(filters.paymentStatus);
      valueIndex++;
    }

    if (filters.paymentMethod) {
      query += ` AND payment_method = $${valueIndex}`;
      values.push(filters.paymentMethod);
      valueIndex++;
    }

    if (filters.dateFrom) {
      query += ` AND created_at >= $${valueIndex}`;
      values.push(filters.dateFrom);
      valueIndex++;
    }

    if (filters.dateTo) {
      query += ` AND created_at <= $${valueIndex}`;
      values.push(filters.dateTo);
      valueIndex++;
    }

    if (filters.search) {
      query += ` AND (order_number ILIKE $${valueIndex} OR customer_name ILIKE $${valueIndex} OR customer_email ILIKE $${valueIndex})`;
      values.push(`%${filters.search}%`);
      valueIndex++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${valueIndex}`;
      values.push(filters.limit);
      valueIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${valueIndex}`;
      values.push(filters.offset);
      valueIndex++;
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Update order
  async update(orderId, updates) {
    const setClause = [];
    const values = [];
    let valueIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        setClause.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${valueIndex}`);
        values.push(updates[key]);
        valueIndex++;
      }
    });

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(orderId);

    const query = `UPDATE orders SET ${setClause.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete order
  async delete(orderId) {
    const query = 'DELETE FROM orders WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  },

  // Get order statistics
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total END), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value
      FROM orders
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Clean up abandoned orders
  async cleanupAbandoned(hours = 24) {
    const query = `
      UPDATE orders 
      SET abandoned_at = CURRENT_TIMESTAMP 
      WHERE status = 'pending' 
        AND payment_status = 'pending' 
        AND created_at < NOW() - INTERVAL '${hours} hours'
        AND abandoned_at IS NULL
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }
};

// Payment operations
const paymentOperations = {
  // Create or update payment
  async upsert(paymentData) {
    const {
      id,
      orderId,
      status,
      statusDetail,
      externalReference,
      transactionAmount,
      currencyId,
      paymentMethodId,
      payerEmail,
      dateCreated,
      dateApproved,
      webhookVerified
    } = paymentData;

    const query = `
      INSERT INTO payments (
        id, order_id, status, status_detail, external_reference,
        transaction_amount, currency_id, payment_method_id, payer_email,
        date_created, date_approved, webhook_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        status_detail = EXCLUDED.status_detail,
        external_reference = EXCLUDED.external_reference,
        transaction_amount = EXCLUDED.transaction_amount,
        currency_id = EXCLUDED.currency_id,
        payment_method_id = EXCLUDED.payment_method_id,
        payer_email = EXCLUDED.payer_email,
        date_created = EXCLUDED.date_created,
        date_approved = EXCLUDED.date_approved,
        webhook_verified = EXCLUDED.webhook_verified,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      id,
      orderId,
      status,
      statusDetail,
      externalReference,
      transactionAmount,
      currencyId,
      paymentMethodId,
      payerEmail,
      dateCreated,
      dateApproved,
      webhookVerified
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Get payment by ID
  async getById(paymentId) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [paymentId]);
    return result.rows[0];
  },

  // Get payments by order ID
  async getByOrderId(orderId) {
    const query = 'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }
};

// Product operations
const productOperations = {
  // Create a new product
  async create(productData) {
    try {
      const {
        id,
        name,
        description,
        price,
        category,
        subcategory,
        images,
        materials,
        dimensions,
        weight,
        inStock,
        isCustom,
        estimatedDelivery,
        features,
        specifications
      } = productData;

      console.log(`🔍 Creating product with ID: ${id}`);
      console.log(`🔍 Product name: ${name}`);

      const query = `
        INSERT INTO products (
          id, name, description, price, category, subcategory,
          images, materials, dimensions, weight, in_stock, is_custom,
          estimated_delivery, features, specifications
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const values = [
        id,
        name,
        description,
        price,
        category,
        subcategory,
        JSON.stringify(images),
        JSON.stringify(materials),
        JSON.stringify(dimensions),
        weight,
        inStock,
        isCustom,
        estimatedDelivery,
        JSON.stringify(features),
        JSON.stringify(specifications)
      ];

      console.log(`🔍 Executing query with ${values.length} parameters`);
      const result = await pool.query(query, values);
      console.log(`✅ Product created successfully: ${result.rows[0].name}`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error in product creation:`, error);
      console.error(`❌ Product data:`, JSON.stringify(productData, null, 2));
      throw error;
    }
  },

  // Get all products
  async getAll() {
    const query = 'SELECT * FROM products ORDER BY display_order ASC, created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  // Get product by ID
  async getById(productId) {
    const query = 'SELECT * FROM products WHERE id = $1';
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  },

  // Update product
  async update(productId, updates) {
    const setClause = [];
    const values = [];
    let valueIndex = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        setClause.push(`${dbKey} = $${valueIndex}`);
        values.push(updates[key]);
        valueIndex++;
      }
    });

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(productId);

    const query = `UPDATE products SET ${setClause.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete product
  async delete(productId) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  },

  // Initialize with default products
  async initializeWithDefaults(defaultProducts) {
    console.log('🔄 Starting product initialization...');
    console.log('📊 Products to create:', defaultProducts.length);
    
    for (const product of defaultProducts) {
      try {
        console.log(`📦 Creating product: ${product.name} (ID: ${product.id})`);
        const createdProduct = await this.create(product);
        console.log(`✅ Created product: ${createdProduct.name}`);
      } catch (error) {
        if (error.code === '23505') { // Duplicate key error
          console.log(`⚠️  Product already exists: ${product.name}`);
        } else {
          console.error(`❌ Error creating product ${product.name}:`, error);
          console.error('Product data:', JSON.stringify(product, null, 2));
        }
      }
    }
    
    console.log('✅ Product initialization completed');
  }
};

module.exports = {
  orderOperations,
  paymentOperations,
  productOperations
};
