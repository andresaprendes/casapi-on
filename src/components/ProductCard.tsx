import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { Product } from '../types'
import { useCart } from '../store/CartContext'
import { toast } from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    addItem(product, 1)
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card group overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-cream-100 rounded-lg overflow-hidden mb-4">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-cream-50 to-brown-50 flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-brown-600 to-brown-800 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-cream-50 font-serif font-bold text-2xl">CP</span>
            </div>
            <h4 className="text-brown-800 font-medium text-sm mb-2">{product.name}</h4>
            <p className="text-brown-600 text-xs">Foto profesional próximamente</p>
            <div className="mt-3 text-brown-500 text-xs">
              {product.materials[0]} • {product.category}
            </div>
          </div>
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              to={`/producto/${product.id}`}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brown-800 hover:bg-brown-800 hover:text-white transition-colors duration-200"
            >
              <Eye className="w-5 h-5" />
            </Link>
            <button
              onClick={handleAddToCart}
              className="w-10 h-10 bg-brown-800 rounded-full flex items-center justify-center text-white hover:bg-brown-900 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {product.madeToOrder && (
            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full block">
              Por Pedido
            </span>
          )}
          {product.isCustom && (
            <span className="bg-brown-800 text-cream-50 text-xs px-2 py-1 rounded-full block">
              Personalizado
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-lg text-brown-900 mb-1 product-name-truncate">
            {product.name}
          </h3>
          <p className="text-sm text-brown-800 font-body product-description-truncate font-normal">
            {product.description}
          </p>
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-1">
          {product.materials.slice(0, 2).map((material, index) => (
            <span
              key={index}
              className="text-xs bg-cream-100 text-brown-700 px-2 py-1 rounded-full"
            >
              {material}
            </span>
          ))}
          {product.materials.length > 2 && (
            <span className="text-xs text-brown-500">
              +{product.materials.length - 2} más
            </span>
          )}
        </div>

        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-brown-900">
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            <span className="text-sm font-medium text-brown-700">4.9</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="text-sm font-medium text-brown-700">
          <span className="font-semibold">Entrega:</span> {product.estimatedDelivery}
        </div>



        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Link
            to={`/producto/${product.id}`}
            className="flex-1 btn-secondary text-center py-2"
          >
            Ver Detalles
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-primary py-2"
          >
            Agregar
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard 