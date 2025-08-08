import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Building2, DollarSign, Lock, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

const MercadoPagoPayment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  // Get parameters from URL
  const amount = parseInt(searchParams.get('amount') || '0')
  const reference = searchParams.get('reference') || ''
  const returnUrl = searchParams.get('return_url') || ''
  const cancelUrl = searchParams.get('cancel_url') || ''

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  useEffect(() => {
    // Initialize MercadoPago SDK
    initMercadoPago(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012')
    
    // Create preference when component mounts
    createPreference()
  }, [])

  const createPreference = async () => {
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              title: `Orden ${reference} - Casa Piñón Ebanistería`,
              unit_price: amount,
              quantity: 1,
            },
          ],
          back_urls: {
            success: returnUrl || `${window.location.origin}/checkout/success`,
            failure: cancelUrl || `${window.location.origin}/checkout`,
            pending: `${window.location.origin}/checkout/pending`,
          },
          auto_return: 'approved',
          external_reference: reference,
        }),
      })

      const data = await response.json()
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId)
      }
    } catch (error) {
      console.error('Error creating preference:', error)
    }
  }

  const handleCancel = () => {
    if (cancelUrl) {
      window.location.href = cancelUrl
    } else {
      navigate('/checkout')
    }
  }

  const handleSuccess = () => {
    setPaymentSuccess(true)
    setTimeout(() => {
      if (returnUrl) {
        window.location.href = returnUrl
      } else {
        navigate('/checkout/success')
      }
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-brown-800 hover:text-brown-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">Pago Seguro</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-brown-900 mb-2">
              Finalizar Compra
            </h1>
            <p className="text-brown-700">
              Completa tu pago de forma segura con MercadoPago
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-brown-800 font-medium">Total a Pagar:</span>
              <span className="text-2xl font-bold text-green-700">
                {formatPrice(amount)}
              </span>
            </div>
            <div className="text-sm text-brown-600 mt-1">
              Referencia: {reference}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-brown-900 mb-4">
              Métodos de Pago Disponibles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <span className="text-brown-800">Tarjetas</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600 mr-3" />
                <span className="text-brown-800">PSE</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600 mr-3" />
                <span className="text-brown-800">Efectivo</span>
              </div>
            </div>
          </div>

          {/* MercadoPago Wallet */}
          {preferenceId ? (
            <div className="space-y-4">
              <Wallet 
                initialization={{ preferenceId }}
                customization={{ texts: { valueProp: 'smart_option' } }}
                onReady={() => console.log('MercadoPago Wallet ready')}
                onSubmit={handleSuccess}
                onError={(error) => console.error('MercadoPago error:', error)}
              />
              
              <div className="text-center text-sm text-gray-600">
                <Lock className="w-4 h-4 inline mr-1" />
                Tus datos están protegidos con encriptación SSL
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-brown-600 mx-auto mb-4 animate-spin" />
              <p className="text-brown-700">Cargando métodos de pago...</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Pago 100% Seguro
              </h3>
              <p className="text-sm text-blue-800">
                MercadoPago utiliza los más altos estándares de seguridad. 
                Tus datos de pago están protegidos con encriptación SSL y 
                cumplimos con las regulaciones PCI DSS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {paymentSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brown-900 mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-brown-700 mb-4">
              Tu pago ha sido procesado correctamente. 
              Te redirigiremos en unos segundos...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-brown-600 animate-spin" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default MercadoPagoPayment 