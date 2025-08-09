import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CreditCard, Building2, DollarSign, Lock, ArrowLeft, Loader2 } from 'lucide-react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

const MercadoPagoPayment = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
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
    initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012')
    
    // Create preference when component mounts
    createPreference()
  }, [])

  const createPreference = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.log('API URL being used:', apiUrl);
      console.log('Full endpoint:', `${apiUrl}/api/mercadopago/create-preference`);
      
      const response = await fetch(`${apiUrl}/api/mercadopago/create-preference`, {
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
                customization={{ 
                  customStyle: {
                    buttonBackground: 'default',
                    borderRadius: '6px'
                  }
                }}
                locale="es-CO"
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


    </div>
  )
}

export default MercadoPagoPayment 