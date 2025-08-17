#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
const WEBP_QUALITY = 85; // High quality WebP (0-100)

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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    try {
      execSync('convert --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Convert image to WebP using ImageMagick
function convertToWebP(inputPath, outputPath, quality = WEBP_QUALITY) {
  try {
    const command = `magick "${inputPath}" -quality ${quality} "${outputPath}"`;
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch (error) {
    try {
      // Fallback to legacy convert command
      const command = `convert "${inputPath}" -quality ${quality} "${outputPath}"`;
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Get file size in human readable format
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Convert all images to WebP format
async function convertAllImagesToWebP() {
  try {
    logInfo('🔄 Starting WebP conversion process...');
    
    // Check if images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      logError(`Images directory not found: ${IMAGES_DIR}`);
      return;
    }
    
    // Check if ImageMagick is available
    if (!checkImageMagick()) {
      logError('ImageMagick is not installed. Please install it first:');
      logError('  macOS: brew install imagemagick');
      logError('  Ubuntu/Debian: sudo apt-get install imagemagick');
      logError('  Windows: Download from https://imagemagick.org/');
      return;
    }
    
    logSuccess('ImageMagick found and ready to use');
    
    // Get all image files
    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_FORMATS.includes(ext) || ext === '.webp';
    });
    
    if (imageFiles.length === 0) {
      logInfo('No image files found to convert');
      return;
    }
    
    logInfo(`Found ${imageFiles.length} image files to process`);
    
    let convertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let totalSizeReduction = 0;
    
    for (const filename of imageFiles) {
      const filePath = path.join(IMAGES_DIR, filename);
      const ext = path.extname(filename).toLowerCase();
      
      try {
        // Skip if already WebP
        if (ext === '.webp') {
          logInfo(`Skipping (already WebP): ${filename}`);
          skippedCount++;
          continue;
        }
        
        // Get original file size
        const originalStats = fs.statSync(filePath);
        const originalSize = originalStats.size;
        
        // Create WebP filename
        const nameWithoutExt = path.basename(filename, ext);
        const webpFilename = `${nameWithoutExt}.webp`;
        const webpPath = path.join(IMAGES_DIR, webpFilename);
        
        logInfo(`Converting: ${filename} → ${webpFilename}`);
        
        // Convert to WebP
        if (convertToWebP(filePath, webpPath, WEBP_QUALITY)) {
          // Get WebP file size
          const webpStats = fs.statSync(webpPath);
          const webpSize = webpStats.size;
          
          // Calculate size reduction
          const sizeReduction = originalSize - webpSize;
          const reductionPercent = ((sizeReduction / originalSize) * 100).toFixed(1);
          
          totalSizeReduction += sizeReduction;
          
          logSuccess(`Converted: ${filename} (${formatFileSize(originalSize)} → ${formatFileSize(webpSize)}, ${reductionPercent}% smaller)`);
          
          // Remove original file
          fs.unlinkSync(filePath);
          logSuccess(`Removed original: ${filename}`);
          
          convertedCount++;
        } else {
          logError(`Failed to convert: ${filename}`);
          errorCount++;
        }
        
      } catch (error) {
        logError(`Error processing ${filename}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    logSuccess('🎉 WebP Conversion Complete!');
    console.log('='.repeat(60));
    
    logInfo(`📊 Conversion Summary:`);
    logInfo(`   Converted: ${convertedCount} images`);
    logInfo(`   Skipped: ${skippedCount} images (already WebP)`);
    logInfo(`   Errors: ${errorCount} images`);
    logInfo(`   Total size reduction: ${formatFileSize(totalSizeReduction)}`);
    
    if (convertedCount > 0) {
      logSuccess(`\n🚀 All images are now in WebP format!`);
      logInfo(`   Quality: ${WEBP_QUALITY}/100`);
      logInfo(`   Format: WebP only`);
      logInfo(`   Performance: Significantly improved`);
    }
    
    // Update mock data to use WebP images
    await updateMockDataToWebP();
    
  } catch (error) {
    logError(`Conversion process failed: ${error.message}`);
    process.exit(1);
  }
}

// Update mock data to use WebP images
async function updateMockDataToWebP() {
  try {
    logInfo('\n📝 Updating mock data to use WebP images...');
    
    const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
    
    if (!fs.existsSync(mockDataPath)) {
      logWarning('Mock data file not found, skipping update');
      return;
    }
    
    // Read current mock data
    let mockData = fs.readFileSync(mockDataPath, 'utf8');
    
    // Get all WebP images
    const files = fs.readdirSync(IMAGES_DIR);
    const webpFiles = files.filter(file => path.extname(file).toLowerCase() === '.webp');
    
    if (webpFiles.length === 0) {
      logWarning('No WebP images found, skipping mock data update');
      return;
    }
    
    // Create a mapping of old image names to new WebP names
    const imageMapping = {
      'image-1755135305383-454296344.png': 'image-1755135305383-454296344.webp',
      'image-1755137369333-477927924.png': 'image-1755137369333-477927924.webp',
      'image-1755137545858-681902723.png': 'image-1755137545858-681902723.webp',
      'image-1755137657743-535686656.png': 'image-1755137657743-535686656.webp',
      'image-1755138001829-743849468.png': 'image-1755138001829-743849468.webp',
      'image-1755136170928-605023865.webp': 'image-1755136170928-605023865.webp',
      'image-1755136180161-48892126.webp': 'image-1755136180161-48892126.webp',
      'image-1755136374138-27692147.webp': 'image-1755136374138-27692147.webp'
    };
    
    // Replace all image references
    let updatedCount = 0;
    for (const [oldName, newName] of Object.entries(imageMapping)) {
      if (mockData.includes(oldName)) {
        mockData = mockData.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newName);
        updatedCount++;
      }
    }
    
    // Write updated mock data
    fs.writeFileSync(mockDataPath, mockData);
    
    logSuccess(`Updated mock data: ${updatedCount} image references changed to WebP`);
    
  } catch (error) {
    logError(`Failed to update mock data: ${error.message}`);
  }
}

// Create a verification script
async function createVerificationScript() {
  try {
    const verifyScriptPath = path.join(__dirname, 'verify-webp-only.js');
    
    const verifyScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function verifyWebPOnly() {
  console.log('🔍 Verifying that only WebP images exist...\\n');
  
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
    const ext = path.extname(file).toLowerCase();
    const stats = fs.statSync(filePath);
    
    if (ext === '.webp') {
      webpCount++;
      console.log(\`✅ \${filename} (WebP - \${(stats.size / 1024).toFixed(1)} KB)\`);
    } else {
      otherFormatCount++;
      console.log(\`❌ \${filename} (\${ext.toUpperCase()} - \${(stats.size / 1024).toFixed(1)} KB)\`);
    }
    
    totalSize += stats.size;
  }
  
  console.log('\\n📊 Summary:');
  console.log(\`   WebP images: \${webpCount}\`);
  console.log(\`   Other formats: \${otherFormatCount}\`);
  console.log(\`   Total size: \${(totalSize / 1024 / 1024).toFixed(2)} MB\`);
  
  if (otherFormatCount === 0) {
    console.log('\\n🎉 SUCCESS: All images are in WebP format!');
  } else {
    console.log('\\n⚠️  WARNING: Some images are not in WebP format');
    console.log('   Run the conversion script again to fix this');
  }
}

verifyWebPOnly();
`;
    
    fs.writeFileSync(verifyScriptPath, verifyScript);
    logSuccess('Created verification script: verify-webp-only.js');
    
  } catch (error) {
    logError(`Failed to create verification script: ${error.message}`);
  }
}

// Main execution
async function main() {
  console.log('🔄 Casa Piñón - Complete Image to WebP Converter');
  console.log('=' .repeat(60));
  console.log();
  
  await convertAllImagesToWebP();
  await createVerificationScript();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 Next Steps:');
  console.log('1. Run: node scripts/verify-webp-only.js (to verify conversion)');
  console.log('2. Test your website (images should load faster)');
  console.log('3. Check that all products display correctly');
  console.log('4. Commit the changes to your repository');
  console.log('='.repeat(60));
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { convertAllImagesToWebP, updateMockDataToWebP };
