import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../store/CartContext'

const CartSidebar = () => {
  const { state, removeItem, updateQuantity, closeCart, getTotalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeCart}
          />
          
          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brown-200">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-6 h-6 text-brown-800" />
                <h2 className="text-xl font-serif font-bold text-brown-900">
                  Carrito de Compras
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-brown-600 hover:text-brown-800 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-brown-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-brown-600 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-brown-500 mb-6">
                    Agrega algunos productos para comenzar
                  </p>
                  <button
                    onClick={closeCart}
                    className="btn-primary"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex space-x-4 p-4 border border-brown-200 rounded-lg">
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-brown-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-brown-800 rounded-full flex items-center justify-center">
                          <span className="text-cream-50 font-serif font-bold text-sm">CP</span>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-brown-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-brown-600 mb-2">
                          {formatPrice(item.product.price)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-brown-300 flex items-center justify-center hover:bg-brown-50 transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4 text-brown-600" />
                          </button>
                          <span className="w-8 text-center text-brown-900 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-brown-300 flex items-center justify-center hover:bg-brown-50 transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4 text-brown-600" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-brown-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-brown-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-brown-900">Total:</span>
                  <span className="text-xl font-bold text-brown-900">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full text-center py-4 text-lg font-semibold flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Finalizar Compra
                  </Link>
                  <button
                    onClick={closeCart}
                    className="btn-secondary w-full py-3 text-base font-medium flex items-center justify-center hover:bg-cream-300 transition-colors"
                  >
                    Seguir Comprando
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartSidebar

