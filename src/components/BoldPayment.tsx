import { useState } from 'react'
import { CreditCard, Lock, Building2, CheckCircle, AlertCircle } from 'lucide-react'



interface BoldPaymentProps {
  amount: number
  orderId: string
  onSuccess: (response: any) => void
  onError: (error: any) => void
}

const BoldPayment = ({ amount, orderId, onError }: BoldPaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [isCreatingLink, setIsCreatingLink] = useState(false)

  const handlePaymentRedirect = async () => {
    console.log('Bold payment button clicked!', { amount, orderId })
    setIsCreatingLink(true)
    setPaymentStatus('processing')

    try {
      // Create payment link using Bold's Botón de Pagos
      console.log('Calling Bold API...')
      const response = await fetch('http://localhost:3001/api/bold/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          reference: orderId,
          description: `Orden ${orderId} - Casa Piñón Ebanistería`,
          customerEmail: "cliente@ejemplo.com",
          customerName: "Cliente Casa Piñón",
          customerPhone: "3100000000",
          returnUrl: `${window.location.origin}/checkout/success?orderId=${orderId}`,
          cancelUrl: `${window.location.origin}/checkout?step=payment`
        })
      })

      const result = await response.json()
      console.log('Bold API response:', result)
      
      if (result.success && result.paymentUrl) {
        // Redirect to Bold's payment page
        console.log('Redirecting to:', result.paymentUrl)
        window.location.href = result.paymentUrl
      } else {
        throw new Error(result.error || 'Error al crear el enlace de pago')
      }
      
    } catch (error) {
      console.error('Bold payment error:', error)
      setPaymentStatus('error')
      onError(error)
    } finally {
      setIsCreatingLink(false)
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

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-brown-50 rounded-lg p-4">
        <h3 className="font-medium text-brown-900 mb-2">Resumen del Pago - Bold</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-brown-600">Orden:</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brown-600">Total a Pagar:</span>
            <span className="font-bold text-brown-900">{formatPrice(amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-6">
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
              <CreditCard className="w-4 h-4" />
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
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Pago Seguro con Bold</h4>
              <p className="text-sm text-green-700 mt-1">
                Serás redirigido a la página segura de Bold para completar tu pago. 
                Tus datos están protegidos con encriptación SSL de 256 bits y Bold cumple con los estándares PCI DSS.
              </p>
            </div>
          </div>
        </div>

        {/* Bold Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Ventajas de Bold</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• Sin comisiones ocultas</div>
            <div>• Aprobación inmediata</div>
            <div>• Múltiples métodos de pago</div>
            <div>• Soporte 24/7</div>
            <div>• Integración fácil</div>
            <div>• Reportes detallados</div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePaymentRedirect}
          disabled={isCreatingLink}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingLink ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creando enlace de pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Pagar {formatPrice(amount)} con Bold</span>
            </div>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {paymentStatus === 'success' && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">¡Pago procesado exitosamente!</span>
          </div>
        </div>
      )}

      {paymentStatus === 'error' && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error al procesar el pago</span>
          </div>
          <p className="text-sm mt-1">Por favor, verifica tus datos e intenta nuevamente.</p>
        </div>
      )}
    </div>
  )
}

export default BoldPayment
