import { useState } from 'react'
import { CreditCard, Building2, DollarSign, Lock, CheckCircle, AlertCircle } from 'lucide-react'

interface MercadoPagoPaymentProps {
  amount: number
  orderId: string
  customerEmail: string
  customerName: string
  onSuccess: (response: any) => void
  onError: (error: any) => void
}

const MercadoPagoPayment = ({ 
  amount, 
  orderId, 
  customerEmail, 
  customerName, 
  onSuccess, 
  onError 
}: MercadoPagoPaymentProps) => {
  // Updated: Using redirect approach for reliable payment processing
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
      setErrorMessage('Error al procesar el pago. Por favor, intenta nuevamente.')
      setPaymentStatus('error')
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-brown-50 rounded-lg p-4">
        <h3 className="font-medium text-brown-900 mb-2">Resumen del Pago - MercadoPago</h3>
        <div className="space-y-1 text-sm">
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

