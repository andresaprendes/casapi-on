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
    searchParams: Object.fromEntries(searchParams.entries())
  });

  useEffect(() => {
    const verifyPayment = async () => {
      // If we have a status parameter, use it directly
      if (status) {
        if (status === 'success') {
          setVerification({
            isVerified: true,
            isApproved: true,
            isPending: false,
            isRejected: false,
            message: 'Pago exitoso'
          });
          clearCart();
          localStorage.removeItem('checkout_customer_info');
        } else if (status === 'failure') {
          setVerification({
            isVerified: true,
            isApproved: false,
            isPending: false,
            isRejected: true,
            error: 'El pago fue rechazado'
          });
        } else if (status === 'pending') {
          setVerification({
            isVerified: true,
            isApproved: false,
            isPending: true,
            isRejected: false,
            message: 'Pago pendiente'
          });
        }
        setIsLoading(false);
        return;
      }

      // Fallback to payment verification if no status parameter
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
        } else {
          setVerification({
            isVerified: false,
            isApproved: false,
            isPending: false,
            isRejected: true,
            error: result.error || 'Error al verificar el pago'
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

    verifyPayment();
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
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 