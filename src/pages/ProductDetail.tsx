import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  Package, 
  Truck, 
  Shield, 
  Clock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../store/CartContext'
import { SizeOption } from '../types'
import { toast } from 'react-hot-toast'
import { woodTypes } from '../data/mockData'
import { getImageUrl } from '../utils/imageUtils'

const ProductDetail = () => {
  const { id } = useParams()
  const { products, loading, error } = useProducts()
  const { addItem } = useCart()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)

  const product = products.find(p => p.id === id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    if (product) {
      let productToAdd = product
      if (product.sizeOptions && product.sizeOptions.length > 0) {
        const size: SizeOption | undefined = product.sizeOptions.find(s => s.id === (selectedSizeId || product.sizeOptions![0].id))
        if (size) {
          productToAdd = {
            ...product,
            id: `${product.id}__${size.id}`,
            name: `${product.name} (${size.label || `${size.dimensions.length}x${size.dimensions.width}x${size.dimensions.height}cm`})`,
            price: size.price,
            dimensions: size.dimensions
          }
        }
      }
      addItem(productToAdd, quantity)
      toast.success(`${product.name} agregado al carrito`)
    }
  }

  const handleBuyNow = () => {
    if (product) {
      let productToAdd = product
      if (product.sizeOptions && product.sizeOptions.length > 0) {
        const size: SizeOption | undefined = product.sizeOptions.find(s => s.id === (selectedSizeId || product.sizeOptions![0].id))
        if (size) {
          productToAdd = {
            ...product,
            id: `${product.id}__${size.id}`,
            name: `${product.name} (${size.label || `${size.dimensions.length}x${size.dimensions.width}x${size.dimensions.height}cm`})`,
            price: size.price,
            dimensions: size.dimensions
          }
        }
      }
      addItem(productToAdd, quantity)
      // Redirect to checkout
      window.location.href = '/checkout'
    }
  }

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brown-900 mb-4">Producto no encontrado</h1>
            <p className="text-brown-600 mb-6">El producto que buscas no existe o ha sido removido.</p>
            <Link 
              to="/productos" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Productos</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Casa Piñón Ebanistería</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="section-padding">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-brown-600">
              <li>
                <Link to="/" className="hover:text-brown-800 transition-colors duration-200">
                  Inicio
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/productos" className="hover:text-brown-800 transition-colors duration-200">
                  Productos
                </Link>
              </li>
              <li>/</li>
              <li className="text-brown-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-cream-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(product.images[selectedImageIndex])}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-brown-800 hover:bg-opacity-100 transition-all duration-200"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-brown-800 hover:bg-opacity-100 transition-all duration-200"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cream-50 to-brown-50 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Package className="w-16 h-16 text-brown-400 mx-auto mb-4" />
                      <p className="text-brown-600">Sin imagen</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedImageIndex 
                          ? 'border-brown-600' 
                          : 'border-gray-200 hover:border-brown-400'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Title and Rating */}
              <div>
                <h1 className="text-3xl font-serif font-bold text-brown-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <Star className="w-5 h-5 fill-current text-yellow-400" />
                    <span className="text-sm text-brown-600 ml-2">4.9 (24 reseñas)</span>
                  </div>
                  {product.isCustom && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Personalizable
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-brown-900">
                {formatPrice(
                  product.sizeOptions && product.sizeOptions.length > 0
                    ? (product.sizeOptions.find(s => s.id === (selectedSizeId || product.sizeOptions![0].id))?.price || product.price)
                    : product.price
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Descripción</h3>
                <p className="text-brown-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Materials */}
              <div>
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Materiales</h3>
                <div className="flex flex-wrap gap-2">
                  {product.woodType && (
                    <span className="px-3 py-1 bg-cream-200 text-brown-700 rounded-full text-sm">
                      {woodTypes.find(type => type.id === product.woodType)?.name || product.woodType}
                    </span>
                  )}
                  {product.materials.map((material, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cream-200 text-brown-700 rounded-full text-sm"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {/* Wood Type */}
              {product.woodType && (
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">Tipo de Madera</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      {woodTypes.find(type => type.id === product.woodType)?.name || product.woodType}
                    </span>
                    <div className="text-sm text-brown-600">
                      {woodTypes.find(type => type.id === product.woodType)?.description}
                    </div>
                  </div>
                  {woodTypes.find(type => type.id === product.woodType)?.characteristics && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-brown-700 mb-2">Características de la madera:</h4>
                      <div className="flex flex-wrap gap-2">
                        {woodTypes.find(type => type.id === product.woodType)?.characteristics.map((char, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Size Selection */}
              {product.sizeOptions && product.sizeOptions.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">Tamaño</h3>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    value={selectedSizeId || product.sizeOptions[0].id}
                    onChange={(e) => setSelectedSizeId(e.target.value)}
                  >
                    {product.sizeOptions.map((s, i) => (
                      <option key={s.id} value={s.id}>
                        {(s.label && s.label.trim()) || `Opción ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                product.dimensions && (
                  <div>
                    <h3 className="text-lg font-semibold text-brown-900 mb-2">Dimensiones</h3>
                    <p className="text-brown-600">
                      Largo: {product.dimensions.length}cm × Ancho: {product.dimensions.width}cm × Alto: {product.dimensions.height}cm
                    </p>
                  </div>
                )
              )}

              {/* Dimensions (separate block) */}
              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">Dimensiones</h3>
                  {(() => {
                    const size = product.sizeOptions!.find(s => s.id === (selectedSizeId || product.sizeOptions![0].id))!
                    return (
                      <p className="text-brown-600">
                        Largo: {size.dimensions.length}cm × Ancho: {size.dimensions.width}cm × Alto: {size.dimensions.height}cm
                      </p>
                    )
                  })()}
                </div>
              )}

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">Características</h3>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-brown-600">
                        <div className="w-2 h-2 bg-brown-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-brown-900 mb-2">Especificaciones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-brown-600">{key}:</span>
                        <span className="text-brown-900 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Section */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-brown-900 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  
                  className="w-full bg-brown-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-brown-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    Agregar al Carrito
                  </span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  
                  className="w-full bg-brown-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-brown-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Comprar Ahora</span>
                </button>
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-cream-50 rounded-lg">
                  <Truck className="w-6 h-6 text-brown-600" />
                  <div>
                    <p className="font-medium text-brown-900">Entrega</p>
                    <p className="text-sm text-brown-600">{product.estimatedDelivery}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-cream-50 rounded-lg">
                  <Shield className="w-6 h-6 text-brown-600" />
                  <div>
                    <p className="font-medium text-brown-900">Garantía</p>
                    <p className="text-sm text-brown-600">3 años</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-cream-50 rounded-lg">
                  <Clock className="w-6 h-6 text-brown-600" />
                  <div>
                    <p className="font-medium text-brown-900">Fabricación</p>
                    <p className="text-sm text-brown-600">Hecho a mano</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-cream-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-brown-600" />
                  <div>
                    <p className="font-medium text-brown-900">Origen</p>
                    <p className="text-sm text-brown-600">Medellín, Colombia</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail 