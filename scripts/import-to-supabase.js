import { Pool } from 'pg';

// Supabase connection
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.rmkgligugxlultnufwzg:2b11b4e61B_@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

// Current products data
const products = [
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

async function importProducts() {
  try {
    console.log('🚀 Connecting to Supabase...');
    
    // Test connection
    const testResult = await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase:', testResult.rows[0]);
    
    // Create products table if it doesn't exist
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
    
    console.log('✅ Products table created/verified');
    
    // Clear existing products
    console.log('🗑️ Clearing existing products...');
    await supabasePool.query('DELETE FROM products');
    
    // Insert products
    console.log('📦 Inserting products...');
    for (const product of products) {
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
    
    // Verify import
    const countResult = await supabasePool.query('SELECT COUNT(*) as count FROM products');
    console.log(`🎉 Import complete! ${countResult.rows[0].count} products imported`);
    
    // Show products
    const productsResult = await supabasePool.query('SELECT id, name, price FROM products ORDER BY id');
    console.log('📋 Imported products:');
    productsResult.rows.forEach(product => {
      console.log(`  - ${product.id}: ${product.name} ($${product.price})`);
    });
    
  } catch (error) {
    console.error('❌ Error importing products:', error);
  } finally {
    await supabasePool.end();
  }
}

importProducts();
