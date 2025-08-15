#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'base64Images.js');

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

async function convertImagesToBase64() {
  try {
    logInfo('Starting image conversion to base64...');
    
    // Check if images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
      logError(`Images directory not found: ${IMAGES_DIR}`);
      return;
    }
    
    // Get all image files
    const files = fs.readdirSync(IMAGES_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      logInfo('No image files found to convert');
      return;
    }
    
    logInfo(`Found ${imageFiles.length} image files to convert`);
    
    const base64Images = {};
    
    for (const filename of imageFiles) {
      try {
        const filePath = path.join(IMAGES_DIR, filename);
        const imageBuffer = fs.readFileSync(filePath);
        const base64Data = imageBuffer.toString('base64');
        
        // Determine MIME type based on file extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'image/jpeg'; // default
        
        switch (ext) {
          case '.png':
            mimeType = 'image/png';
            break;
          case '.gif':
            mimeType = 'image/gif';
            break;
          case '.webp':
            mimeType = 'image/webp';
            break;
          case '.jpg':
          case '.jpeg':
            mimeType = 'image/jpeg';
            break;
        }
        
        // Create data URL
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        
        // Store with original filename as key
        base64Images[filename] = dataUrl;
        
        logSuccess(`Converted: ${filename}`);
      } catch (error) {
        logError(`Failed to convert ${filename}: ${error.message}`);
      }
    }
    
    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate the JavaScript file
    const jsContent = `// Auto-generated base64 images
// Generated on: ${new Date().toISOString()}
// Total images: ${Object.keys(base64Images).length}

export const base64Images = ${JSON.stringify(base64Images, null, 2)};

export default base64Images;
`;
    
    fs.writeFileSync(OUTPUT_FILE, jsContent);
    
    logSuccess(`Base64 images saved to: ${OUTPUT_FILE}`);
    logInfo(`Total images converted: ${Object.keys(base64Images).length}`);
    
    // Also create a mapping file for easy reference
    const mappingFile = path.join(__dirname, '..', 'src', 'data', 'imageMapping.js');
    const mappingContent = `// Image filename to base64 mapping
// Generated on: ${new Date().toISOString()}

export const imageMapping = {
${Object.keys(base64Images).map(filename => `  '${filename}': '${filename}'`).join(',\n')}
};

export default imageMapping;
`;
    
    fs.writeFileSync(mappingFile, mappingContent);
    logSuccess(`Image mapping saved to: ${mappingFile}`);
    
  } catch (error) {
    logError(`Conversion failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the conversion
convertImagesToBase64();
