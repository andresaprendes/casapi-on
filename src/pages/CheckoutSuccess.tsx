import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useCart } from '../store/CartContext';

interface PaymentVerification {
  isVerified: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  paymentDetails?: any;
  message?: string;
  error?: string;
}

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [verification, setVerification] = useState<PaymentVerification>({
    isVerified: false,
    isApproved: false,
    isPending: false,
    isRejected: false
  });
  const [isLoading, setIsLoading] = useState(true);


  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const status = searchParams.get('status');
  
  // Debug logging
  console.log('🔍 CheckoutSuccess Debug:', {
    paymentId,
    externalReference,
    status,
    searchParams: Object.fromEntries(searchParams.entries()),
    fullUrl: window.location.href
  });

  // Listen for webhook notifications (if implemented)
  useEffect(() => {
    if (paymentId) {
      // Set up EventSource for real-time webhook notifications
      const eventSource = new EventSource(`/api/mercadopago/payment-events/${paymentId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.paymentId === paymentId) {
          console.log('🔔 Webhook notification received:', data);
          // Re-verify payment immediately
          verifyPayment(0);
        }
      };
      
      eventSource.onerror = (error) => {
        console.log('EventSource error:', error);
        eventSource.close();
      };
      
      return () => {
        eventSource.close();
      };
    }
  }, [paymentId]);

  const verifyPayment = async (retryCount = 0) => {
    // Always verify payment with MercadoPago API for security
    if (!paymentId) {
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'No se encontró información del pago'
      });
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      console.log('🔍 Calling payment verification API:', `${apiUrl}/api/mercadopago/payment-status/${paymentId}`);
      
      const response = await fetch(`${apiUrl}/api/mercadopago/payment-status/${paymentId}`);
      const result = await response.json();
      
      console.log('🔍 Payment verification result:', result);

      if (result.success) {
        console.log('✅ Payment verification successful:', {
          is_approved: result.verification.is_approved,
          is_pending: result.verification.is_pending,
          is_rejected: result.verification.is_rejected,
          message: result.verification.message
        });
        
        setVerification({
          isVerified: true,
          isApproved: result.verification.is_approved,
          isPending: result.verification.is_pending,
          isRejected: result.verification.is_rejected,
          paymentDetails: result.payment,
          message: result.verification.message
        });
        
                  // Order is already created before payment, just clear cart if approved
          if (result.verification.is_approved) {
            clearCart();
            localStorage.removeItem('checkout_customer_info');
          }
          
          // Save payment info to localStorage for later checking
          if (paymentId && externalReference) {
            localStorage.setItem('last_payment_info', JSON.stringify({
              paymentId,
              externalReference,
              timestamp: new Date().toISOString(),
              status: result.verification.is_approved ? 'approved' : 
                     result.verification.is_pending ? 'pending' : 'rejected'
            }));
          }
              } else {
          // If payment not found and we haven't exceeded retries, try again
          // For PSE payments, retry more times with longer intervals
          const maxRetries = verification.paymentDetails?.payment_method_id === 'pse' ? 10 : 3;
          const retryDelay = verification.paymentDetails?.payment_method_id === 'pse' ? 5000 : 2000;
          
          if (retryCount < maxRetries && result.error?.includes('not found')) {
            console.log(`🔄 Payment not found, retrying in ${retryDelay/1000} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => verifyPayment(retryCount + 1), retryDelay);
            return;
          }
          
          // After all retries failed, show pending instead of rejected
          // The payment might be successful but webhook delayed
          setVerification({
            isVerified: false,
            isApproved: false,
            isPending: true,
            isRejected: false,
            message: 'El pago está siendo procesado. Te notificaremos cuando se confirme.',
            error: 'No se pudo verificar el estado del pago inmediatamente'
          });
        }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'Error de conexión al verificar el pago'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyPayment(0);
  }, [paymentId]);

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
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-brown-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-bold text-brown-900 mb-2">
            Verificando Pago...
          </h1>
          <p className="text-brown-800">
            Estamos confirmando el estado de tu pago con MercadoPago.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {verification.isApproved && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-brown-900 mb-2">
                ¡Orden Confirmada!
              </h1>
              <p className="text-brown-800 mb-4">
                Tu pago ha sido procesado exitosamente y tu orden ha sido confirmada.
              </p>
              {verification.paymentDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-green-800 space-y-1">
                    <div><strong>Orden:</strong> {externalReference}</div>
                    <div><strong>Monto:</strong> {formatPrice(verification.paymentDetails.transaction_amount)}</div>
                    <div><strong>ID Pago:</strong> {verification.paymentDetails.id}</div>
                    <div><strong>Método:</strong> {verification.paymentDetails.payment_method_id}</div>
                  </div>
                </div>
              )}
              <p className="text-sm text-brown-600">
                Gracias por tu compra. Nos pondremos en contacto contigo pronto para coordinar la entrega.
              </p>
            </>
          )}

          {verification.isPending && (
            <>
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-brown-900 mb-2">
                Pago Pendiente
              </h1>
              <p className="text-brown-800 mb-4">
                {verification.message}
              </p>
              
              {/* Show additional info if verification failed */}
              {verification.error && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Información Adicional</h4>
                  <p className="text-sm text-blue-700">
                    {verification.error}
                  </p>
                </div>
              )}
              
              {/* PSE Specific Instructions */}
              {verification.paymentDetails?.payment_method_id === 'pse' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Pago PSE en Proceso</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Tu banco está procesando el pago</li>
                    <li>• El proceso puede tomar hasta 15 minutos</li>
                    <li>• Recibirás confirmación por email</li>
                    <li>• Puedes cerrar esta ventana</li>
                  </ul>
                </div>
              )}
              
              <p className="text-sm text-brown-600">
                Tu pago está siendo procesado. Te notificaremos cuando se confirme.
              </p>
            </>
          )}

          {verification.isRejected && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-brown-900 mb-2">
                Orden No Completada
              </h1>
              <p className="text-brown-800 mb-4">
                {verification.error || verification.message || 'El pago no pudo ser procesado y tu orden no ha sido confirmada.'}
              </p>
              <p className="text-sm text-brown-600">
                Puedes intentar realizar el pago nuevamente desde tu carrito.
              </p>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-brown-900 text-white py-3 px-6 rounded-lg hover:bg-brown-800 transition-colors"
          >
            Volver al Inicio
          </Link>
          
          {verification.isRejected && (
            <Link
              to="/checkout"
              className="block w-full border border-brown-900 text-brown-900 py-3 px-6 rounded-lg hover:bg-brown-50 transition-colors"
            >
              Intentar Nuevamente
            </Link>
          )}
          
          <Link
            to="/productos"
            className="block w-full border border-brown-900 text-brown-900 py-3 px-6 rounded-lg hover:bg-brown-50 transition-colors"
          >
            Ver Más Productos
          </Link>
          
          {/* Payment Status Checker */}
          {paymentId && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">¿Necesitas verificar tu pago más tarde?</h4>
              <p className="text-xs text-gray-600 mb-3">
                Guarda este enlace o usa el verificador de pagos:
              </p>
              <div className="bg-white border border-gray-300 rounded p-2 mb-3">
                <code className="text-xs text-gray-700 break-all">
                  {window.location.href}
                </code>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Copiar Enlace
                </button>
                <Link
                  to={`/payment-status?payment_id=${paymentId}`}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Verificar Estado
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 