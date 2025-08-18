import fs from 'fs';
import path from 'path';

console.log('🔍 Testing image serving paths...');

// Check if public/images exists
const publicImagesPath = path.join(process.cwd(), 'public', 'images', 'products');
console.log('📁 Public images path:', publicImagesPath);
console.log('📁 Exists:', fs.existsSync(publicImagesPath));

if (fs.existsSync(publicImagesPath)) {
  const files = fs.readdirSync(publicImagesPath);
  console.log('📋 Files in public/images/products:');
  files.forEach(file => {
    const filePath = path.join(publicImagesPath, file);
    const stats = fs.statSync(filePath);
    console.log(`  - ${file} (${stats.size} bytes)`);
  });
}

// Check if server/public/images exists
const serverImagesPath = path.join(process.cwd(), 'server', 'public', 'images', 'products');
console.log('📁 Server images path:', serverImagesPath);
console.log('📁 Exists:', fs.existsSync(serverImagesPath));

// Check current working directory
console.log('📁 Current working directory:', process.cwd());

// List all directories in current directory
const currentDir = fs.readdirSync(process.cwd());
console.log('📋 Current directory contents:');
currentDir.forEach(item => {
  const itemPath = path.join(process.cwd(), item);
  const stats = fs.statSync(itemPath);
  if (stats.isDirectory()) {
    console.log(`  📁 ${item}/`);
  } else {
    console.log(`  📄 ${item}`);
  }
});
