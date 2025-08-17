import { Link } from 'react-router-dom'
import { Package, Settings, LogOut, BarChart3, Users, ShoppingCart, Database, Download, RefreshCw, Server, Globe } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const { products, refreshProducts } = useProducts()
  const [isOnline, setIsOnline] = useState(true)
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [environment, setEnvironment] = useState<'local' | 'production'>('local')

  // Check API status and environment
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        setEnvironment(apiUrl.includes('localhost') ? 'local' : 'production')
        
        const response = await fetch(`${apiUrl}/api/products/test`)
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch (error) {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const adminCards = [
    {
      title: 'Gestión de Productos',
      description: 'Administra el catálogo de productos, precios e imágenes',
      icon: Settings,
      link: '/admin/productos',
      color: 'bg-brown-600 hover:bg-brown-700',
      iconColor: 'text-brown-100',
      badge: `${products.length} productos`
    },
    {
      title: 'Gestión de Pedidos',
      description: 'Revisa y actualiza el estado de los pedidos',
      icon: Package,
      link: '/admin/pedidos',
      color: 'bg-blue-600 hover:bg-blue-700',
      iconColor: 'text-blue-100',
      badge: '0 pedidos'
    },
    {
      title: 'Base de Datos',
      description: 'Sincronización y gestión de la base de datos',
      icon: Database,
      link: '/admin/database',
      color: 'bg-purple-600 hover:bg-purple-700',
      iconColor: 'text-purple-100',
      badge: environment
    },
    {
      title: 'Estadísticas',
      description: 'Vista general de ventas y métricas',
      icon: BarChart3,
      link: '/admin/stats',
      color: 'bg-green-600 hover:bg-green-700',
      iconColor: 'text-green-100',
      badge: 'Próximamente'
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: Users,
      link: '/admin/customers',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      iconColor: 'text-indigo-100',
      badge: 'Próximamente'
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema y preferencias',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
      iconColor: 'text-gray-100',
      badge: 'Próximamente'
    }
  ]

  const quickActions = [
    {
      title: 'Sincronizar DB',
      description: 'Sincronizar base de datos local con producción',
      icon: RefreshCw,
      action: () => {
        toast.success('Sincronización iniciada...')
        // TODO: Implement database sync
      },
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Respaldar DB',
      description: 'Crear respaldo de la base de datos',
      icon: Download,
      action: () => {
        toast.success('Respaldo iniciado...')
        // TODO: Implement database backup
      },
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Refrescar Productos',
      description: 'Actualizar lista de productos',
      icon: RefreshCw,
      action: () => {
        refreshProducts()
        toast.success('Productos actualizados')
      },
      color: 'bg-orange-500 hover:bg-orange-600'
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
          <div className="flex items-center gap-4">
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'online' ? 'bg-green-500' : 
                apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                API {apiStatus === 'online' ? 'Conectada' : apiStatus === 'offline' ? 'Desconectada' : 'Verificando...'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              {environment === 'local' ? (
                <Server className="w-4 h-4 text-blue-600" />
              ) : (
                <Globe className="w-4 h-4 text-green-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {environment === 'local' ? 'Local' : 'Producción'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-lg flex items-center space-x-3 transition-colors duration-200`}
              >
                <action.icon className="w-6 h-6" />
                <div className="text-left">
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className={`${card.color} text-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-4">
                <card.icon className={`w-8 h-8 ${card.iconColor}`} />
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm opacity-90">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Environment Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Entorno</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Entorno:</strong> {environment === 'local' ? 'Desarrollo Local' : 'Producción'}</p>
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
              <p><strong>Estado API:</strong> {apiStatus === 'online' ? 'Conectada' : 'Desconectada'}</p>
            </div>
            <div>
              <p><strong>Conexión Internet:</strong> {isOnline ? 'Disponible' : 'No disponible'}</p>
              <p><strong>Productos Cargados:</strong> {products.length}</p>
              <p><strong>Última Actualización:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
