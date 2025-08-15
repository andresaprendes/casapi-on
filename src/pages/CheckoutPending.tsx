import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, RefreshCw, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';

interface PendingDetails {
  paymentId?: string;
  externalReference?: string;
  amount?: number;
  orderNumber?: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: string;
  estimatedTime?: string;
}

const CheckoutPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDetails, setPendingDetails] = useState<PendingDetails | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'checking'>('pending');
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const status = searchParams.get('status');

  useEffect(() => {
    getPendingDetails();
    // Start periodic verification
    const interval = setInterval(verifyPaymentStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPendingDetails = async () => {
    if (!paymentId && !externalReference) {
      setError('No se encontró información del pago');
      setIsLoading(false);
      return;
    }

    try {
      // Get payment details from API
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = externalReference 
        ? `${apiUrl}/api/orders/${externalReference}`
        : `${apiUrl}/api/mercadopago/payment/${paymentId}`;
      
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        const orderData = result.order || result.payment;
        const paymentMethod = orderData?.payment_method_id || 'unknown';
        
        setPendingDetails({
          paymentId: paymentId || orderData?.payment_id,
          externalReference: externalReference || orderData?.external_reference,
          amount: orderData?.amount || orderData?.total,
          orderNumber: orderData?.orderNumber || orderData?.external_reference,
          customerEmail: orderData?.customerEmail,
          customerName: orderData?.customerName,
          paymentMethod,
          estimatedTime: getEstimatedTime(paymentMethod)
        });
      } else {
        setError('No se pudo obtener los detalles del pago');
      }
    } catch (error) {
      console.error('Error getting pending details:', error);
      setError('Error de conexión al obtener los detalles');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPaymentStatus = async () => {
    if (!paymentId && !externalReference) return;

    setVerificationStatus('checking');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      const endpoint = externalReference 
        ? `${apiUrl}/api/mercadopago/verify-payment/${externalReference}`
        : `${apiUrl}/api/mercadopago/verify-payment-by-id/${paymentId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        const paymentStatus = result.paymentStatus || result.status;
        if (paymentStatus === 'approved') {
          setVerificationStatus('approved');
          // Redirect to success page after 3 seconds
          setTimeout(() => {
            window.location.href = `/checkout/success?payment_id=${paymentId}&external_reference=${externalReference}`;
          }, 3000);
        } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
          setVerificationStatus('rejected');
          // Redirect to failure page after 3 seconds
          setTimeout(() => {
            window.location.href = `/checkout/failure?payment_id=${paymentId}&external_reference=${externalReference}&error=${paymentStatus}`;
          }, 3000);
        } else {
          setVerificationStatus('pending');
        }
      }
    } catch (error) {
      console.error('Error verifying payment status:', error);
      setVerificationStatus('pending');
    }
  };

  const getEstimatedTime = (paymentMethod: string): string => {
    const timeEstimates: { [key: string]: string } = {
      'pse': '15-30 minutos',
      'efecty': '2-4 horas',
      'baloto': '2-4 horas',
      'nequi': '5-10 minutos',
      'daviplata': '5-10 minutos',
      'credit_card': '5-10 minutos',
      'debit_card': '5-10 minutos',
      'unknown': '15-30 minutos'
    };
    
    return timeEstimates[paymentMethod] || timeEstimates.unknown;
  };

  const getPaymentMethodName = (paymentMethod: string): string => {
    const methodNames: { [key: string]: string } = {
      'pse': 'PSE (Pagos Seguros en Línea)',
      'efecty': 'Efecty',
      'baloto': 'Baloto',
      'nequi': 'Nequi',
      'daviplata': 'DaviPlata',
      'credit_card': 'Tarjeta de Crédito',
      'debit_card': 'Tarjeta de Débito',
      'unknown': 'Método de Pago'
    };
    
    return methodNames[paymentMethod] || methodNames.unknown;
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
          <p className="text-brown-800">Cargando información del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
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
        {/* Status Header */}
        <div className="text-center mb-8">
          {verificationStatus === 'checking' ? (
            <Loader2 className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-spin" />
          ) : verificationStatus === 'approved' ? (
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          ) : verificationStatus === 'rejected' ? (
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          ) : (
            <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          )}
          
          <h1 className="text-3xl font-bold text-brown-900 mb-4">
            {verificationStatus === 'checking' && 'Verificando Pago...'}
            {verificationStatus === 'approved' && '¡Pago Aprobado!'}
            {verificationStatus === 'rejected' && 'Pago Rechazado'}
            {verificationStatus === 'pending' && 'Pago en Proceso'}
          </h1>
          
          <p className="text-lg text-brown-700">
            {verificationStatus === 'checking' && 'Verificando el estado de tu pago...'}
            {verificationStatus === 'approved' && 'Tu pago ha sido confirmado. Redirigiendo...'}
            {verificationStatus === 'rejected' && 'El pago no pudo ser procesado. Redirigiendo...'}
            {verificationStatus === 'pending' && 'Tu pago está siendo procesado por el banco'}
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-brown-900 mb-6">Detalles del Pago</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-brown-600 mb-1">Número de Orden</p>
              <p className="font-semibold text-brown-900">{pendingDetails?.orderNumber}</p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">ID de Pago</p>
              <p className="font-semibold text-brown-900">{pendingDetails?.paymentId}</p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Monto</p>
              <p className="font-semibold text-brown-900 text-lg">
                {pendingDetails?.amount ? formatPrice(pendingDetails.amount) : 'N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Método de Pago</p>
              <p className="font-semibold text-brown-900">
                {pendingDetails?.paymentMethod ? getPaymentMethodName(pendingDetails.paymentMethod) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Processing Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Información del Proceso</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-blue-900">Pago Enviado</p>
                <p className="text-sm text-blue-700">
                  Tu pago ha sido enviado al banco para procesamiento
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-blue-900">Procesamiento Bancario</p>
                <p className="text-sm text-blue-700">
                  El banco está procesando tu pago (puede tomar {pendingDetails?.estimatedTime})
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-blue-900">Confirmación</p>
                <p className="text-sm text-blue-700">
                  Recibirás confirmación automática cuando se complete
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PSE Specific Instructions */}
        {pendingDetails?.paymentMethod === 'pse' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">Pago PSE en Proceso</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• Tu banco está procesando el pago PSE</p>
              <p>• El proceso puede tomar entre 15-30 minutos</p>
              <p>• No cierres esta ventana hasta recibir confirmación</p>
              <p>• Recibirás un email cuando se complete el pago</p>
            </div>
          </div>
        )}

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
                <p className="text-sm text-brown-600">info@casapinon.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={verifyPaymentStatus}
            disabled={verificationStatus === 'checking'}
            className="btn-primary flex-1 text-center flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${verificationStatus === 'checking' ? 'animate-spin' : ''}`} />
            Verificar Estado
          </button>
          
          <Link 
            to="/payment-status" 
            className="btn-secondary flex-1 text-center"
          >
            Verificar Más Tarde
          </Link>
        </div>

        {/* Auto-refresh Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-brown-600">
            Esta página se actualiza automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPending;
