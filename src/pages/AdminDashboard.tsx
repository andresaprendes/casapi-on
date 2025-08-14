import { Link } from 'react-router-dom'
import { Package, Settings, LogOut, BarChart3, Users, ShoppingCart } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useProducts } from '../hooks/useProducts'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const { products } = useProducts()

  const adminCards = [
    {
      title: 'Gestión de Productos',
      description: 'Administra el catálogo de productos, precios e imágenes',
      icon: Settings,
      link: '/admin/productos',
      color: 'bg-brown-600 hover:bg-brown-700',
      iconColor: 'text-brown-100'
    },
    {
      title: 'Gestión de Pedidos',
      description: 'Revisa y actualiza el estado de los pedidos',
      icon: Package,
      link: '/admin/pedidos',
      color: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-blue-100'
    },
    {
      title: 'Estadísticas',
      description: 'Vista general de ventas y métricas',
      icon: BarChart3,
      link: '#',
      color: 'bg-green-600 hover:bg-green-700',
      iconColor: 'text-green-100'
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: Users,
      link: '#',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'text-purple-100'
    }
  ]

  return (
    <div className="section-padding bg-cream-50 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brown-900 mb-2">Panel de Administración</h1>
            <p className="text-brown-600">Bienvenido al panel de control de Casa Piñón Ebanistería</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold text-gray-900">$0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`${card.color} text-white rounded-lg shadow-md p-6 transition-all duration-200 transform hover:scale-105`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg bg-white bg-opacity-20 ${card.iconColor}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-white text-opacity-90">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-brown-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/productos"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="w-5 h-5 text-brown-600 mr-3" />
              <span className="text-brown-900">Agregar Nuevo Producto</span>
            </Link>
            
            <Link
              to="/admin/pedidos"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Package className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-brown-900">Revisar Pedidos</span>
            </Link>
            
            <button
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-brown-900">Ver Reportes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
