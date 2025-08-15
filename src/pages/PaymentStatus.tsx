import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, Search } from 'lucide-react';

interface PaymentVerification {
  isVerified: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  paymentDetails?: any;
  message?: string;
  error?: string;
}

const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verification, setVerification] = useState<PaymentVerification>({
    isVerified: false,
    isApproved: false,
    isPending: false,
    isRejected: false
  });
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || searchParams.get('external_reference') || '');

  // Auto-verify payment status when component mounts
  useEffect(() => {
    if (orderNumber) {
      // First try regular verification
      verifyPayment(0);
    } else {
      // If no order number, check for MercadoPago parameters
      const paymentId = searchParams.get('payment_id');
      const status = searchParams.get('status');
      const externalReference = searchParams.get('external_reference');
      
      if (paymentId || externalReference) {
        console.log('🔍 Found MercadoPago parameters:', { paymentId, status, externalReference });
        if (externalReference) {
          setOrderNumber(externalReference);
          verifyPayment(0);
        } else if (paymentId) {
          // Try to find order by payment ID
          verifyPaymentByPaymentId(paymentId);
        }
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const verifyPayment = async (retryCount = 0) => {
    if (!orderNumber) {
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'Por favor ingresa el número de orden'
      });
      return;
    }

    setIsLoading(true);
    setVerification({
      isVerified: false,
      isApproved: false,
      isPending: false,
      isRejected: false
    });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = `${apiUrl}/api/orders/${orderNumber}`;
      
      console.log('🔍 Checking payment status:', endpoint);
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      console.log('🔍 Payment status result:', result);

      if (result.success && result.order) {
        const order = result.order;
        console.log('🔍 Order details:', {
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          paymentId: order.paymentId,
          status: order.status
        });

        // Check multiple possible payment status fields
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

        console.log('🔍 Payment status analysis:', {
          isPaid,
          isPending,
          isFailed,
          originalPaymentStatus: order.paymentStatus,
          originalStatus: order.status
        });

        // If status is pending and this is the first verification attempt, try manual verification
        if (isPending && retryCount === 0) {
          console.log('🔄 Status is pending, trying manual verification with MercadoPago...');
          try {
            const manualResult = await handleManualVerification();
            if (manualResult && manualResult.success) {
              // Manual verification succeeded, re-verify after a short delay
              setTimeout(() => verifyPayment(retryCount + 1), 1000);
              return;
            }
          } catch (manualError) {
            console.log('Manual verification failed, continuing with current status');
          }
        }

        setVerification({
          isVerified: true,
          isApproved: isPaid,
          isPending: isPending,
          isRejected: isFailed,
          paymentDetails: order,
          message: `Estado del pedido: ${order.paymentStatus || order.status}`
        });
      } else {
        // If payment not found and we haven't exceeded retries, try again
        const maxRetries = 3;
        const retryDelay = 2000;
        
        if (retryCount < maxRetries && result.error?.includes('not found')) {
          console.log(`🔄 Payment not found, retrying in ${retryDelay/1000} seconds... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => verifyPayment(retryCount + 1), retryDelay);
          return;
        }
        
        setVerification({
          isVerified: false,
          isApproved: false,
          isPending: true,
          isRejected: false,
          message: 'El pago está siendo procesado o no se encontró información.',
          error: result.error || 'No se pudo verificar el estado del pago'
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

  const verifyPaymentByPaymentId = async (paymentId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = `${apiUrl}/api/mercadopago/payment/${paymentId}`;
      
      console.log('🔍 Checking payment by ID:', endpoint);
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (result.success && result.payment) {
        const payment = result.payment;
        const orderNumber = payment.external_reference;
        setOrderNumber(orderNumber);
        
        // Now verify the order
        verifyPayment(0);
      } else {
        setVerification({
          isVerified: false,
          isApproved: false,
          isPending: false,
          isRejected: true,
          error: 'No se encontró información del pago'
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error verifying payment by ID:', error);
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'Error al verificar el pago'
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPayment(0);
  };

  const handleManualVerification = async (): Promise<any> => {
    if (!orderNumber) {
      setVerification({
        isVerified: false,
        isApproved: false,
        isPending: false,
        isRejected: true,
        error: 'Por favor ingresa el número de orden'
      });
      return { success: false, error: 'No order number provided' };
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = `${apiUrl}/api/mercadopago/verify-payment/${orderNumber}`;
      
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


  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <Search className="w-12 h-12 text-brown-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brown-900 mb-2">
            Verificar Estado del Pago
          </h1>
          <p className="text-brown-600">
            Ingresa tu número de orden para verificar el estado
          </p>
        </div>

        {/* Search Form - Only show if no order number from URL */}
        {!searchParams.get('order') && !searchParams.get('external_reference') && !searchParams.get('payment_id') && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Orden
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ej: ORD-1755216698839-VD3AQXWY4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !orderNumber}
                className="w-full bg-brown-900 text-white py-3 px-6 rounded-lg hover:bg-brown-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verificar Estado</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Loading State - Show when auto-verifying */}
        {isLoading && (searchParams.get('order') || searchParams.get('external_reference') || searchParams.get('payment_id')) && (
          <div className="mb-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brown-600 mx-auto mb-4" />
            <p className="text-brown-600">Verificando el estado de tu pago...</p>
          </div>
        )}

        {/* Results */}
        {verification.isVerified && (
          <div className="border-t pt-6">
            {verification.isApproved && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-green-900 mb-2">
                  ¡Pago Confirmado!
                </h2>
                <p className="text-green-800 mb-4">
                  Tu pago ha sido procesado exitosamente.
                </p>
                {verification.paymentDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-green-800 space-y-1">
                      <div><strong>Orden:</strong> {verification.paymentDetails.external_reference || verification.paymentDetails.orderNumber}</div>
                      <div><strong>Monto:</strong> {formatPrice(verification.paymentDetails.transaction_amount || verification.paymentDetails.total)}</div>
                      <div><strong>ID Pago:</strong> {verification.paymentDetails.id}</div>
                      <div><strong>Método:</strong> {verification.paymentDetails.payment_method_id || verification.paymentDetails.paymentMethod}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {verification.isPending && (
              <div className="text-center">
                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-yellow-900 mb-2">
                  Pago Pendiente
                </h2>
                <p className="text-yellow-800 mb-4">
                  {verification.message}
                </p>
              </div>
            )}

            {verification.isRejected && (
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900 mb-2">
                  Pago No Completado
                </h2>
                <p className="text-red-800 mb-4">
                  {verification.error || verification.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {verification.error && !verification.isVerified && (
          <div className="border-t pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Error de Verificación
              </h2>
              <p className="text-red-800 mb-4">
                {verification.error}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t pt-6 space-y-3">
          <Link
            to="/"
            className="block w-full bg-brown-900 text-white py-3 px-6 rounded-lg hover:bg-brown-800 transition-colors text-center"
          >
            Volver al Inicio
          </Link>
          
          <Link
            to="/checkout"
            className="block w-full border border-brown-900 text-brown-900 py-3 px-6 rounded-lg hover:bg-brown-50 transition-colors text-center"
          >
            Realizar Nuevo Pago
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
