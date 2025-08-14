#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const RAILWAY_API_URL = 'https://casa-pinon-backend-production.up.railway.app';
const LOCAL_API_URL = 'http://localhost:3001';

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Fetch products from API
async function fetchProducts(apiUrl) {
  try {
    logInfo(`Fetching products from ${apiUrl}...`);
    const response = await fetch(`${apiUrl}/api/products`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    
    logSuccess(`Found ${data.products.length} products`);
    return data.products;
  } catch (error) {
    logError(`Failed to fetch products: ${error.message}`);
    throw error;
  }
}

// Upload products to API
async function uploadProducts(apiUrl, products) {
  try {
    logInfo(`Uploading ${products.length} products to ${apiUrl}...`);
    
    // First, clear the database
    const clearResponse = await fetch(`${apiUrl}/api/products/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!clearResponse.ok) {
      throw new Error(`Failed to clear database: ${clearResponse.statusText}`);
    }
    
    logSuccess('Database cleared successfully');
    
    // Then upload each product
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        const response = await fetch(`${apiUrl}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(product)
        });
        
        if (response.ok) {
          successCount++;
          log(`  ✅ Uploaded: ${product.name}`, 'green');
        } else {
          errorCount++;
          log(`  ❌ Failed: ${product.name}`, 'red');
        }
      } catch (error) {
        errorCount++;
        log(`  ❌ Error: ${product.name} - ${error.message}`, 'red');
      }
    }
    
    logSuccess(`Upload completed: ${successCount} successful, ${errorCount} failed`);
    return { successCount, errorCount };
  } catch (error) {
    logError(`Failed to upload products: ${error.message}`);
    throw error;
  }
}

// Save products to local file
async function saveProductsToFile(products, filename) {
  try {
    const filePath = path.join(__dirname, filename);
    const data = JSON.stringify(products, null, 2);
    
    fs.writeFileSync(filePath, data, 'utf8');
    logSuccess(`Products saved to ${filePath}`);
    return filePath;
  } catch (error) {
    logError(`Failed to save products to file: ${error.message}`);
    throw error;
  }
}

// Load products from local file
async function loadProductsFromFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(data);
    
    logSuccess(`Loaded ${products.length} products from ${filePath}`);
    return products;
  } catch (error) {
    logError(`Failed to load products from file: ${error.message}`);
    throw error;
  }
}

// Main menu
async function showMenu() {
  log('\n' + '='.repeat(50), 'cyan');
  log('🔄 CASA PIÑÓN DATABASE SYNC TOOL', 'bright');
  log('='.repeat(50), 'cyan');
  
  log('\nChoose an option:', 'yellow');
  log('1. 📤 Upload Local Database → Railway');
  log('2. 📥 Download Railway Database → Local');
  log('3. 🔄 Sync Local Database to Railway (Reset)');
  log('4. 📋 Show Local Database');
  log('5. 📋 Show Railway Database');
  log('6. 💾 Save Railway Database to File');
  log('7. 📂 Load Database from File');
  log('8. ❌ Exit');
  
  const choice = await question('\nEnter your choice (1-8): ');
  
  switch (choice.trim()) {
    case '1':
      await uploadLocalToRailway();
      break;
    case '2':
      await downloadRailwayToLocal();
      break;
    case '3':
      await syncLocalToRailway();
      break;
    case '4':
      await showLocalDatabase();
      break;
    case '5':
      await showRailwayDatabase();
      break;
    case '6':
      await saveRailwayToFile();
      break;
    case '7':
      await loadFromFile();
      break;
    case '8':
      log('👋 Goodbye!', 'green');
      rl.close();
      return;
    default:
      logError('Invalid choice. Please try again.');
      await showMenu();
      return;
  }
  
  // Ask if user wants to continue
  const continueChoice = await question('\nDo you want to perform another action? (y/n): ');
  if (continueChoice.toLowerCase() === 'y' || continueChoice.toLowerCase() === 'yes') {
    await showMenu();
  } else {
    log('👋 Goodbye!', 'green');
    rl.close();
  }
}

// Option 1: Upload Local Database → Railway
async function uploadLocalToRailway() {
  try {
    log('\n📤 UPLOADING LOCAL DATABASE TO RAILWAY', 'bright');
    log('='.repeat(40), 'cyan');
    
    // Check if local server is running
    logInfo('Checking local server...');
    const localProducts = await fetchProducts(LOCAL_API_URL);
    
    // Confirm upload
    log(`\nFound ${localProducts.length} products in local database:`, 'yellow');
    localProducts.forEach((product, index) => {
      log(`  ${index + 1}. ${product.name} - $${product.price.toLocaleString()} COP`, 'cyan');
    });
    
    const confirm = await question('\nDo you want to upload these products to Railway? (y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      logWarning('Upload cancelled.');
      return;
    }
    
    // Upload to Railway
    await uploadProducts(RAILWAY_API_URL, localProducts);
    
    logSuccess('Local database successfully uploaded to Railway!');
  } catch (error) {
    logError(`Upload failed: ${error.message}`);
  }
}

// Option 2: Download Railway Database → Local
async function downloadRailwayToLocal() {
  try {
    log('\n📥 DOWNLOADING RAILWAY DATABASE TO LOCAL', 'bright');
    log('='.repeat(40), 'cyan');
    
    // Fetch Railway products
    const railwayProducts = await fetchProducts(RAILWAY_API_URL);
    
    // Confirm download
    log(`\nFound ${railwayProducts.length} products in Railway database:`, 'yellow');
    railwayProducts.forEach((product, index) => {
      log(`  ${index + 1}. ${product.name} - $${product.price.toLocaleString()} COP`, 'cyan');
    });
    
    const confirm = await question('\nDo you want to download these products to local? (y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      logWarning('Download cancelled.');
      return;
    }
    
    // Check if local server is running
    logInfo('Checking local server...');
    try {
      await fetchProducts(LOCAL_API_URL);
    } catch (error) {
      logError('Local server is not running. Please start it first with: npm run dev');
      return;
    }
    
    // Upload to local
    await uploadProducts(LOCAL_API_URL, railwayProducts);
    
    logSuccess('Railway database successfully downloaded to local!');
  } catch (error) {
    logError(`Download failed: ${error.message}`);
  }
}

// Option 3: Sync Local Database to Railway (Reset)
async function syncLocalToRailway() {
  try {
    log('\n🔄 SYNCING LOCAL DATABASE TO RAILWAY (RESET)', 'bright');
    log('='.repeat(40), 'cyan');
    
    logWarning('This will reset Railway database to match local default products.');
    const confirm = await question('Are you sure? (y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      logWarning('Sync cancelled.');
      return;
    }
    
    // Call Railway sync endpoint
    logInfo('Calling Railway sync endpoint...');
    const response = await fetch(`${RAILWAY_API_URL}/api/products/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      logSuccess(`Railway database synced successfully! ${result.productsCount} products loaded.`);
    } else {
      throw new Error(result.error || 'Sync failed');
    }
  } catch (error) {
    logError(`Sync failed: ${error.message}`);
  }
}

// Option 4: Show Local Database
async function showLocalDatabase() {
  try {
    log('\n📋 LOCAL DATABASE CONTENTS', 'bright');
    log('='.repeat(30), 'cyan');
    
    const products = await fetchProducts(LOCAL_API_URL);
    
    if (products.length === 0) {
      logWarning('No products found in local database.');
      return;
    }
    
    products.forEach((product, index) => {
      log(`\n${index + 1}. ${product.name}`, 'bright');
      log(`   Price: $${product.price.toLocaleString()} COP`, 'cyan');
      log(`   Category: ${product.category}`, 'cyan');
      log(`   Images: ${product.images.length}`, 'cyan');
      log(`   ID: ${product.id}`, 'cyan');
    });
  } catch (error) {
    logError(`Failed to show local database: ${error.message}`);
  }
}

// Option 5: Show Railway Database
async function showRailwayDatabase() {
  try {
    log('\n📋 RAILWAY DATABASE CONTENTS', 'bright');
    log('='.repeat(30), 'cyan');
    
    const products = await fetchProducts(RAILWAY_API_URL);
    
    if (products.length === 0) {
      logWarning('No products found in Railway database.');
      return;
    }
    
    products.forEach((product, index) => {
      log(`\n${index + 1}. ${product.name}`, 'bright');
      log(`   Price: $${product.price.toLocaleString()} COP`, 'cyan');
      log(`   Category: ${product.category}`, 'cyan');
      log(`   Images: ${product.images.length}`, 'cyan');
      log(`   ID: ${product.id}`, 'cyan');
    });
  } catch (error) {
    logError(`Failed to show Railway database: ${error.message}`);
  }
}

// Option 6: Save Railway Database to File
async function saveRailwayToFile() {
  try {
    log('\n💾 SAVING RAILWAY DATABASE TO FILE', 'bright');
    log('='.repeat(30), 'cyan');
    
    const products = await fetchProducts(RAILWAY_API_URL);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `railway-database-${timestamp}.json`;
    
    await saveProductsToFile(products, filename);
    
    logSuccess(`Railway database saved to: ${filename}`);
  } catch (error) {
    logError(`Failed to save Railway database: ${error.message}`);
  }
}

// Option 7: Load Database from File
async function loadFromFile() {
  try {
    log('\n📂 LOADING DATABASE FROM FILE', 'bright');
    log('='.repeat(30), 'cyan');
    
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.json'))
      .filter(file => file.includes('database'));
    
    if (files.length === 0) {
      logWarning('No database files found in scripts directory.');
      return;
    }
    
    log('Available database files:', 'yellow');
    files.forEach((file, index) => {
      log(`  ${index + 1}. ${file}`, 'cyan');
    });
    
    const choice = await question('\nEnter file number to load: ');
    const fileIndex = parseInt(choice) - 1;
    
    if (fileIndex < 0 || fileIndex >= files.length) {
      logError('Invalid file number.');
      return;
    }
    
    const filename = files[fileIndex];
    const products = await loadProductsFromFile(filename);
    
    log(`\nLoaded ${products.length} products from ${filename}:`, 'yellow');
    products.forEach((product, index) => {
      log(`  ${index + 1}. ${product.name} - $${product.price.toLocaleString()} COP`, 'cyan');
    });
    
    const target = await question('\nWhere do you want to load this database? (local/railway): ');
    
    if (target.toLowerCase() === 'local') {
      await uploadProducts(LOCAL_API_URL, products);
      logSuccess('Database loaded to local successfully!');
    } else if (target.toLowerCase() === 'railway') {
      await uploadProducts(RAILWAY_API_URL, products);
      logSuccess('Database loaded to Railway successfully!');
    } else {
      logError('Invalid target. Use "local" or "railway".');
    }
  } catch (error) {
    logError(`Failed to load database from file: ${error.message}`);
  }
}

// Start the script
async function main() {
  try {
    log('🚀 Starting Casa Piñón Database Sync Tool...', 'green');
    await showMenu();
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  log('\n👋 Script interrupted. Goodbye!', 'yellow');
  rl.close();
  process.exit(0);
});

// Run the script
main();
