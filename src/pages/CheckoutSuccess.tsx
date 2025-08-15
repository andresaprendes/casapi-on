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
  const [retryCount, setRetryCount] = useState(0);

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

  // Auto-verify payment status when component mounts
  useEffect(() => {
    if (paymentId || externalReference) {
      // Always verify directly with MercadoPago
      verifyPayment(0);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = async (retryCount = 0) => {
    // Always verify payment with MercadoPago API for security
    if (!paymentId && !externalReference) {
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

    setIsLoading(true);
    setRetryCount(retryCount);
    setVerification({
      isVerified: false,
      isApproved: false,
      isPending: false,
      isRejected: false
    });

    try {
      // Always verify directly with MercadoPago first
      console.log('🔍 Verifying payment directly with MercadoPago for:', paymentId || externalReference);
      const manualResult = await handleManualVerification();
      
      if (manualResult && manualResult.success) {
        console.log('✅ MercadoPago verification successful:', manualResult.data);
        
        // Use the MercadoPago status directly
        const mpStatus = manualResult.data.paymentStatus;
        const orderStatus = manualResult.data.orderStatus;
        
        console.log('🔍 MercadoPago status:', mpStatus, 'Order status:', orderStatus);
        console.log('🔍 Full manual result data:', manualResult.data);
        
        // Determine the final status based on MercadoPago response
        const isPaid = mpStatus === 'approved' || orderStatus === 'paid';
        const isPending = mpStatus === 'pending' || orderStatus === 'pending';
        const isFailed = mpStatus === 'rejected' || mpStatus === 'cancelled' || orderStatus === 'failed';
        
        console.log('🔍 Final status determination:', {
          isPaid,
          isPending,
          isFailed,
          mpStatus,
          orderStatus
        });
        
        // If MercadoPago says pending, keep retrying until we get a final status
        if (mpStatus === 'pending' && retryCount < 15) { // Increased max retries for pending status
          const delay = Math.min(3000 * Math.pow(1.5, retryCount), 45000); // Longer delays for pending status
          console.log(`🔄 Payment still pending on MercadoPago, retrying in ${delay/1000} seconds... (attempt ${retryCount + 1}/15)`);
          
          // Keep showing loading state while retrying
          setTimeout(() => verifyPayment(retryCount + 1), delay);
          return;
        }
        
        // Get order details for display
        const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
        const endpoint = externalReference 
          ? `${apiUrl}/api/orders/${externalReference}`
          : `${apiUrl}/api/mercadopago/payment/${paymentId}`;
        
        const response = await fetch(endpoint);
        const result = await response.json();
        
        const orderDetails = result.success ? (result.order || result.payment) : null;
        
        // Create a clear status message - never show pending as final result
        let statusMessage = '';
        if (mpStatus === 'approved') {
          statusMessage = 'Pago Aprobado';
        } else if (mpStatus === 'rejected') {
          statusMessage = 'Pago Rechazado';
        } else if (mpStatus === 'cancelled') {
          statusMessage = 'Pago Cancelado';
        } else if (mpStatus === 'pending') {
          // If we reach here, it means we've exhausted retries for pending status
          statusMessage = 'Verificación en Progreso - Contacta Soporte';
        } else {
          statusMessage = `Estado: ${mpStatus}`;
        }
        
        setVerification({
          isVerified: true,
          isApproved: isPaid,
          isPending: false, // Never show pending as final result
          isRejected: isFailed,
          paymentDetails: orderDetails,
          message: statusMessage
        });
      } else {
        // If MercadoPago verification failed, retry with exponential backoff
        const maxRetries = 10; // Increased retries for persistence
        const baseDelay = 2000; // Start with 2 seconds
        const maxDelay = 30000; // Max 30 seconds between retries
        
        if (retryCount < maxRetries) {
          const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
          console.log(`🔄 MercadoPago verification failed, retrying in ${delay/1000} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Keep showing loading state while retrying
          setTimeout(() => verifyPayment(retryCount + 1), delay);
          return;
        } else {
          // After max retries, try database check as final fallback
          console.log('⚠️ Max retries reached, trying database check as fallback...');
          const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
          const endpoint = externalReference 
            ? `${apiUrl}/api/orders/${externalReference}`
            : `${apiUrl}/api/mercadopago/payment/${paymentId}`;
          
          const response = await fetch(endpoint);
          const result = await response.json();
          
          if (result.success && (result.order || result.payment)) {
            const order = result.order || result.payment;
            
            const isPaid = order.paymentStatus === 'paid' || 
                          order.paymentStatus === 'approved' ||
                          order.status === 'paid' ||
                          order.status === 'approved';
            
            const isPending = order.paymentStatus === 'pending' || 
                             order.status === 'pending';
            
            const isFailed = order.paymentStatus === 'failed' || 
                            order.paymentStatus === 'rejected' ||
                            order.status === 'failed' ||
                            order.status === 'rejected';

            setVerification({
              isVerified: true,
              isApproved: isPaid,
              isPending: false, // Never show pending as final result
              isRejected: isFailed || isPending, // If database shows pending, treat as failed
              paymentDetails: order,
              message: isPending ? 
                'Verificación en Progreso - Contacta Soporte' : 
                `Estado del pedido: ${order.paymentStatus || order.status} (verificación de base de datos)`
            });
          } else {
            setVerification({
              isVerified: false,
              isApproved: false,
              isPending: false,
              isRejected: true,
              error: manualResult?.error || 'No se pudo verificar el estado del pago después de múltiples intentos'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // If there's a connection error, retry with exponential backoff
      const maxRetries = 5;
      const baseDelay = 3000;
      
      if (retryCount < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, retryCount), 15000);
        console.log(`🔄 Connection error, retrying in ${delay/1000} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
        
        setTimeout(() => verifyPayment(retryCount + 1), delay);
        return;
      } else {
        setVerification({
          isVerified: false,
          isApproved: false,
          isPending: false,
          isRejected: true,
          error: 'Error de conexión al verificar el pago después de múltiples intentos'
        });
      }
    } finally {
      // Only stop loading if we have a final result
      if (verification.isVerified || verification.error) {
        setIsLoading(false);
      }
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

  const handleManualVerification = async (): Promise<any> => {
    if (!paymentId && !externalReference) {
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'No se encontró información del pago'
      });
      return { success: false, error: 'No payment information found' };
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = paymentId 
        ? `${apiUrl}/api/mercadopago/verify-payment-by-id/${paymentId}`
        : `${apiUrl}/api/mercadopago/verify-payment/${externalReference}`;
      
      console.log('🔍 Manual payment verification:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      console.log('🔍 Manual verification result:', result);

      if (result.success) {
        return { success: true, data: result };
      } else {
        setVerification({
          isVerified: false,
          isApproved: false,
          isPending: false,
          isRejected: true,
          error: result.error || 'Error en la verificación manual del pago'
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error in manual verification:', error);
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'Error de conexión en la verificación manual'
      });
      return { success: false, error: 'Connection error' };
    }
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