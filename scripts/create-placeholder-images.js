import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product images to create
const productImages = [
  'mesa-comedor-pinon-1.jpg',
  'mesa-comedor-pinon-2.jpg',
  'puerta-pinon-1.jpg',
  'puerta-pinon-2.jpg',
  'cama-pinon-1.jpg',
  'cama-pinon-2.jpg',
  'estanteria-pinon-1.jpg',
  'estanteria-pinon-2.jpg',
  'mesa-centro-pinon-1.jpg',
  'mesa-centro-pinon-2.jpg',
  'escritorio-pinon-1.jpg',
  'escritorio-pinon-2.jpg'
];

// Create a simple placeholder image using Canvas
function createPlaceholderImage(width, height, text, filename) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#fdf8f6'); // cream-50
  gradient.addColorStop(1, '#f5f5dc'); // cream-100
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#d4a574'; // brown-300
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Logo placeholder
  ctx.fillStyle = '#8b4513'; // brown-800
  ctx.fillRect(width/2 - 30, height/2 - 40, 60, 60);
  
  // CP text
  ctx.fillStyle = '#fdf8f6'; // cream-50
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CP', width/2, height/2);

  // Product text
  ctx.fillStyle = '#8b4513'; // brown-800
  ctx.font = '16px Arial';
  ctx.fillText(text, width/2, height/2 + 30);

  // Convert to blob and save
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const arrayBuffer = blob.arrayBuffer();
      resolve(arrayBuffer);
    }, 'image/jpeg', 0.8);
  });
}

async function createPlaceholderImages() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  
  // Ensure images directory exists
  try {
    await fs.mkdir(imagesDir, { recursive: true });
  } catch (error) {
    console.log('Images directory already exists');
  }

  console.log('Creating placeholder images...');
  
  for (const imageName of productImages) {
    const productName = imageName.replace(/-\d+\.jpg$/, '').replace(/-/g, ' ');
    const imagePath = path.join(imagesDir, imageName);
    
    try {
      // Create a simple placeholder
      const placeholderData = await createPlaceholderImage(800, 800, productName, imageName);
      await fs.writeFile(imagePath, Buffer.from(placeholderData));
      console.log(`✅ Created: ${imageName}`);
    } catch (error) {
      console.error(`❌ Error creating ${imageName}:`, error);
    }
  }
  
  console.log('Placeholder images created successfully!');
}

// Run the script
createPlaceholderImages().catch(console.error);
