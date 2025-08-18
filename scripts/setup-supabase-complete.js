import { Pool } from 'pg';

// Supabase connection
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.rmkgligugxlultnufwzg:2b11b4e61B_@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Setting up complete Supabase database...');
    
    // Test connection
    const testResult = await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase:', testResult.rows[0]);
    
    // Create products table
    console.log('🔧 Creating products table...');
    await supabasePool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        images JSONB,
        materials JSONB,
        dimensions JSONB,
        weight DECIMAL(8,2),
        made_to_order BOOLEAN DEFAULT TRUE,
        is_custom BOOLEAN DEFAULT FALSE,
        design_variations TEXT,
        estimated_delivery VARCHAR(100),
        features JSONB,
        specifications JSONB,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        wood_type VARCHAR(100)
      )
    `);
    
    // Create orders table
    console.log('🔧 Creating orders table...');
    await supabasePool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_info JSONB NOT NULL,
        items JSONB NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_id VARCHAR(100),
        payment_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estimated_delivery VARCHAR(100),
        notes TEXT,
        abandoned_at TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        last_payment_attempt TIMESTAMP
      )
    `);
    
    // Create payments table
    console.log('🔧 Creating payments table...');
    await supabasePool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        payment_id VARCHAR(100) UNIQUE NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(100),
        payment_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        external_reference VARCHAR(100),
        preference_id VARCHAR(100)
      )
    `);
    
    // Create backup_log table
    console.log('🔧 Creating backup_log table...');
    await supabasePool.query(`
      CREATE TABLE IF NOT EXISTS backup_log (
        id SERIAL PRIMARY KEY,
        backup_type VARCHAR(50) NOT NULL,
        filename VARCHAR(255),
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed',
        notes TEXT
      )
    `);
    
    console.log('✅ All tables created successfully');
    
    // Check if products exist, if not import them
    const productsCount = await supabasePool.query('SELECT COUNT(*) as count FROM products');
    if (parseInt(productsCount.rows[0].count) === 0) {
      console.log('📦 No products found, importing default products...');
      
      const defaultProducts = [
        {
          id: "6",
          name: "Escritorio Ejecutivo de Piñón",
          description: "Escritorio ejecutivo fabricado en madera de piñón con cajones tallados y amplío espacio de trabajo. Ideal para oficinas que valoran la elegancia y funcionalidad.",
          price: "3200000.00",
          category: "oficina",
          subcategory: "escritorios",
          images: ["/images/products/product-7.webp"],
          materials: ["Piñón macizo", "Herrajes de bronce", "Barniz satinado"],
          dimensions: { width: 70, height: 75, length: 150 },
          weight: "50.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "5-7 semanas",
          features: ["Cajones tallados", "Amplio espacio", "Diseño ejecutivo"],
          specifications: { "Acabado": "Barniz satinado", "Material": "Piñón macizo", "Garantía": "3 años", "Dimensiones": "150x70cm" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "5",
          name: "Mesa de Centro de Piñón",
          description: "Mesa de centro única fabricada en madera de piñón con detalles tallados. Pieza central perfecta para tu sala que refleja la tradición y calidad de Casa Piñón.",
          price: "1500000.00",
          category: "sala",
          subcategory: "mesas-centro",
          images: ["/images/products/product-6.webp"],
          materials: ["Piñón macizo", "Tallado decorativo", "Barniz natural"],
          dimensions: { width: 60, height: 45, length: 120 },
          weight: "25.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "2-4 semanas",
          features: ["Diseño único", "Tallado decorativo", "Madera de piñón auténtica"],
          specifications: { "Acabado": "Barniz natural", "Material": "Piñón macizo", "Garantía": "3 años", "Dimensiones": "120x60cm" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "4",
          name: "Estantería Artesanal de Piñón",
          description: "Estantería de 5 niveles fabricada en madera de piñón con diseño artesanal. Perfecta para exhibir libros y objetos decorativos con el toque auténtico del piñón.",
          price: "1800000.00",
          category: "sala",
          subcategory: "estanterias",
          images: ["/images/products/product-5.webp"],
          materials: ["Piñón macizo", "Barniz natural", "Tallado artesanal"],
          dimensions: { width: 35, height: 180, length: 100 },
          weight: "35.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "3-5 semanas",
          features: ["5 niveles", "Diseño artesanal", "Madera de piñón"],
          specifications: { "Acabado": "Barniz natural", "Niveles": "5", "Material": "Piñón macizo", "Garantía": "3 años" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "3",
          name: "Cama Queen de Piñón",
          description: "Cama queen size fabricada en madera de piñón con cabecera tallada a mano. Diseño único que combina tradición y elegancia para tu habitación.",
          price: "2200000.00",
          category: "habitacion",
          subcategory: "camas",
          images: ["/images/products/product-4.webp"],
          materials: ["Piñón macizo", "Tallado artesanal", "Barniz natural"],
          dimensions: { width: 160, height: 120, length: 200 },
          weight: "40.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "4-6 semanas",
          features: ["Tamaño Queen", "Cabecera tallada", "Madera de piñón auténtica"],
          specifications: { "Acabado": "Barniz natural", "Tamaño": "Queen (200x160cm)", "Material": "Piñón macizo", "Garantía": "3 años" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "2",
          name: "Puerta Principal de Piñón",
          description: "Puerta principal fabricada en madera de piñón maciza con herrajes de bronce. Diseño tradicional que aporta elegancia y seguridad a tu hogar.",
          price: "1200000.00",
          category: "puertas",
          subcategory: "principales",
          images: ["/images/products/product-2.webp", "/images/products/product-3.webp"],
          materials: ["Piñón macizo", "Herrajes de bronce", "Barniz protector"],
          dimensions: { width: 90, height: 6, length: 210 },
          weight: "35.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "3-5 semanas",
          features: ["Piñón macizo", "Herrajes de bronce", "Resistente a la intemperie"],
          specifications: { "Acabado": "Barniz protector", "Material": "Piñón macizo", "Garantía": "5 años", "Dimensiones": "210x90cm" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "1",
          name: "Mesa de Comedor de Piñón",
          description: "Mesa de comedor elegante fabricada en madera de piñón maciza, perfecta para 6 personas. Acabados de primera calidad con barniz natural que resalta la belleza única del piñón.",
          price: "2800000.00",
          category: "comedor",
          subcategory: "mesas",
          images: ["/images/products/product-1.webp"],
          materials: ["Piñón macizo", "Barniz natural"],
          dimensions: { width: 90, height: 75, length: 180 },
          weight: "45.00",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "4-6 semanas",
          features: ["Asientos para 6 personas", "Madera de piñón auténtica", "Diseño clásico"],
          specifications: { "Acabado": "Barniz natural", "Material": "Piñón macizo", "Capacidad": "6 personas", "Garantía": "3 años" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        },
        {
          id: "test-5000",
          name: "Producto de Prueba - 5000 COP",
          description: "Este es un producto de prueba económico para probar el sistema de pagos. Perfecto para realizar transacciones de prueba con un valor bajo.",
          price: "5000.00",
          category: "test",
          subcategory: "prueba",
          images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="],
          materials: ["Madera de prueba", "Acabado básico"],
          dimensions: { width: 10, height: 5, length: 10 },
          weight: "0.10",
          in_stock: true,
          is_custom: false,
          estimated_delivery: "1-2 días",
          features: ["Producto de prueba", "Precio mínimo", "Entrega rápida"],
          specifications: { "Peso": "100g", "Tipo": "Producto de prueba", "Material": "Madera de prueba", "Garantía": "Sin garantía" },
          display_order: 0,
          made_to_order: true,
          design_variations: null,
          wood_type: null
        }
      ];
      
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
        
        await supabasePool.query(query, values);
        console.log(`✅ Inserted product: ${product.name}`);
      }
    } else {
      console.log('✅ Products already exist');
    }
    
    // Show final status
    const productsResult = await supabasePool.query('SELECT COUNT(*) as count FROM products');
    const ordersResult = await supabasePool.query('SELECT COUNT(*) as count FROM orders');
    const paymentsResult = await supabasePool.query('SELECT COUNT(*) as count FROM payments');
    
    console.log('🎉 Database setup complete!');
    console.log(`📊 Status:`);
    console.log(`  - Products: ${productsResult.rows[0].count}`);
    console.log(`  - Orders: ${ordersResult.rows[0].count}`);
    console.log(`  - Payments: ${paymentsResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await supabasePool.end();
  }
}

setupCompleteDatabase();
