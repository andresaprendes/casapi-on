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

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(1); // KB
}

function generateImageReport() {
  log('📊 REPORTE COMPLETO DE IMÁGENES - Casa Piñón', 'info');
  log('=' .repeat(60), 'info');
  
  const publicImagesPath = path.join(__dirname, '..', 'public', 'images');
  const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
  
  // Read mockData.ts
  const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
  
  // Extract all image paths
  const imageRegex = /\/images\/[^'"]+\.webp/g;
  const imagePaths = mockDataContent.match(imageRegex) || [];
  
  log(`\n📁 ANÁLISIS DE IMÁGENES:`, 'info');
  log(`   • Total de referencias en mockData.ts: ${imagePaths.length}`, 'info');
  
  // Check each image
  let existingImages = [];
  let missingImages = [];
  let totalSize = 0;
  
  imagePaths.forEach(imagePath => {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      const size = getFileSize(fullPath);
      totalSize += parseFloat(size);
      existingImages.push({ path: imagePath, size });
      log(`   ✅ ${imagePath} (${size} KB)`, 'success');
    } else {
      missingImages.push(imagePath);
      log(`   ❌ ${imagePath} - NO ENCONTRADO`, 'error');
    }
  });
  
  // Check for unused images
  const actualImages = fs.readdirSync(publicImagesPath)
    .filter(file => file.endsWith('.webp'))
    .map(file => `/images/${file}`);
  
  const unusedImages = actualImages.filter(img => !imagePaths.includes(img));
  
  // Summary
  log(`\n📊 RESUMEN:`, 'info');
  log(`   ✅ Imágenes existentes: ${existingImages.length}`, 'success');
  log(`   ❌ Imágenes faltantes: ${missingImages.length}`, missingImages.length > 0 ? 'error' : 'success');
  log(`   ⚠️  Imágenes no utilizadas: ${unusedImages.length}`, unusedImages.length > 0 ? 'warning' : 'success');
  log(`   📦 Tamaño total: ${totalSize.toFixed(1)} KB`, 'info');
  log(`   🎯 Promedio por imagen: ${(totalSize / existingImages.length).toFixed(1)} KB`, 'info');
  
  // Product images analysis
  const productImages = imagePaths.filter(path => 
    mockDataContent.includes(`images: ['${path}']`)
  );
  
  // Category images analysis
  const categoryImages = imagePaths.filter(path => 
    mockDataContent.includes(`image: '${path}'`) && 
    mockDataContent.includes('categories')
  );
  
  // Wood type images analysis
  const woodTypeImages = imagePaths.filter(path => 
    mockDataContent.includes(`image: '${path}'`) && 
    mockDataContent.includes('woodTypes')
  );
  
  log(`\n🏷️  CLASIFICACIÓN POR USO:`, 'info');
  log(`   🛍️  Imágenes de productos: ${productImages.length}`, 'info');
  log(`   📂 Imágenes de categorías: ${categoryImages.length}`, 'info');
  log(`   🌳 Imágenes de tipos de madera: ${woodTypeImages.length}`, 'info');
  
  // Performance analysis
  const avgSize = totalSize / existingImages.length;
  let performanceRating = '🟢 Excelente';
  if (avgSize > 100) performanceRating = '🟡 Buena';
  if (avgSize > 200) performanceRating = '🟠 Aceptable';
  if (avgSize > 500) performanceRating = '🔴 Necesita optimización';
  
  log(`\n⚡ ANÁLISIS DE RENDIMIENTO:`, 'info');
  log(`   ${performanceRating} - Promedio: ${avgSize.toFixed(1)} KB por imagen`, 'info');
  log(`   🎯 Formato: WebP (optimizado para web)`, 'success');
  log(`   🌐 Compatibilidad: Navegadores modernos`, 'success');
  
  // Recommendations
  log(`\n💡 RECOMENDACIONES:`, 'info');
  if (missingImages.length > 0) {
    log(`   ❌ Corregir imágenes faltantes`, 'error');
  }
  if (unusedImages.length > 0) {
    log(`   🧹 Considerar limpiar imágenes no utilizadas`, 'warning');
  }
  if (avgSize > 100) {
    log(`   📉 Considerar optimizar imágenes grandes`, 'warning');
  }
  
  if (missingImages.length === 0 && unusedImages.length === 0 && avgSize <= 100) {
    log(`   ✅ Estado óptimo - No se requieren acciones`, 'success');
  }
  
  log(`\n🎉 ESTADO GENERAL: ${missingImages.length === 0 ? '✅ PERFECTO' : '❌ REQUIERE ATENCIÓN'}`, 
      missingImages.length === 0 ? 'success' : 'error');
}

// Run report
generateImageReport();
