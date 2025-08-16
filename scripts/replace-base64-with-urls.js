import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the mercadopago-api.js file
const apiFile = path.join(__dirname, '../server/mercadopago-api.js');
let content = fs.readFileSync(apiFile, 'utf8');

console.log('🔍 Reading mercadopago-api.js...');

// Product image mappings
const productImages = {
  '1': '/images/products/product-1.webp',  // Mesa de Comedor
  '2': '/images/products/product-2.webp',  // Puerta Principal
  '3': '/images/products/product-3.webp',  // Silla de Comedor
  '4': '/images/products/product-4.webp',  // Estante de Piñón
  '5': '/images/products/product-5.webp',  // Mesa de Centro
  '6': '/images/products/product-6.webp',  // Cabeceira de Cama
  '7': '/images/products/product-7.webp'   // Escritorio
};

// Find and replace base64 images with URLs
let replacementCount = 0;
Object.entries(productImages).forEach(([productId, imageUrl]) => {
  // Find the base64 image for this product
  const base64Regex = new RegExp(`"data:image/[^;]+;base64,[^"]*"`, 'g');
  const matches = content.match(base64Regex);
  
  if (matches && matches.length > 0) {
    // Replace the first base64 image found with the URL
    content = content.replace(matches[0], `"${imageUrl}"`);
    replacementCount++;
    console.log(`✅ Replaced base64 for product ${productId} with ${imageUrl}`);
  }
});

// Add the productImages import at the top
const importStatement = `import { getProductImage } from './data/productImages.js';\n`;
if (!content.includes('import { getProductImage }')) {
  content = content.replace(
    'const express = require(\'express\');',
    `const express = require('express');\nconst { getProductImage } = require('./data/productImages');`
  );
}

// Write the updated content back
fs.writeFileSync(apiFile, content, 'utf8');

console.log(`\n🎉 Successfully replaced ${replacementCount} base64 images with URLs`);
console.log(`📁 Updated file: ${apiFile}`);

// Check new file size
const stats = fs.statSync(apiFile);
const newSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`📊 New file size: ${newSizeMB}MB`);

// Calculate size reduction
const oldSizeMB = 7.0;
const reduction = ((oldSizeMB - newSizeMB) / oldSizeMB * 100).toFixed(1);
console.log(`📉 Size reduction: ${reduction}%`);
