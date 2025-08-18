import { useState, useEffect } from 'react'
import { Product } from '../types'
import { products as mockProducts } from '../data/mockData'

const API_URL = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load products from database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/products`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      } else {
        throw new Error(data.error || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      console.log('🔄 Falling back to mock data...')
      
      // Fallback to mock data when API is not available
      setProducts(mockProducts)
      setError('Backend API not available - using mock data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Add a new product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => [...prev, data.product])
        return data.product
      } else {
        throw new Error(data.error || 'Failed to create product')
      }
    } catch (err) {
      console.error('Error creating product:', err)
      throw err
    }
  }

  // Update an existing product
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => prev.map(product => 
          product.id === productId ? data.product : product
        ))
        return data.product
      } else {
        throw new Error(data.error || 'Failed to update product')
      }
    } catch (err) {
      console.error('Error updating product:', err)
      throw err
    }
  }

  // Delete a product
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProducts(prev => prev.filter(product => product.id !== productId))
      } else {
        throw new Error(data.error || 'Failed to delete product')
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }

  // Refresh products
  const refreshProducts = () => {
    fetchProducts()
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts
  }
}
