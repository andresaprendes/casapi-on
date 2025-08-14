import { useState, useEffect } from 'react'
import { CreditCard, Building2, DollarSign, Lock, CheckCircle, AlertCircle } from 'lucide-react'

interface MercadoPagoPaymentProps {
  amount: number
  orderId: string
  customerEmail: string
  customerName: string
  onError: (error: any) => void
}

const MercadoPagoPayment = ({ 
  amount, 
  orderId, 
  customerEmail, 
  customerName, 
  onError
}: MercadoPagoPaymentProps) => {
  // Updated: Using redirect approach for reliable payment processing
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Auto-trigger payment when component mounts (only once)
  useEffect(() => {
    if (orderId && !isProcessing && paymentStatus === 'idle') {
      console.log('🚀 Auto-triggering MercadoPago payment for order:', orderId)
      // Add a small delay to prevent multiple triggers
      const timer = setTimeout(() => {
        handlePayment()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [orderId, isProcessing, paymentStatus])

  // Manual payment trigger function
  const handleManualPayment = () => {
    if (!isProcessing && paymentStatus === 'idle') {
      handlePayment()
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // Create MercadoPago preference
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      console.log('API URL being used:', apiUrl);
      console.log('Full endpoint:', `${apiUrl}/api/mercadopago/create-preference`);
      
      const response = await fetch(`${apiUrl}/api/mercadopago/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          orderId: orderId,
          customerEmail: customerEmail,
          customerName: customerName,
          description: `Orden ${orderId} - Casa Piñón Ebanistería`
        })
      })

      const result = await response.json()

      if (result.success && result.preferenceId) {
        // Redirect to MercadoPago checkout page
        if (result.initPoint) {
          window.location.href = result.initPoint;
        } else {
          // Fallback URL construction
          window.location.href = `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=${result.preferenceId}`;
        }

        // Don't call onSuccess here - let the redirect handle it
        // The order will be processed after payment verification
        setPaymentStatus('success')
      } else {
        throw new Error(result.error || 'Error al crear la preferencia de pago')
      }
    } catch (error) {
      console.error('MercadoPago payment error:', error)
      
      // Provide more specific error messages
      let errorMsg = 'Error al procesar el pago. Por favor, intenta nuevamente.'
      if (error.message?.includes('network')) {
        errorMsg = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      } else if (error.message?.includes('preference')) {
        errorMsg = 'Error al crear la preferencia de pago. Contacta soporte.'
      } else if (error.message?.includes('amount')) {
        errorMsg = 'Error en el monto del pago. Verifica el total e intenta nuevamente.'
      }
      
      setErrorMessage(errorMsg)
      setPaymentStatus('error')
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">Redirigiendo a MercadoPago...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {paymentStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error: {errorMessage}</span>
          </div>
        </div>
      )}

      {/* Payment Summary - Only show if not processing */}
      {!isProcessing && paymentStatus !== 'error' && (
        <div className="bg-brown-50 rounded-lg p-4">
          <h3 className="font-medium text-brown-900 mb-2">Resumen del Pago - MercadoPago</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Orden:</strong> {orderId}</p>
            <p><strong>Total:</strong> {formatPrice(amount)}</p>
            <p><strong>Cliente:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
          </div>
          
          {/* Manual payment button as backup */}
          <button
            onClick={handleManualPayment}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Proceder al Pago
          </button>
        </div>
      )}
            <div className="flex justify-between">
              <span className="text-brown-600">Orden:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Cliente:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-600">Total a Pagar:</span>
              <span className="font-bold text-brown-900">{formatPrice(amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Available */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-3">Métodos de Pago Disponibles</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Tarjetas</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>PSE</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Efectivo</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>DaviPlata</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Nequi</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Bancolombia</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-green-800">Pago Seguro con MercadoPago</h4>
            <p className="text-sm text-green-700 mt-1">
              Tus datos están protegidos con encriptación SSL de 256 bits. 
              MercadoPago cumple con los estándares de seguridad PCI DSS y está certificado por Visa y Mastercard.
            </p>
          </div>
        </div>
      </div>

      {/* MercadoPago Features */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Ventajas de MercadoPago</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div>• Procesamiento instantáneo</div>
          <div>• Múltiples métodos de pago</div>
          <div>• Seguridad de nivel bancario</div>
          <div>• Soporte 24/7</div>
          <div>• Integración fácil</div>
          <div>• Popular en Colombia</div>
        </div>
      </div>

      {/* MercadoPago Checkout Button */}
      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creando preferencia de pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Pagar {formatPrice(amount)} con MercadoPago</span>
            </div>
          )}
        </button>

        {/* MercadoPago will redirect automatically when payment is initiated */}
      </div>

      {/* Status Messages */}
      {paymentStatus === 'success' && (
        <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">¡Redirigiendo a MercadoPago!</span>
          </div>
          <p className="text-sm mt-1">Serás redirigido automáticamente a MercadoPago para completar tu pago.</p>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error al procesar el pago</span>
          </div>
          {errorMessage && (
            <p className="text-sm mt-1">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default MercadoPagoPayment

