import { Pool } from 'pg';

// Supabase connection
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.rmkgligugxlultnufwzg:2b11b4e61B_@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

// Map of product IDs to actual image files
const imageMapping = {
  "1": ["/images/products/product-20250817-175845-578511166.webp"], // Mesa de Comedor
  "2": ["/images/products/product-20250817-180550-394206933.webp", "/images/products/product-20250817-180624-462646884.webp"], // Puerta Principal (2 images)
  "3": ["/images/products/product-20250817-180649-525940130.webp"], // Cama Queen
  "4": ["/images/products/product-20250817-180624-462646884.webp"], // Estantería
  "5": ["/images/products/product-20250817-180550-394206933.webp"], // Mesa de Centro
  "6": ["/images/products/product-20250817-175845-578511166.webp"], // Escritorio
  "test-5000": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="] // Test product
};

async function fixImagePaths() {
  try {
    console.log('🚀 Fixing product image paths in Supabase...');
    
    // Test connection
    const testResult = await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase:', testResult.rows[0]);
    
    // Update each product with correct image paths
    for (const [productId, images] of Object.entries(imageMapping)) {
      console.log(`🖼️  Updating product ${productId} with images:`, images);
      
      const query = `
        UPDATE products 
        SET images = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      const result = await supabasePool.query(query, [JSON.stringify(images), productId]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated product ${productId}`);
      } else {
        console.log(`⚠️  Product ${productId} not found`);
      }
    }
    
    // Verify the updates
    console.log('🔍 Verifying updates...');
    const productsResult = await supabasePool.query('SELECT id, name, images FROM products ORDER BY id');
    
    console.log('📋 Updated products:');
    productsResult.rows.forEach(product => {
      console.log(`  - ${product.id}: ${product.name}`);
      console.log(`    Images: ${JSON.stringify(product.images)}`);
    });
    
    console.log('🎉 Image paths fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
  } finally {
    await supabasePool.end();
  }
}

fixImagePaths();
