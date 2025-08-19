import { pool, updateTimestamp } from './database.js';

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

    // Check if we're using Supabase schema (customer_info JSONB) or PostgreSQL schema (separate columns)
    const isSupabaseSchema = await this.checkSupabaseSchema();
    
    if (isSupabaseSchema) {
      // Supabase schema - use customer_info JSONB
      const query = `
        INSERT INTO orders (
          order_number, customer_info, items, total_amount,
          status, payment_status, estimated_delivery, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        orderNumber,
        JSON.stringify(customer),
        JSON.stringify(items),
        total,
        'pending',
        'pending',
        estimatedDelivery,
        notes
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } else {
      // PostgreSQL schema - use separate customer columns
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
    }
  },

  // Helper function to check if we're using Supabase schema
  async checkSupabaseSchema() {
    try {
      const result = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'customer_info'
      `);
      return result.rows.length > 0;
    } catch (error) {
      console.log('Schema check error:', error.message);
      return false;
    }
  },

  // Transform order row to standard format
  transformOrderRow(row) {
    if (row.customer_info) {
      // Supabase schema - customer_info is JSONB
      const customer = typeof row.customer_info === 'string' 
        ? JSON.parse(row.customer_info) 
        : row.customer_info;
      
      return {
        ...row,
        orderNumber: row.order_number,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentId: row.payment_id,
        estimatedDelivery: row.estimated_delivery,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        customer: customer,
        total: row.total_amount
      };
    } else {
      // PostgreSQL schema - separate customer columns
      return {
        ...row,
        orderNumber: row.order_number,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentId: row.payment_id,
        shippingZone: row.shipping_zone,
        estimatedDelivery: row.estimated_delivery,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone,
          address: row.customer_address
        }
      };
    }
  },

  // Get order by ID
  async getById(orderId) {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [orderId]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return orderOperations.transformOrderRow(row);
    }
    return null;
  },

  // Get order by order number
  async getByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    if (result.rows[0]) {
      const row = result.rows[0];
      return orderOperations.transformOrderRow(row);
    }
    return null;
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
      // Check if we're using Supabase schema
      const isSupabaseSchema = await this.checkSupabaseSchema();
      if (isSupabaseSchema) {
        // Supabase schema - search in customer_info JSONB
        query += ` AND (order_number ILIKE $${valueIndex} OR customer_info::text ILIKE $${valueIndex})`;
      } else {
        // PostgreSQL schema - search in separate customer columns
        query += ` AND (order_number ILIKE $${valueIndex} OR customer_name ILIKE $${valueIndex} OR customer_email ILIKE $${valueIndex})`;
      }
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
    
    // Transform database rows using the transformOrderRow function
    return result.rows.map(row => orderOperations.transformOrderRow(row));
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
    if (result.rows[0]) {
      const row = result.rows[0];
      return {
        ...row,
        orderNumber: row.order_number,
        paymentStatus: row.payment_status,
        paymentMethod: row.payment_method,
        paymentId: row.payment_id,
        shippingZone: row.shipping_zone,
        estimatedDelivery: row.estimated_delivery,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone,
          address: row.customer_address
        }
      };
    }
    return null;
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

  // Update payment status
  async updatePaymentStatus(orderNumber, status, paymentId = null) {
    try {
      const query = `
        UPDATE orders 
        SET 
          payment_status = $1,
          payment_id = COALESCE($2, payment_id),
          updated_at = CURRENT_TIMESTAMP
        WHERE order_number = $3
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, paymentId, orderNumber]);
      
      if (result.rows[0]) {
        console.log(`✅ Payment status updated for order ${orderNumber}: ${status}`);
        return orderOperations.transformOrderRow(result.rows[0]);
      } else {
        console.error(`❌ Order not found for payment status update: ${orderNumber}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error updating payment status:', error);
      throw error;
    }
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
  },

  // Get pending payments that have timed out
  async getPendingPaymentsForTimeout() {
    const query = `
      SELECT p.*, o.payment_method
      FROM payments p
      JOIN orders o ON p.external_reference = o.order_number
      WHERE p.status = 'pending'
        AND o.payment_status = 'pending'
        AND (
          -- PSE payments: 45 minutes timeout (longer processing time)
          (o.payment_method = 'pse' AND p.date_created < NOW() - INTERVAL '45 minutes')
          OR
          -- Other payments: 20 minutes timeout
          (o.payment_method != 'pse' AND p.date_created < NOW() - INTERVAL '20 minutes')
        )
        AND o.abandoned_at IS NULL
    `;
    const result = await pool.query(query);
    return result.rows;
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
        sizeOptions,
        weight,
        isCustom,
        designVariations,
        estimatedDelivery,
        features,
        specifications,
        woodType
      } = productData;

      console.log(`🔍 Creating product with ID: ${id}`);
      console.log(`🔍 Product name: ${name}`);
      console.log(`🔍 Wood type: ${woodType}`);

      const query = `
        INSERT INTO products (
          id, name, description, price, category, subcategory,
          images, materials, dimensions, size_options, weight, is_custom,
          design_variations, estimated_delivery, features, specifications, wood_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
        JSON.stringify(sizeOptions || []),
        weight,
        isCustom,
        designVariations,
        estimatedDelivery,
        JSON.stringify(features),
        JSON.stringify(specifications),
        woodType
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
        
        // Handle JSON fields properly
        if (['images', 'materials', 'dimensions', 'features', 'specifications', 'sizeOptions'].includes(key)) {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        
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
    
    // First, check if products already exist in the database
    try {
      const existingProducts = await this.getAll();
      if (existingProducts.length > 0) {
        console.log(`📊 Database already contains ${existingProducts.length} products. Skipping initialization.`);
        console.log('✅ Product initialization completed (skipped - products already exist)');
        return;
      }
    } catch (error) {
      console.log('⚠️  Could not check existing products, proceeding with initialization...');
    }
    
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

export {
  orderOperations,
  paymentOperations,
  productOperations
};
