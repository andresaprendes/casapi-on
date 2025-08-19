export interface SizeOption {
  id: string
  label: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  woodType: string // New field for wood type categorization
  images: string[]
  materials: string[]
  dimensions?: {
    length: number
    width: number
    height: number
  }
  weight?: number
  adminOnly?: boolean
  isCustom: boolean
  designVariations?: string
  estimatedDelivery: string
  features: string[]
  specifications: Record<string, string>
  sizeOptions?: SizeOption[]
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
  orderNumber: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'mercadopago' | 'epayco' | 'bank_transfer' | 'cash_delivery'
  paymentId?: string
  createdAt: Date
  updatedAt: Date
  estimatedDelivery: Date
  actualDelivery?: Date
  shippingZone: string
  trackingNumber?: string
  notes?: string
  adminNotes?: string
}

export interface OrderFilters {
  status?: Order['status']
  paymentStatus?: Order['paymentStatus']
  paymentMethod?: Order['paymentMethod']
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export interface OrderStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
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