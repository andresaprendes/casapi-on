import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, ShoppingCart, Phone, Mail } from 'lucide-react'
import { useCart } from '../store/CartContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { toggleCart, getTotalItems } = useCart()

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' }
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-brown-900 text-cream-50 py-2">
        <div className="container-custom px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+57 301 466 4444</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>casapinon3@gmail.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span>Lunes a Sábado: 8:00 AM - 5:30 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom px-4">
        <div className="flex items-center justify-center py-6 relative">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute left-0 p-2 text-brown-600 hover:text-brown-800 transition-colors duration-200 lg:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Cart for mobile */}
          <button
            onClick={toggleCart}
            className="absolute right-0 p-2 text-brown-600 hover:text-brown-800 transition-colors duration-200 lg:hidden"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-brown-800 text-cream-50 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>

          {/* Desktop Navigation - Left */}
          <nav className="hidden lg:flex items-center space-x-6 mr-8">
            {navigation.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-brown-700 hover:text-brown-900 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo - Centered */}
          <div className="flex justify-center">
            <Link to="/" className="flex items-center">
              <img
                src="/logo-white.png"
                alt="Casa Piñón Ebanistería"
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Right */}
          <nav className="hidden lg:flex items-center space-x-6 ml-8">
            {navigation.slice(2).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-brown-700 hover:text-brown-900 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart for desktop - positioned absolutely */}
          <button
            onClick={toggleCart}
            className="absolute right-4 p-2 text-brown-600 hover:text-brown-800 transition-colors duration-200 hidden lg:block"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-brown-800 text-cream-50 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="bg-white w-64 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <img
                  src="/logo-light.png"
                  alt="Casa Piñón Ebanistería"
                  className="h-12 w-auto"
                />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-brown-600 hover:text-brown-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-brown-700 hover:text-brown-900 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </header>
  )
}

export default Header 