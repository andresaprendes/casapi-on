#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the base64 images
const base64ImagesPath = path.join(__dirname, '..', 'src', 'data', 'base64Images.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function updateProductsWithBase64() {
  try {
    logInfo('Updating products with base64 images...');
    
    // Check if base64 images file exists
    if (!fs.existsSync(base64ImagesPath)) {
      logError(`Base64 images file not found: ${base64ImagesPath}`);
      logInfo('Run the convert-images-to-base64.js script first');
      return;
    }
    
    // Read the base64 images file
    const base64ImagesContent = fs.readFileSync(base64ImagesPath, 'utf8');
    
    // Extract the base64Images object using regex
    const base64Match = base64ImagesContent.match(/export const base64Images = ({[\s\S]*?});/);
    if (!base64Match) {
      logError('Could not extract base64Images from file');
      return;
    }
    
    // Parse the base64 images
    const base64Images = eval(`(${base64Match[1]})`);
    
    logInfo(`Found ${Object.keys(base64Images).length} base64 images`);
    
    // Read the server file
    const serverFilePath = path.join(__dirname, '..', 'server', 'mercadopago-api.js');
    let serverContent = fs.readFileSync(serverFilePath, 'utf8');
    
    // Define product image mappings
    const productImageMappings = {
      '1': ['image-1755135305383-454296344.png'], // Mesa de Comedor
      '2': ['image-1755136170928-605023865.webp', 'image-1755136180161-48892126.webp'], // Puerta Principal
      '3': ['image-1755136374138-27692147.webp'], // Cama Queen
      '4': ['image-1755137369333-477927924.png'], // Estantería
      '5': ['image-1755137545858-681902723.png'], // Mesa de Centro
      '6': ['image-1755137657743-535686656.png'], // Escritorio
      '7': ['image-1755138001829-743849468.png']  // Silla
    };
    
    // Update each product with its base64 images
    for (const [productId, imageFilenames] of Object.entries(productImageMappings)) {
      const base64ImageUrls = imageFilenames.map(filename => {
        if (base64Images[filename]) {
          return base64Images[filename];
        } else {
          logError(`Base64 image not found for: ${filename}`);
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Placeholder
        }
      });
      
      // Create the images array string
      const imagesArrayString = JSON.stringify(base64ImageUrls);
      
      // Find and replace the images array for this product
      const productPattern = new RegExp(`(id: '${productId}',[\\s\\S]*?images: \\[)[^\\]]*\\]`, 'g');
      const replacement = `$1${imagesArrayString.slice(1, -1)}]`;
      
      serverContent = serverContent.replace(productPattern, replacement);
      
      logSuccess(`Updated product ${productId} with ${base64ImageUrls.length} images`);
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(serverFilePath, serverContent);
    
    logSuccess(`Updated server file: ${serverFilePath}`);
    logInfo('Products now use base64 images stored in the database');
    
  } catch (error) {
    logError(`Update failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the update
updateProductsWithBase64();
