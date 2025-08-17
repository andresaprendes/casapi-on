import { useState, useEffect } from 'react'
import { 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Server, 
  Globe,
  FileText,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

interface DatabaseStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  databaseSize: string
  lastBackup: string
  lastSync: string
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error'
  message: string
  progress: number
}

const AdminDatabase = () => {
  const { logout } = useAuth()
  const { products, refreshProducts } = useProducts()
  const [environment, setEnvironment] = useState<'local' | 'production'>('local')
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    message: '',
    progress: 0
  })
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    databaseSize: '0 MB',
    lastBackup: 'Nunca',
    lastSync: 'Nunca'
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string>('')

  // Check environment and API status
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        setEnvironment(apiUrl.includes('localhost') ? 'local' : 'production')
        
        const response = await fetch(`${apiUrl}/api/products/test`)
        if (response.ok) {
          setApiStatus('online')
          await fetchDatabaseStats()
        } else {
          setApiStatus('offline')
        }
      } catch (error) {
        setApiStatus('offline')
      }
    }

    checkEnvironment()
    const interval = setInterval(checkEnvironment, 30000)

    return () => clearInterval(interval)
  }, [])

  // Update database stats when products change
  useEffect(() => {
    setDatabaseStats(prev => ({
      ...prev,
      totalProducts: products.length
    }))
  }, [products])

  const fetchDatabaseStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/database/stats`)
      if (response.ok) {
        const stats = await response.json()
        setDatabaseStats(stats)
      }
    } catch (error) {
      console.error('Error fetching database stats:', error)
    }
  }

  const handleSync = async (direction: 'local-to-production' | 'production-to-local' | 'reset') => {
    setSyncStatus({
      status: 'syncing',
      message: `Sincronizando ${direction === 'local-to-production' ? 'local → producción' : direction === 'production-to-local' ? 'producción → local' : 'reseteando'}...`,
      progress: 0
    })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      let endpoint = ''

      switch (direction) {
        case 'local-to-production':
          endpoint = '/api/database/sync/local-to-production'
          break
        case 'production-to-local':
          endpoint = '/api/database/sync/production-to-local'
          break
        case 'reset':
          endpoint = '/api/database/sync/reset'
          break
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setSyncStatus({
          status: 'success',
          message: 'Sincronización completada exitosamente',
          progress: 100
        })
        toast.success('Base de datos sincronizada exitosamente')
        refreshProducts()
        await fetchDatabaseStats()
      } else {
        throw new Error('Error en la sincronización')
      }
    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        progress: 0
      })
      toast.error('Error al sincronizar la base de datos')
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setSyncStatus({
        status: 'idle',
        message: '',
        progress: 0
      })
    }, 5000)
  }

  const handleBackup = async () => {
    setSyncStatus({
      status: 'syncing',
      message: 'Creando respaldo de la base de datos...',
      progress: 0
    })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/database/backup`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        setSyncStatus({
          status: 'success',
          message: `Respaldo creado: ${result.filename}`,
          progress: 100
        })
        toast.success('Respaldo creado exitosamente')
        await fetchDatabaseStats()
      } else {
        throw new Error('Error al crear el respaldo')
      }
    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        progress: 0
      })
      toast.error('Error al crear el respaldo')
    }

    setTimeout(() => {
      setSyncStatus({
        status: 'idle',
        message: '',
        progress: 0
      })
    }, 5000)
  }

  const handleRestore = async (file: File) => {
    setSyncStatus({
      status: 'syncing',
      message: 'Restaurando base de datos...',
      progress: 0
    })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const formData = new FormData()
      formData.append('backup', file)

      const response = await fetch(`${apiUrl}/api/database/restore`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        setSyncStatus({
          status: 'success',
          message: 'Base de datos restaurada exitosamente',
          progress: 100
        })
        toast.success('Base de datos restaurada exitosamente')
        refreshProducts()
        await fetchDatabaseStats()
      } else {
        throw new Error('Error al restaurar la base de datos')
      }
    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        progress: 0
      })
      toast.error('Error al restaurar la base de datos')
    }

    setTimeout(() => {
      setSyncStatus({
        status: 'idle',
        message: '',
        progress: 0
      })
    }, 5000)
  }

  const handleClearDatabase = () => {
    setConfirmAction('clear')
    setShowConfirmModal(true)
  }

  const confirmClearDatabase = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/database/clear`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Base de datos limpiada exitosamente')
        refreshProducts()
        await fetchDatabaseStats()
      } else {
        throw new Error('Error al limpiar la base de datos')
      }
    } catch (error) {
      toast.error('Error al limpiar la base de datos')
    }
    setShowConfirmModal(false)
  }

  const syncActions = [
    {
      title: 'Sincronizar Local → Producción',
      description: 'Subir cambios locales a la base de datos de producción',
      icon: Upload,
      action: () => handleSync('local-to-production'),
      color: 'bg-blue-500 hover:bg-blue-600',
      disabled: environment === 'production'
    },
    {
      title: 'Sincronizar Producción → Local',
      description: 'Descargar cambios de producción a la base de datos local',
      icon: Download,
      action: () => handleSync('production-to-local'),
      color: 'bg-green-500 hover:bg-green-600',
      disabled: environment === 'production'
    },
    {
      title: 'Resetear a Valores por Defecto',
      description: 'Restaurar la base de datos a los productos por defecto',
      icon: RefreshCw,
      action: () => handleSync('reset'),
      color: 'bg-orange-500 hover:bg-orange-600',
      disabled: false
    }
  ]

  const maintenanceActions = [
    {
      title: 'Crear Respaldo',
      description: 'Crear una copia de seguridad de la base de datos actual',
      icon: Save,
      action: handleBackup,
      color: 'bg-purple-500 hover:bg-purple-600',
      disabled: false
    },
    {
      title: 'Restaurar Respaldo',
      description: 'Restaurar la base de datos desde un archivo de respaldo',
      icon: FileText,
      action: () => document.getElementById('restore-file')?.click(),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      disabled: false
    },
    {
      title: 'Limpiar Base de Datos',
      description: 'Eliminar todos los datos (¡CUIDADO!)',
      icon: Trash2,
      action: handleClearDatabase,
      color: 'bg-red-500 hover:bg-red-600',
      disabled: false
    }
  ]

  return (
    <div className="section-padding bg-cream-50 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brown-900 mb-2">Gestión de Base de Datos</h1>
            <p className="text-brown-600">Administra y sincroniza la base de datos entre entornos</p>
          </div>
          <div className="flex items-center gap-4">
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
            <Link
              to="/admin"
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{databaseStats.totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{databaseStats.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tamaño DB</p>
                <p className="text-2xl font-bold text-gray-900">{databaseStats.databaseSize}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Sincronización</p>
                <p className="text-sm font-bold text-gray-900">{databaseStats.lastSync}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus.status !== 'idle' && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {syncStatus.status === 'syncing' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
                {syncStatus.status === 'success' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {syncStatus.status === 'error' && (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {syncStatus.status === 'syncing' ? 'Sincronizando...' : 
                   syncStatus.status === 'success' ? 'Completado' : 'Error'}
                </h3>
              </div>
              <button
                onClick={() => setSyncStatus({ status: 'idle', message: '', progress: 0 })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-3">{syncStatus.message}</p>
            {syncStatus.status === 'syncing' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${syncStatus.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Sync Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sincronización</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {syncActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={action.disabled || syncStatus.status === 'syncing'}
                className={`${action.color} text-white p-4 rounded-lg flex items-center space-x-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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

        {/* Maintenance Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mantenimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {maintenanceActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={action.disabled || syncStatus.status === 'syncing'}
                className={`${action.color} text-white p-4 rounded-lg flex items-center space-x-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
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

        {/* Hidden file input for restore */}
        <input
          id="restore-file"
          type="file"
          accept=".json,.sql,.backup"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleRestore(file)
            }
          }}
        />

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Entorno</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Entorno Actual:</strong> {environment === 'local' ? 'Desarrollo Local' : 'Producción'}</p>
              <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
              <p><strong>Estado API:</strong> {apiStatus === 'online' ? 'Conectada' : 'Desconectada'}</p>
              <p><strong>Último Respaldo:</strong> {databaseStats.lastBackup}</p>
            </div>
            <div>
              <p><strong>Productos en Memoria:</strong> {products.length}</p>
              <p><strong>Productos en DB:</strong> {databaseStats.totalProducts}</p>
              <p><strong>Tamaño de Base de Datos:</strong> {databaseStats.databaseSize}</p>
              <p><strong>Última Sincronización:</strong> {databaseStats.lastSync}</p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Acción</h3>
              </div>
              <p className="text-gray-600 mb-6">
                {confirmAction === 'clear' && 
                  '¿Estás seguro de que quieres limpiar toda la base de datos? Esta acción no se puede deshacer.'
                }
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmClearDatabase}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDatabase
