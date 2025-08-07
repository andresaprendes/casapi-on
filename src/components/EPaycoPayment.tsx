import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface EPaycoFormData {
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvv: string
  installments: number
}

interface EPaycoPaymentProps {
  amount: number
  orderId: string
  onSuccess: (response: any) => void
  onError: (error: any) => void
}

const EPaycoPayment = ({ amount, orderId, onSuccess, onError }: EPaycoPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<EPaycoFormData>()
  const watchCardNumber = watch('cardNumber')

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5')) return 'mastercard'
    if (number.startsWith('3')) return 'amex'
    return 'unknown'
  }

  const onSubmit = async (_data: EPaycoFormData) => {
    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Simulate ePayco payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would:
      // 1. Send payment data to your backend
      // 2. Backend would call ePayco API
      // 3. Return the response
      
      const mockResponse = {
        success: true,
        transactionId: `EP-${Date.now()}`,
        status: 'approved',
        amount: amount,
        orderId: orderId
      }
      
      setPaymentStatus('success')
      onSuccess(mockResponse)
      
    } catch (error) {
      setPaymentStatus('error')
      onError(error)
    } finally {
      setIsProcessing(false)
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
        <h3 className="font-medium text-brown-900 mb-2">Resumen del Pago</h3>
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

      {/* Payment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Número de Tarjeta *
          </label>
          <div className="relative">
            <input
              type="text"
              {...register('cardNumber', { 
                required: 'El número de tarjeta es requerido',
                minLength: { value: 19, message: 'Número de tarjeta inválido' }
              })}
              className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent pr-12"
              placeholder="1234 5678 9012 3456"
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value)
                e.target.value = formatted
              }}
              maxLength={19}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {watchCardNumber && (
                <div className="w-8 h-5 bg-brown-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-brown-700">
                    {getCardType(watchCardNumber).toUpperCase().slice(0, 1)}
                  </span>
                </div>
              )}
            </div>
          </div>
          {errors.cardNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.cardNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Nombre en la Tarjeta *
          </label>
          <input
            type="text"
            {...register('cardName', { required: 'El nombre es requerido' })}
            className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
            placeholder="JUAN PEREZ"
          />
          {errors.cardName && (
            <p className="text-red-600 text-sm mt-1">{errors.cardName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="text"
              {...register('cardExpiry', { 
                required: 'La fecha de vencimiento es requerida',
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                  message: 'Formato MM/AA'
                }
              })}
              className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
              placeholder="MM/AA"
              onChange={(e) => {
                const formatted = formatExpiry(e.target.value)
                e.target.value = formatted
              }}
              maxLength={5}
            />
            {errors.cardExpiry && (
              <p className="text-red-600 text-sm mt-1">{errors.cardExpiry.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              {...register('cardCvv', { 
                required: 'El CVV es requerido',
                minLength: { value: 3, message: 'CVV inválido' },
                maxLength: { value: 4, message: 'CVV inválido' }
              })}
              className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
              placeholder="123"
              maxLength={4}
            />
            {errors.cardCvv && (
              <p className="text-red-600 text-sm mt-1">{errors.cardCvv.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown-700 mb-2">
            Cuotas
          </label>
          <select
            {...register('installments', { value: 1 })}
            className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
          >
            <option value={1}>1 cuota - Sin interés</option>
            <option value={3}>3 cuotas - Sin interés</option>
            <option value={6}>6 cuotas - Sin interés</option>
            <option value={12}>12 cuotas - Sin interés</option>
          </select>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Pago Seguro</h4>
              <p className="text-sm text-green-700 mt-1">
                Tus datos están protegidos con encriptación SSL de 256 bits. 
                ePayco cumple con los estándares de seguridad PCI DSS.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Métodos de Pago Disponibles</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• Tarjeta de Crédito</div>
            <div>• Tarjeta de Débito</div>
            <div>• PSE (Pagos Seguros en Línea)</div>
            <div>• Efectivo en Puntos de Pago</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Procesando Pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Pagar {formatPrice(amount)}</span>
            </div>
          )}
        </button>
      </form>

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

export default EPaycoPayment
