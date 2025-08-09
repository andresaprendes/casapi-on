import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

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
  const [verification, setVerification] = useState<PaymentVerification>({
    isVerified: false,
    isApproved: false,
    isPending: false,
    isRejected: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    const verifyPayment = async () => {
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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/mercadopago/payment-status/${paymentId}`);
        const result = await response.json();

        if (result.success) {
          setVerification({
            isVerified: true,
            isApproved: result.verification.is_approved,
            isPending: result.verification.is_pending,
            isRejected: result.verification.is_rejected,
            paymentDetails: result.payment,
            message: result.verification.message
          });
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
                ¡Pago Exitoso!
              </h1>
              <p className="text-brown-800 mb-4">
                {verification.message}
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
                Pago No Completado
              </h1>
              <p className="text-brown-800 mb-4">
                {verification.error || verification.message || 'El pago no pudo ser procesado'}
              </p>
              <p className="text-sm text-brown-600">
                Puedes intentar realizar el pago nuevamente.
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