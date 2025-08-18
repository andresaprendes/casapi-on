import { useState, useEffect } from 'react'
import { Search, Plus, Edit3, Trash2, Save, X, Upload, LogOut, Package, Package as PackageIcon, BarChart3, ArrowUpDown } from 'lucide-react'
import { Product } from '../types'
import { useAuth } from '../store/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ProductReorder from '../components/ProductReorder'
import { getImageUrl } from '../utils/imageUtils'
import { woodTypes, categories } from '../data/mockData'

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()

  // Form state for editing/adding products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    woodType: '',
    images: [] as string[],
    materials: [] as string[],
    madeToOrder: true,
    isCustom: false,
    designVariations: '',
    estimatedDelivery: '',
    features: [] as string[],
    specifications: {} as Record<string, string>
  })

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory || '',
      woodType: product.woodType || '',
      images: [...product.images],
      materials: [...product.materials],
      madeToOrder: product.madeToOrder,
      isCustom: product.isCustom,
      designVariations: product.designVariations || '',
      estimatedDelivery: product.estimatedDelivery,
      features: [...product.features],
      specifications: { ...product.specifications }
    })
    setShowEditModal(true)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      subcategory: '',
      woodType: '',
      images: [],
      materials: [],
      madeToOrder: true,
      isCustom: false,
      designVariations: '',
      estimatedDelivery: '',
      features: [],
      specifications: {}
    })
    setShowAddModal(true)
  }

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      const uploadedImages: string[] = []
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app'
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Resize image before upload
        const resizedImage = await resizeImage(file, 800, 800)
        
        // Create FormData for file upload
        const uploadFormData = new FormData()
        uploadFormData.append('image', resizedImage)
        uploadFormData.append('productName', formData.name || 'product') // Include product name
        
        // Include product ID if editing existing product
        if (editingProduct?.id) {
          uploadFormData.append('productId', editingProduct.id)
        }
        
        // Upload to server
        const response = await fetch(`${apiUrl}/api/upload/image`, {
          method: 'POST',
          body: uploadFormData
        })
        
        const result = await response.json()
        
        if (result.success) {
          uploadedImages.push(result.path)
          console.log('✅ Image uploaded:', result.filename)
        } else {
          throw new Error(result.error || 'Error uploading image')
        }
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }))
      
      toast.success(`${files.length} imagen(es) subida(s) exitosamente`)
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('Error al subir las imágenes: ' + (error as Error).message)
    } finally {
      setUploadingImages(false)
    }
  }

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new window.Image()
      
      img.onload = () => {
        let { width, height } = img
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        }, file.type, 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }



  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, formData)
        toast.success('Producto actualizado exitosamente')
      } else {
        // Add new product
        const productData = {
          ...formData,
          dimensions: { length: 0, width: 0, height: 0 },
          weight: 0
        }
        
        await addProduct(productData)
        toast.success('Producto agregado exitosamente')
      }
      
      setShowEditModal(false)
      setShowAddModal(false)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Error al guardar el producto: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteProduct(productId)
        toast.success('Producto eliminado exitosamente')
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Error al eliminar el producto: ' + (error as Error).message)
      }
    }
  }



  return (
    <div className="section-padding bg-cream-50 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brown-900 mb-2">Gestión de Productos</h1>
            <p className="text-brown-600">Administra el catálogo de productos de Casa Piñón</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/pedidos"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <PackageIcon className="w-4 h-4" />
              <span>Gestionar Pedidos</span>
            </Link>
            <button
              onClick={() => setShowReorderModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Reordenar</span>
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Producto</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, descripción o categoría..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Product Image */}
              <div className="relative aspect-square bg-cream-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cream-50 to-brown-50 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Package className="w-12 h-12 text-brown-400 mx-auto mb-2" />
                      <p className="text-brown-600 text-sm">Sin imagen</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-brown-900 mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-brown-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold text-brown-800 mb-3">{formatCurrency(product.price)}</p>
                
                {/* Wood Type Badge */}
                {product.woodType && (
                  <div className="mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {woodTypes.find(w => w.id === product.woodType)?.name || product.woodType}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.madeToOrder ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.madeToOrder ? 'Por Pedido' : 'Sin Disponibilidad'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-brown-600 hover:text-brown-800 hover:bg-brown-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit/Add Product Modal */}
        {(showEditModal || showAddModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setShowAddModal(false)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct() }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción *
                        </label>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio (COP) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                          >
                            <option value="">Seleccionar categoría</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subcategoría
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                            value={formData.subcategory}
                            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                          >
                            <option value="">Seleccionar subcategoría</option>
                            {formData.category && categories.find(cat => cat.id === formData.category)?.subcategories?.map((subcat: string) => (
                              <option key={subcat} value={subcat}>{subcat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Madera
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                            value={formData.woodType}
                            onChange={(e) => setFormData(prev => ({ ...prev, woodType: e.target.value }))}
                          >
                            <option value="">Seleccionar tipo de madera</option>
                            {woodTypes.map(wood => (
                              <option key={wood.id} value={wood.id}>{wood.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="madeToOrder"
                            className="mr-2"
                            checked={formData.madeToOrder}
                            onChange={(e) => setFormData(prev => ({ ...prev, madeToOrder: e.target.checked }))}
                          />
                          <label htmlFor="madeToOrder" className="text-sm font-medium text-gray-700">
                            Hecho por Pedido
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isCustom"
                            className="mr-2"
                            checked={formData.isCustom}
                            onChange={(e) => setFormData(prev => ({ ...prev, isCustom: e.target.checked }))}
                          />
                          <label htmlFor="isCustom" className="text-sm font-medium text-gray-700">
                            Producto Personalizado
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variaciones de Diseño
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe las posibles variaciones en el diseño..."
                          value={formData.designVariations}
                          onChange={(e) => setFormData(prev => ({ ...prev, designVariations: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiempo de Entrega Estimado
                        </label>
                        <input
                          type="text"
                          placeholder="ej: 4-6 semanas"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                          value={formData.estimatedDelivery}
                          onChange={(e) => setFormData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Images Section */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imágenes del Producto
                        </label>
                        
                        {/* Image Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra las imágenes aquí o haz clic para seleccionar
                          </p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                            disabled={uploadingImages}
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex items-center px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200 cursor-pointer"
                          >
                            {uploadingImages ? 'Subiendo...' : 'Seleccionar Imágenes'}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Las imágenes se redimensionarán automáticamente a 800x800px
                          </p>
                        </div>
                      </div>

                      {/* Current Images */}
                      {formData.images.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes Actuales
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Producto ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false)
                        setShowAddModal(false)
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Guardando...' : 'Guardar Producto'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Reorder Products Modal */}
        {showReorderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Reordenar Productos</h2>
                  <button
                    onClick={() => setShowReorderModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <ProductReorder 
                  onReorder={() => {
                    setShowReorderModal(false)
                    // Refresh products list
                    window.location.reload()
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProducts
