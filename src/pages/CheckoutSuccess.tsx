import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Mail, Phone, MapPin, Loader2 } from 'lucide-react';

interface PaymentDetails {
  paymentId?: string;
  externalReference?: string;
  amount?: number;
  orderNumber?: string;
  customerEmail?: string;
  customerName?: string;
}

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    if (!paymentId && !externalReference) {
      setError('No se encontró información del pago');
      setIsLoading(false);
      return;
    }

    try {
      // Verify with MercadoPago API
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = externalReference 
        ? `${apiUrl}/api/orders/${externalReference}`
        : `${apiUrl}/api/mercadopago/payment/${paymentId}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        const order = result.order;
        const payment = result.payment;

        const emailFromOrder = order?.customer?.email
          || order?.customerEmail
          || payment?.payerEmail
          || null;

        const nameFromOrder = order?.customer?.name
          || order?.customerName
          || null;

        let fallbackEmail: string | null = null;
        let fallbackName: string | null = null;
        try {
          const ls = JSON.parse(localStorage.getItem('checkout_customer_info') || 'null');
          fallbackEmail = ls?.email || null;
          fallbackName = ls?.name || null;
        } catch {}

        setPaymentDetails({
          paymentId: paymentId || order?.payment_id || payment?.id,
          externalReference: externalReference || order?.external_reference || payment?.externalReference,
          amount: order?.amount || order?.total || payment?.transactionAmount,
          orderNumber: order?.orderNumber || order?.external_reference || payment?.externalReference,
          customerEmail: emailFromOrder || fallbackEmail || undefined,
          customerName: nameFromOrder || fallbackName || undefined
        });
      } else {
        setError('No se pudo verificar el pago');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error al verificar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brown-600 animate-spin mx-auto mb-4" />
          <p className="text-brown-800">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Error de Verificación</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Link 
              to="/payment-status" 
              className="btn-primary"
            >
              Verificar Estado del Pago
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-brown-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          <p className="text-lg text-brown-700">
            Gracias por tu compra{paymentDetails?.customerName ? `, ${paymentDetails.customerName}` : ''}.
          </p>
          <p className="text-lg text-brown-700">
            Tu orden ha sido confirmada y está siendo procesada
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 text-left">
            <p className="text-yellow-900">
              Enviaremos la confirmación a
              <span className="font-semibold"> {paymentDetails?.customerEmail || 'tu correo'} </span>.
              Revisa tu carpeta de SPAM/Correo no deseado y marca nuestro correo como seguro.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-brown-900 mb-6">Detalles de la Orden</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-brown-600 mb-1">Número de Orden</p>
              <p className="font-semibold text-brown-900">{paymentDetails?.orderNumber}</p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">ID de Pago</p>
              <p className="font-semibold text-brown-900">{paymentDetails?.paymentId}</p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Total Pagado</p>
              <p className="font-semibold text-brown-900 text-lg">
                {paymentDetails?.amount ? formatPrice(paymentDetails.amount) : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Email</p>
              <p className="font-semibold text-brown-900 break-all">{paymentDetails?.customerEmail || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Estado</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Confirmado
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Próximos Pasos</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">Confirmación por Email</p>
                <p className="text-sm text-blue-700">
                  Recibirás un email de confirmación en los próximos minutos
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Procesamiento</p>
                <p className="text-sm text-blue-700">
                  Tu orden será procesada en 1-2 días hábiles
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-blue-900">Contacto</p>
                <p className="text-sm text-blue-700">
                  Te contactaremos para coordinar la entrega
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-brown-900 mb-4">¿Necesitas Ayuda?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-brown-600" />
              <div>
                <p className="font-medium text-brown-900">Teléfono</p>
                <p className="text-sm text-brown-600">+57 300 123 4567</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-brown-600" />
              <div>
                <p className="font-medium text-brown-900">Email</p>
                <p className="text-sm text-brown-600">info@casapinon.co</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-brown-600" />
              <div>
                <p className="font-medium text-brown-900">Ubicación</p>
                <p className="text-sm text-brown-600">Medellín, Antioquia, Colombia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/productos" 
            className="btn-secondary flex-1 text-center"
          >
            Seguir Comprando
          </Link>
          
          <Link 
            to="/contacto" 
            className="btn-primary flex-1 text-center"
          >
            Contactar Soporte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 