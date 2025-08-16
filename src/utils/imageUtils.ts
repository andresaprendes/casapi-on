const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Constructs the full image URL for product images
 * @param imagePath - The image path from the database (e.g., "/images/products/filename.png")
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
  
  // Otherwise, prepend the API URL
  return `${API_URL}${imagePath}`
}

/**
 * Gets the API URL for the current environment
 */
export const getApiUrl = (): string => {
  return API_URL
}
