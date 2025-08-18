// Product image mappings - replaces base64 data in mercadopago-api.js
const productImages = {
  '1': '/images/products/product-1.webp',  // Mesa de Comedor
  '2': '/images/products/product-2.webp',  // Puerta Principal
  '3': '/images/products/product-3.webp',  // Silla de Comedor
  '4': '/images/products/product-4.webp',  // Estante de Piñón
  '5': '/images/products/product-5.webp',  // Mesa de Centro
  '6': '/images/products/product-6.webp',  // Cabeceira de Cama
  '7': '/images/products/product-7.webp',  // Escritorio
  '8': '/images/products/product-8.webp',  // Banco de Jardín
  '9': '/images/products/product-9.webp',  // Perchero
  '10': '/images/products/product-10.webp' // Taburete
};

// Helper function to get image URL
const getProductImage = (productId) => {
  return productImages[productId] || '/images/products/default-product.webp';
};

// Helper function to get all product images
const getAllProductImages = () => {
  return productImages;
};

// Helper function to add new uploaded product image
const addProductImage = (productId, imagePath) => {
  productImages[productId] = imagePath;
  return productImages[productId];
};

// Helper function to remove product image
const removeProductImage = (productId) => {
  if (productImages[productId]) {
    delete productImages[productId];
    return true;
  }
  return false;
};

// Helper function to get image count
const getImageCount = () => {
  return Object.keys(productImages).length;
};

export {
  productImages,
  getProductImage,
  getAllProductImages,
  addProductImage,
  removeProductImage,
  getImageCount
};
