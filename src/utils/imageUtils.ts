const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Constructs the full image URL for product images
 * @param imagePath - The image path from the database (e.g., "/images/filename.webp")
 * @returns The full URL to the image
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath
  }
  
  // If it's a relative path starting with /images/, it's a frontend public image
  if (imagePath.startsWith('/images/')) {
    return imagePath // Return as is for frontend public images
  }
  
  // If it's a product image from the backend (starts with /images/products/), prepend API URL
  if (imagePath.startsWith('/images/products/')) {
    return `${API_URL}${imagePath}`
  }
  
  // For any other relative paths, assume they're frontend public images
  return imagePath
}

/**
 * Gets the API URL for the current environment
 */
export const getApiUrl = (): string => {
  return API_URL
}
