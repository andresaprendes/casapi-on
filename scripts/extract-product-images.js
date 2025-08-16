import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the mercadopago-api.js file
const apiFile = path.join(__dirname, '../server/mercadopago-api.js');
const content = fs.readFileSync(apiFile, 'utf8');

// Find the defaultProducts array
const productsMatch = content.match(/const defaultProducts = \[([\s\S]*?)\];/);
if (!productsMatch) {
  console.error('❌ Could not find defaultProducts array');
  process.exit(1);
}

// Extract the products content
const productsContent = productsMatch[1];

// Find all base64 image strings
const base64Regex = /"data:image\/[^;]+;base64,([^"]+)"/g;
const matches = [...productsContent.matchAll(base64Regex)];

console.log(`🔍 Found ${matches.length} base64 images`);

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../server/public/images/products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Extract and save each image
let imageCount = 0;
matches.forEach((match, index) => {
  try {
    const base64Data = match[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate filename based on index
    const filename = `product-${index + 1}.webp`;
    const filepath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filepath, imageBuffer);
    console.log(`✅ Saved ${filename} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
    imageCount++;
    
  } catch (error) {
    console.error(`❌ Error saving image ${index + 1}:`, error.message);
  }
});

console.log(`\n🎉 Successfully extracted ${imageCount} images to ${imagesDir}`);
console.log(`📁 Images saved in: ${imagesDir}`);
