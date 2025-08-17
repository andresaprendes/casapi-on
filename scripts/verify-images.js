#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function verifyImages() {
  log('🔍 Verificando imágenes en mockData.ts...', 'info');
  
  const publicImagesPath = path.join(__dirname, '..', 'public', 'images');
  const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
  
  // Read mockData.ts
  const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
  
  // Extract all image paths
  const imageRegex = /\/images\/[^'"]+\.webp/g;
  const imagePaths = mockDataContent.match(imageRegex) || [];
  
  log(`📁 Encontradas ${imagePaths.length} referencias de imágenes en mockData.ts`, 'info');
  
  // Check if each image exists
  let missingImages = [];
  let existingImages = [];
  
  imagePaths.forEach(imagePath => {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      existingImages.push(imagePath);
      log(`✅ ${imagePath}`, 'success');
    } else {
      missingImages.push(imagePath);
      log(`❌ ${imagePath} - NO ENCONTRADO`, 'error');
    }
  });
  
  // Summary
  log('\n📊 RESUMEN:', 'info');
  log(`✅ Imágenes existentes: ${existingImages.length}`, 'success');
  log(`❌ Imágenes faltantes: ${missingImages.length}`, missingImages.length > 0 ? 'error' : 'success');
  
  if (missingImages.length > 0) {
    log('\n🚨 IMÁGENES FALTANTES:', 'error');
    missingImages.forEach(img => log(`   - ${img}`, 'error'));
  } else {
    log('\n🎉 ¡Todas las imágenes están presentes y correctas!', 'success');
  }
  
  // Check for unused images
  const actualImages = fs.readdirSync(publicImagesPath)
    .filter(file => file.endsWith('.webp'))
    .map(file => `/images/${file}`);
  
  const unusedImages = actualImages.filter(img => !imagePaths.includes(img));
  
  if (unusedImages.length > 0) {
    log('\n⚠️  IMÁGENES NO UTILIZADAS:', 'warning');
    unusedImages.forEach(img => log(`   - ${img}`, 'warning'));
  }
  
  return {
    total: imagePaths.length,
    existing: existingImages.length,
    missing: missingImages.length,
    unused: unusedImages.length
  };
}

// Run verification
const result = verifyImages();

// Exit with error code if there are missing images
if (result.missing > 0) {
  process.exit(1);
}
