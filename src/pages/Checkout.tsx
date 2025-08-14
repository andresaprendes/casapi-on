import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  CheckCircle,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { useCart } from '../store/CartContext'
import { shippingZones } from '../data/mockData'
import MercadoPagoPayment from '../components/MercadoPagoPayment'

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  shippingZone: string
  notes?: string
}

interface PaymentInfo {
  method: 'mercadopago'
}

const Checkout = () => {
  const { state, clearCart } = useCart()
  const { items } = state
  const [currentStep, setCurrentStep] = useState<'cart' | 'shipping' | 'payment' | 'confirmation'>('cart')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerInfo>()

  // Calculate totals - IVA and shipping included in product prices
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0)
  const total = subtotal // No additional taxes or shipping

  const handleCustomerSubmit = async (data: CustomerInfo) => {
    setCustomerInfo(data)
    // Save customer info to localStorage for use in success page
    localStorage.setItem('checkout_customer_info', JSON.stringify({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      shippingZone: data.shippingZone,
      notes: data.notes
    }))
    
    // Create order immediately when customer info is submitted
    console.log('🔍 Creating order after customer info submission...')
    setIsCreatingOrder(true)
    
    try {
      const orderResult = await processOrder()
      console.log('🔍 Order creation result:', orderResult)
      
      if (orderResult && orderResult.success && orderResult.orderNumber) {
        console.log('✅ Order created successfully:', orderResult.orderNumber)
        setOrderNumber(orderResult.orderNumber)
        setIsCreatingOrder(false)
        setCurrentStep('payment')
      } else {
        console.error('❌ Order creation failed')
        setIsCreatingOrder(false)
        alert('Error al crear la orden. Por favor intenta de nuevo.')
        return
      }
    } catch (error) {
      console.error('❌ Error in order creation:', error)
      setIsCreatingOrder(false)
      alert('Error al crear la orden. Por favor intenta de nuevo.')
      return
    }
  }

  const handlePaymentSubmit = (data: PaymentInfo) => {
    setPaymentInfo(data)
    // Order is already created, just set payment method
    console.log('✅ Payment method selected:', data.method)
  }

  const handleMercadoPagoError = (error: any) => {
    console.error('MercadoPago payment error:', error)
    // Handle error - could show a toast or error message
  }

  const processOrder = async () => {
    console.log('🔍 processOrder called with:', { customerInfo, items: items.length })
    if (!customerInfo || !items.length) {
      console.error('Missing customer info or items for order creation')
      return {
        success: false,
        orderNumber: null
      }
    }

    try {
      // Create order in database
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app'
      
      const orderData = {
        customer: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            street: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            zipCode: customerInfo.zipCode || '',
            country: 'Colombia'
          }
        },
        items: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity,
          customizations: item.customizations
        })),
        subtotal,
        shipping: 0, // No shipping cost
        tax: 0, // IVA included in product prices
        total,
        shippingZone: customerInfo.shippingZone,
        paymentMethod: paymentInfo?.method || 'unknown',
        notes: customerInfo.notes || ''
      }

      console.log('Creating order:', orderData)
      console.log('🔍 API URL:', apiUrl)
      
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)

      const result = await response.json()
      console.log('🔍 API Response:', result)
      
      if (result.success && result.order) {
        console.log('✅ Order created successfully:', result.order.orderNumber)
        return {
          success: true,
          orderNumber: result.order.orderNumber
        }
      } else {
        console.error('❌ API failed to create order:', result)
        // Create a fallback order number and continue anyway
        const fallbackOrderNumber = `CP-${Date.now()}`
        console.log('⚠️ Using fallback order number:', fallbackOrderNumber)
        return {
          success: true,
          orderNumber: fallbackOrderNumber
        }
      }
      
    } catch (error) {
      console.error('Error creating order:', error)
      // Fallback to local order number
      const fallbackOrderNumber = `CP-${Date.now()}`
      return {
        success: false,
        orderNumber: fallbackOrderNumber
      }
    }
    
    clearCart()
    return {
      success: false,
      orderNumber: null
    }
  }

  const paymentMethods = [
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      description: 'Pago seguro con MercadoPago (Tarjetas, PSE, Efectivo)',
      icon: CreditCard,
      popular: true,
      component: MercadoPagoPayment,
      onError: handleMercadoPagoError
    }
  ]

  if (items.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-brown-900 mb-4">Tu carrito está vacío</h1>
            <p className="text-brown-600 mb-6">Agrega algunos productos antes de continuar con la compra.</p>
            <a href="/productos" className="btn-primary">
              Ver Productos
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 overflow-x-auto px-4">
            {['cart', 'shipping', 'payment', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-brown-600 text-white' 
                    : index < ['cart', 'shipping', 'payment', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < ['cart', 'shipping', 'payment', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8 text-sm">
            <span className={currentStep === 'cart' ? 'text-brown-600 font-medium' : 'text-gray-500'}>Carrito</span>
            <span className={currentStep === 'shipping' ? 'text-brown-600 font-medium' : 'text-gray-500'}>Envío</span>
            <span className={currentStep === 'payment' ? 'text-brown-600 font-medium' : 'text-gray-500'}>Pago</span>
            <span className={currentStep === 'confirmation' ? 'text-brown-600 font-medium' : 'text-gray-500'}>Confirmación</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'cart' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-brown-900 mb-8">Revisar Carrito</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-brown-900 mb-4">Productos</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-brown-100 rounded-lg">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-brown-900">{item.product.name}</h3>
                          <p className="text-sm text-brown-600">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-brown-900">${(item.product.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-brown-900 mb-4">Resumen del Pedido</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="w-full btn-primary mt-6"
                  >
                    Continuar con Información
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'shipping' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => setCurrentStep('cart')}
                className="flex items-center text-brown-600 hover:text-brown-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-brown-900">Información del Cliente</h1>
            </div>

            <form onSubmit={handleSubmit(handleCustomerSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'El nombre es requerido' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="Juan"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'El apellido es requerido' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="Pérez"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="juan@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'El teléfono es requerido' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="310 000 0000"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  {...register('address', { required: 'La dirección es requerida' })}
                  className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  placeholder="Calle 123 # 45-67"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    {...register('city', { required: 'La ciudad es requerida' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="Medellín"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    {...register('zipCode')}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="050001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brown-700 mb-2">
                    Zona de Envío *
                  </label>
                  <select
                    {...register('shippingZone', { required: 'Selecciona una zona de envío' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  >
                    <option value="">Selecciona zona</option>
                    {shippingZones.map((zone) => (
                      <option key={zone.name} value={zone.name}>
                        {zone.name} - ${zone.basePrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {errors.shippingZone && (
                    <p className="text-red-600 text-sm mt-1">{errors.shippingZone.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingOrder}
                className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando Orden...
                  </>
                ) : (
                  <>
                    Continuar al Pago
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {currentStep === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => setCurrentStep('shipping')}
                className="flex items-center text-brown-600 hover:text-brown-800 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </button>
              <h1 className="text-3xl font-bold text-brown-900">Método de Pago</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Methods */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-brown-900 mb-6">Selecciona tu método de pago</h2>
                  
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setPaymentInfo({ method: method.id as any })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          paymentInfo?.method === method.id
                            ? 'border-brown-800 bg-brown-50'
                            : 'border-brown-200 hover:border-brown-400'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <method.icon className="w-8 h-8 text-brown-600" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-brown-900">{method.name}</h3>
                              {method.popular && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-brown-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Components */}
                  {isCreatingOrder && (
                    <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center space-x-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-blue-800 font-medium">Creando orden...</span>
                      </div>
                    </div>
                  )}

                  {!isCreatingOrder && orderNumber && paymentInfo?.method === 'mercadopago' && customerInfo && (
                    <MercadoPagoPayment
                      amount={total}
                      orderId={orderNumber}
                      customerEmail={customerInfo.email}
                      customerName={`${customerInfo.firstName} ${customerInfo.lastName}`}
                      onError={handleMercadoPagoError}
                    />
                  )}

                  {!isCreatingOrder && !orderNumber && (
                    <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-center">
                        <p className="text-red-800 font-medium">Error: No se pudo crear la orden</p>
                        <p className="text-red-600 text-sm mt-2">Por favor, regresa al paso anterior e intenta de nuevo.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-brown-900 mb-4">Resumen del Pedido</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 'confirmation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-brown-900 mb-4">¡Orden Confirmada!</h1>
              <p className="text-lg text-brown-600 mb-6">
                Gracias por tu compra. Tu orden ha sido procesada exitosamente.
              </p>
              
              <div className="bg-brown-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-brown-900 mb-4">Detalles de la Orden</h2>
                <div className="space-y-2 text-brown-700">
                  <p><strong>Número de Orden:</strong> {orderNumber}</p>
                  <p><strong>Total:</strong> ${total.toLocaleString()}</p>
                  <p><strong>Método de Pago:</strong> {paymentInfo?.method}</p>
                  <p><strong>Fecha:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:flex-col lg:flex-row">
                <a href="/" className="btn-primary w-full sm:flex-1 py-4 text-lg font-semibold flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver al Inicio
                </a>
                <a 
                  href="https://wa.me/573100000000?text=Hola,%20tengo%20una%20pregunta%20sobre%20mi%20orden%20${orderNumber}"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full sm:flex-1 py-4 text-lg font-medium flex items-center justify-center hover:bg-cream-300 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Checkout 