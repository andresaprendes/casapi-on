export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  images: string[]
  materials: string[]
  dimensions?: {
    length: number
    width: number
    height: number
  }
  weight?: number
  inStock: boolean
  isCustom: boolean
  estimatedDelivery: string
  features: string[]
  specifications: Record<string, string>
}

export interface CartItem {
  product: Product
  quantity: number
  customizations?: Record<string, string>
}

export interface Category {
  id: string
  name: string
  description: string
  image: string
  slug: string
  subcategories?: string[]
}

export interface Customer {
  id?: string
  name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface Order {
  id: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered'
  paymentStatus: 'pending' | 'paid' | 'failed'
  createdAt: Date
  estimatedDelivery: Date
  notes?: string
}

export interface ShippingZone {
  name: string
  cities: string[]
  basePrice: number
  freeShippingThreshold: number
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  date: Date
  productCategory?: string
} 