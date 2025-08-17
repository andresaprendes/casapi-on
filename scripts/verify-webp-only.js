#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function verifyWebPOnly() {
  console.log('🔍 Verifying that only WebP images exist...\n');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('❌ Images directory not found');
    return;
  }
  
  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return /\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(ext);
  });
  
  if (imageFiles.length === 0) {
    console.log('✅ No image files found');
    return;
  }
  
  let webpCount = 0;
  let otherFormatCount = 0;
  let totalSize = 0;
  
  for (const filename of imageFiles) {
    const filePath = path.join(IMAGES_DIR, filename);
    const ext = path.extname(filename).toLowerCase();
    const stats = fs.statSync(filePath);
    
    if (ext === '.webp') {
      webpCount++;
      console.log(`✅ ${filename} (WebP - ${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      otherFormatCount++;
      console.log(`❌ ${filename} (${ext.toUpperCase()} - ${(stats.size / 1024).toFixed(1)} KB)`);
    }
    
    totalSize += stats.size;
  }
  
  console.log('\n📊 Summary:');
  console.log(`   WebP images: ${webpCount}`);
  console.log(`   Other formats: ${otherFormatCount}`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  if (otherFormatCount === 0) {
    console.log('\n🎉 SUCCESS: All images are in WebP format!');
  } else {
    console.log('\n⚠️  WARNING: Some images are not in WebP format');
    console.log('   Run the conversion script again to fix this');
  }
}

verifyWebPOnly();
