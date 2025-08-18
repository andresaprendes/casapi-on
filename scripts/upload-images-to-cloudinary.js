import { v2 as cloudinary } from 'cloudinary';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Cloudinary config (you'll need to get these from cloudinary.com)
cloudinary.config({
  cloud_name: 'dstbttvrn',
  api_key: '818938823496785',
  api_secret: '8QPRY4HKE38dje4DYT2hL3FYp1g'
});

// Supabase connection
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.rmkgligugxlultnufwzg:2b11b4e61B_@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
});

// Map of product IDs to image files
const imageMapping = {
  "1": ["product-1.webp"], // Mesa de Comedor
  "2": ["product-2.webp", "product-3.webp"], // Puerta Principal
  "3": ["product-4.webp"], // Cama Queen
  "4": ["product-5.webp"], // Estantería
  "5": ["product-6.webp"], // Mesa de Centro
  "6": ["product-7.webp"], // Escritorio
  "test-5000": null // Test product uses base64
};

async function uploadImagesToCloudinary() {
  try {
    console.log('🚀 Starting Cloudinary upload...');
    
    // Test connection
    const testResult = await supabasePool.query('SELECT NOW()');
    console.log('✅ Connected to Supabase:', testResult.rows[0]);
    
    const uploadResults = {};
    
    // Upload each product's images
    for (const [productId, imageFiles] of Object.entries(imageMapping)) {
      if (!imageFiles) continue; // Skip test product
      
      console.log(`📤 Uploading images for product ${productId}...`);
      const uploadedUrls = [];
      
      for (const imageFile of imageFiles) {
        const imagePath = path.join(process.cwd(), 'server', 'public', 'images', 'products', imageFile);
        
        if (fs.existsSync(imagePath)) {
          console.log(`  📁 Uploading: ${imageFile}`);
          
          try {
            const result = await cloudinary.uploader.upload(imagePath, {
              folder: 'casa-pinon/products',
              public_id: `product-${productId}-${imageFile.replace('.webp', '')}`,
              overwrite: true
            });
            
            uploadedUrls.push(result.secure_url);
            console.log(`  ✅ Uploaded: ${result.secure_url}`);
          } catch (error) {
            console.error(`  ❌ Failed to upload ${imageFile}:`, error.message);
          }
        } else {
          console.log(`  ⚠️  File not found: ${imagePath}`);
        }
      }
      
      uploadResults[productId] = uploadedUrls;
    }
    
    // Update database with Cloudinary URLs
    console.log('🔄 Updating database with Cloudinary URLs...');
    
    for (const [productId, urls] of Object.entries(uploadResults)) {
      if (urls.length > 0) {
        console.log(`📝 Updating product ${productId} with URLs:`, urls);
        
        const query = `
          UPDATE products 
          SET images = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        
        const result = await supabasePool.query(query, [JSON.stringify(urls), productId]);
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated product ${productId}`);
        } else {
          console.log(`⚠️  Product ${productId} not found`);
        }
      }
    }
    
    console.log('🎉 Cloudinary upload complete!');
    console.log('📋 Results:', uploadResults);
    
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
  } finally {
    await supabasePool.end();
  }
}

uploadImagesToCloudinary();
