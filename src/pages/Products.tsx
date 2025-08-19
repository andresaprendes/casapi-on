import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Search, Grid, List } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { categories, woodTypes } from '../data/mockData'
import { useProducts } from '../hooks/useProducts'
import { useAuth } from '../store/AuthContext'

const Products = () => {
  const { category } = useParams()
  const { products } = useProducts()
  const { isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWoodType, setSelectedWoodType] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    // Hide adminOnly products for non-admins
    let filtered = products.filter(p => isAuthenticated || !p.adminOnly)

    // Filter by category if specified
    if (category) {
      filtered = filtered.filter(product => product.category === category)
    }

    // Filter by wood type if selected
    if (selectedWoodType) {
      filtered = filtered.filter(product => product.woodType === selectedWoodType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.materials.some(material => 
          material.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredProducts(filtered)
  }, [products, category, selectedWoodType, searchTerm, isAuthenticated])

  const currentCategory = categories.find(cat => cat.slug === category)

  return (
    <>
      <Helmet>
        <title>
          {currentCategory 
            ? `${currentCategory.name} - Casa Piñón Ebanistería`
            : 'Productos - Casa Piñón Ebanistería'
          }
        </title>
        <meta name="description" content="Muebles de madera real, puertas, ventanas y piezas personalizadas en Medellín y Oriente Antioqueño." />
      </Helmet>

      <div className="section-padding">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              {currentCategory ? currentCategory.name : 'Nuestros Productos'}
            </h1>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              {currentCategory 
                ? currentCategory.description
                : 'Descubre nuestra colección de muebles de madera real, puertas, ventanas y piezas personalizadas.'
              }
            </p>
            <div className="mt-4 p-4 bg-cream-100 rounded-lg border border-brown-200">
              <p className="text-sm text-brown-700">
                <span className="font-semibold">💡 Todos nuestros productos son fabricados por pedido</span> - 
                Cada pieza se elabora artesanalmente según tus especificaciones y preferencias.
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Wood Type Filter */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedWoodType}
                  onChange={(e) => setSelectedWoodType(e.target.value)}
                  className="px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent bg-white text-brown-700"
                >
                  <option value="">Todos los tipos de madera</option>
                  {woodTypes.map(wood => (
                    <option key={wood.id} value={wood.id}>{wood.name}</option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-brown-800 text-cream-50'
                        : 'bg-cream-100 text-brown-600 hover:bg-cream-200'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-brown-800 text-cream-50'
                        : 'bg-brown-100 text-brown-600 hover:bg-brown-200'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-brown-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`grid gap-8 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <div className="text-brown-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-brown-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-brown-600">
                Intenta con otros términos de búsqueda o explora nuestras categorías.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default Products 