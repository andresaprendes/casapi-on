import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentVerification {
  isVerified: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  paymentDetails?: any;
  message?: string;
  error?: string;
}

const PaymentStatusWidget = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    setVerification(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = `${apiUrl}/api/orders/${orderNumber}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        // Order endpoint
        setVerification({
          isVerified: true,
          isApproved: result.order.paymentStatus === 'paid',
          isPending: result.order.paymentStatus === 'pending',
          isRejected: result.order.paymentStatus === 'failed',
          paymentDetails: result.order,
          message: `Estado del pedido: ${result.order.paymentStatus}`
        });
      } else {
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

  const getStatusIcon = () => {
    if (!verification) return null;
    
    if (verification.isApproved) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    } else if (verification.isPending) {
      return <Clock className="w-8 h-8 text-yellow-500" />;
    } else if (verification.isRejected) {
      return <XCircle className="w-8 h-8 text-red-500" />;
    } else {
      return <AlertCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!verification) return '';
    
    if (verification.isApproved) {
      return 'Pago Aprobado';
    } else if (verification.isPending) {
      return 'Pago Pendiente';
    } else if (verification.isRejected) {
      return 'Pago Rechazado';
    } else {
      return 'Estado Desconocido';
    }
  };

  const getStatusColor = () => {
    if (!verification) return 'text-gray-600';
    
    if (verification.isApproved) {
      return 'text-green-600';
    } else if (verification.isPending) {
      return 'text-yellow-600';
    } else if (verification.isRejected) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  };

  return (
    <section className="bg-cream-50 py-16">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
                      <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-brown-900 mb-4">
                Verificar Estado del Pago
              </h2>
              <p className="text-brown-600">
                Ingresa tu número de orden para verificar el estado actual
              </p>
            </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={verifyPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-brown-700 mb-2">
                  Número de Orden
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ej: ORD-1755216698839-VD3AQXWY4"
                  className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brown-600 text-white py-3 px-6 rounded-lg hover:bg-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Verificar Estado</span>
                  </>
                )}
              </button>
            </form>

            {/* Results */}
            {verification && (
              <div className="mt-8 p-6 border rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon()}
                  <div>
                    <h3 className={`text-xl font-semibold ${getStatusColor()}`}>
                      {getStatusText()}
                    </h3>
                    {verification.message && (
                      <p className="text-brown-600 text-sm">{verification.message}</p>
                    )}
                  </div>
                </div>

                {verification.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{verification.error}</p>
                  </div>
                )}

                {verification.paymentDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-brown-900 mb-2">Detalles:</h4>
                    <div className="text-sm text-brown-600 space-y-1">
                      {verification.paymentDetails.orderNumber && (
                        <p><strong>Orden:</strong> {verification.paymentDetails.orderNumber}</p>
                      )}
                      {verification.paymentDetails.id && (
                        <p><strong>ID de Pago:</strong> {verification.paymentDetails.id}</p>
                      )}
                      {verification.paymentDetails.total && (
                        <p><strong>Total:</strong> ${new Intl.NumberFormat('es-CO').format(verification.paymentDetails.total)}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Link
                    to="/payment-status"
                    className="text-brown-600 hover:text-brown-800 text-sm underline"
                  >
                    Ver página completa de verificación →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentStatusWidget;
