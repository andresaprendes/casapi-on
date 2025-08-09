// Stock images that closely match Casa Piñón products
// These are professional furniture photos with white backgrounds

const stockImageSources = {
  'mesa-comedor-roble': [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Oak dining table
    'https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Oak table side view
  ],
  'sofa-cedro': [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Modern sofa
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Sofa angle view
  ],
  'cama-king-pino': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Pine bed
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Bed side view
  ],
  'puerta-teca': [
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Wooden door
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Door detail
  ],
  'ventana-cedro': [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Wooden window
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Window detail
  ],
  'estanteria-roble': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Oak bookshelf
    'https://images.unsplash.com/photo-1543512214-318c7553f230?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'  // Bookshelf side
  ]
};

console.log('📸 Stock Images Ready for Casa Piñón Products');
console.log('='.repeat(50));
console.log();

Object.entries(stockImageSources).forEach(([product, urls]) => {
  console.log(`🪑 ${product}:`);
  urls.forEach((url, index) => {
    console.log(`  Image ${index + 1}: ${url}`);
  });
  console.log();
});

console.log('💡 To implement:');
console.log('1. Download these images');
console.log('2. Save with exact names: product-name-1.jpg, product-name-2.jpg');
console.log('3. Place in /public/images/ directory');

export { stockImageSources };
