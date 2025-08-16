import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, CreditCard, Phone, Mail, Loader2 } from 'lucide-react';

interface FailureDetails {
  paymentId?: string;
  externalReference?: string;
  errorCode?: string;
  errorMessage?: string;
  amount?: number;
  orderNumber?: string;
}

const CheckoutFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [failureDetails, setFailureDetails] = useState<FailureDetails | null>(null);

  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');
  const errorCode = searchParams.get('error');

  useEffect(() => {
    getFailureDetails();
  }, []);

  const getFailureDetails = async () => {
    if (!paymentId && !externalReference) {
      // Check if this is a user cancellation (no payment attempt made)
      const isUserCancellation = errorCode === 'unknown' || !errorCode;
      
      setFailureDetails({
        errorCode: isUserCancellation ? 'user_cancelled' : (errorCode || 'unknown'),
        errorMessage: getErrorMessage(isUserCancellation ? 'user_cancelled' : (errorCode || 'unknown'))
      });
      
      // If this is a user cancellation, trigger the cancellation email
      if (isUserCancellation && externalReference) {
        triggerCancellationEmail(externalReference);
      }
      
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
        
        // Determine if this was a user cancellation
        let finalErrorCode = errorCode || orderData?.error_code || 'payment_failed';
        let finalErrorMessage = getErrorMessage(finalErrorCode);
        
        // IMPROVED: Better detection of user cancellations
        // If no payment ID and no specific error code, this is likely a user cancellation
        if (!paymentId && !orderData?.payment_id && (!errorCode || errorCode === 'unknown')) {
          finalErrorCode = 'user_cancelled';
          finalErrorMessage = getErrorMessage('user_cancelled');
          
          // Trigger cancellation email immediately
          if (externalReference || orderData?.external_reference) {
            const orderNumber = externalReference || orderData?.external_reference;
            console.log('🚫 Detected user cancellation, triggering email for order:', orderNumber);
            triggerCancellationEmail(orderNumber);
          }
        }
        
        setFailureDetails({
          paymentId: paymentId || orderData?.payment_id,
          externalReference: externalReference || orderData?.external_reference,
          errorCode: finalErrorCode,
          errorMessage: finalErrorMessage,
          amount: orderData?.amount || orderData?.total,
          orderNumber: orderData?.orderNumber || orderData?.external_reference
        });
      } else {
        // If API call fails, assume user cancellation if no payment ID
        const isUserCancellation = !paymentId;
        const finalErrorCode = isUserCancellation ? 'user_cancelled' : 'verification_failed';
        
        setFailureDetails({
          paymentId: paymentId || undefined,
          externalReference: externalReference || undefined,
          errorCode: finalErrorCode,
          errorMessage: getErrorMessage(finalErrorCode)
        });
        
        // Trigger cancellation email if this is a user cancellation
        if (isUserCancellation && externalReference) {
          console.log('🚫 API call failed, but detected user cancellation for order:', externalReference);
          triggerCancellationEmail(externalReference);
        }
      }
    } catch (error) {
      console.error('Error getting failure details:', error);
      
      // If connection fails, assume user cancellation if no payment ID
      const isUserCancellation = !paymentId;
      const finalErrorCode = isUserCancellation ? 'user_cancelled' : 'connection_error';
      
      setFailureDetails({
        paymentId: paymentId || undefined,
        externalReference: externalReference || undefined,
        errorCode: finalErrorCode,
        errorMessage: getErrorMessage(finalErrorCode)
      });
      
      // Trigger cancellation email if this is a user cancellation
      if (isUserCancellation && externalReference) {
        console.log('🚫 Connection failed, but detected user cancellation for order:', externalReference);
        triggerCancellationEmail(externalReference);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger cancellation email when user cancels payment
  const triggerCancellationEmail = async (orderNumber: string) => {
    console.log('📧 Starting cancellation email process for order:', orderNumber);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://casa-pinon-backend-production.up.railway.app';
      console.log('🌐 Using API URL:', apiUrl);
      
      // Get order details to extract customer info
      console.log('🔍 Fetching order details from:', `${apiUrl}/api/orders/${orderNumber}`);
      const orderResponse = await fetch(`${apiUrl}/api/orders/${orderNumber}`);
      const orderResult = await orderResponse.json();
      
      if (orderResult.success && orderResult.order) {
        const order = orderResult.order;
        
        // Prepare customer info for the email
        const customerInfo = {
          name: order.customer?.name || 'Cliente',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          address: order.customer?.address || {}
        };
        
        // Call the cancellation endpoint to send email
        console.log('📤 Sending cancellation email request to:', `${apiUrl}/api/mercadopago/payment-cancelled`);
        console.log('📋 Request payload:', { orderNumber, customerInfo, reason: 'user_cancelled' });
        
        const emailResponse = await fetch(`${apiUrl}/api/mercadopago/payment-cancelled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderNumber,
            customerInfo,
            reason: 'user_cancelled'
          })
        });
        
        console.log('📥 Email API response status:', emailResponse.status);
        const emailResult = await emailResponse.json();
        console.log('📥 Email API response:', emailResult);
        
        if (emailResult.success) {
          console.log('✅ Cancellation email triggered successfully');
        } else {
          console.error('❌ Failed to trigger cancellation email:', emailResult.error);
        }
      }
    } catch (error) {
      console.error('❌ Error triggering cancellation email:', error);
    }
  };

  const getErrorMessage = (code: string): string => {
    const errorMessages: { [key: string]: string } = {
      'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
      'cc_rejected_bad_filled_other': 'Información de la tarjeta incorrecta',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
      'cc_rejected_blacklist': 'Tarjeta rechazada por seguridad',
      'cc_rejected_call_for_authorize': 'Debes autorizar el pago',
      'cc_rejected_card_disabled': 'Tarjeta deshabilitada',
      'cc_rejected_card_error': 'Error en la tarjeta',
      'cc_rejected_duplicated_payment': 'Pago duplicado',
      'cc_rejected_high_risk': 'Pago rechazado por riesgo',
      'cc_rejected_insufficient_amount': 'Saldo insuficiente',
      'cc_rejected_invalid_installments': 'Cuotas no válidas',
      'cc_rejected_max_attempts': 'Máximo de intentos alcanzado',
      'cc_rejected_other_reason': 'Tarjeta rechazada',
      'pse_rejected_bad_filled_bank': 'Banco no válido',
      'pse_rejected_bad_filled_entity': 'Entidad bancaria no válida',
      'pse_rejected_bad_filled_person_type': 'Tipo de persona no válido',
      'pse_rejected_bad_filled_identification': 'Identificación incorrecta',
      'pse_rejected_insufficient_amount': 'Saldo insuficiente',
      'pse_rejected_other_reason': 'PSE rechazado',
      'payment_failed': 'El pago no pudo ser procesado',
      'payment_cancelled': 'El pago fue cancelado',
      'payment_pending': 'El pago está pendiente',
      'verification_failed': 'No se pudo verificar el pago',
      'connection_error': 'Error de conexión',
      'unknown': 'Error desconocido',
      // Add specific codes for user cancellations
      'user_cancelled': 'Has cancelado el proceso de pago',
      'return_to_site': 'Has regresado al sitio sin completar el pago',
      'abandoned_payment': 'El pago fue abandonado'
    };

    return errorMessages[code] || 'El pago no pudo ser procesado';
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
          <p className="text-brown-800">Verificando detalles del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Failure Header */}
        <div className="text-center mb-8">
          {failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site' ? (
            // User cancellation - different styling
            <>
              <div className="w-20 h-20 bg-gray-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚫</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pago Cancelado
              </h1>
              <p className="text-lg text-gray-700">
                {failureDetails?.errorMessage || 'Has cancelado el proceso de pago'}
              </p>
            </>
          ) : (
            // Genuine payment failure - original styling
            <>
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-brown-900 mb-4">
                Pago No Completado
              </h1>
              <p className="text-lg text-brown-700">
                {failureDetails?.errorMessage || 'El pago no pudo ser procesado'}
              </p>
            </>
          )}
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-brown-900 mb-6">Detalles del Error</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {failureDetails?.orderNumber && (
              <div>
                <p className="text-sm text-brown-600 mb-1">Número de Orden</p>
                <p className="font-semibold text-brown-900">{failureDetails.orderNumber}</p>
              </div>
            )}
            
            {failureDetails?.paymentId && (
              <div>
                <p className="text-sm text-brown-600 mb-1">ID de Pago</p>
                <p className="font-semibold text-brown-900">{failureDetails.paymentId}</p>
              </div>
            )}
            
            {failureDetails?.amount && (
              <div>
                <p className="text-sm text-brown-600 mb-1">Monto</p>
                <p className="font-semibold text-brown-900 text-lg">
                  {formatPrice(failureDetails.amount)}
                </p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-brown-600 mb-1">Código de Error</p>
              <p className="font-semibold text-brown-900">{failureDetails?.errorCode}</p>
            </div>
          </div>
        </div>

        {/* Common Solutions */}
        <div className={`border rounded-lg p-6 mb-8 ${
          failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
            ? 'bg-blue-50 border-blue-200' // Blue for cancellations
            : 'bg-yellow-50 border-yellow-200' // Yellow for failures
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
              ? 'text-blue-900' // Blue for cancellations
              : 'text-yellow-900' // Yellow for failures
          }`}>
            {failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site' ? (
              <span className="w-5 h-5 mr-2">💡</span>
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site' 
              ? '¿Qué puedes hacer?' 
              : 'Posibles Soluciones'
            }
          </h3>
          
          {failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site' ? (
            // Solutions for cancelled payments
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                  failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                    ? 'bg-blue-500 text-white' // Blue for cancellations
                    : 'bg-yellow-500 text-white' // Yellow for failures
                }`}>
                  1
                </div>
                <div>
                  <p className={`font-medium ${
                    failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                      ? 'text-blue-900' // Blue for cancellations
                      : 'text-yellow-900' // Yellow for failures
                  }`}>
                    Continuar comprando
                  </p>
                  <p className={`text-sm ${
                    failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                      ? 'text-blue-700' // Blue for cancellations
                      : 'text-yellow-700' // Yellow for failures
                  }`}>
                    Tu carrito sigue disponible. Puedes completar la compra cuando estés listo.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                  failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                    ? 'bg-blue-500 text-white' // Blue for cancellations
                    : 'bg-yellow-500 text-white' // Yellow for failures
                }`}>
                  2
                </div>
                <div>
                  <p className={`font-medium ${
                    failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                      ? 'text-blue-900' // Blue for cancellations
                      : 'text-yellow-900' // Yellow for failures
                  }`}>
                    Intentar nuevamente
                  </p>
                  <p className={`text-sm ${
                    failureDetails?.errorCode === 'user_cancelled' || failureDetails?.errorCode === 'return_to_site'
                      ? 'text-blue-700' // Blue for cancellations
                      : 'text-yellow-700' // Yellow for failures
                  }`}>
                    Si cambias de opinión, puedes intentar el pago nuevamente.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Solutions for payment failures (original content)
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Verifica los datos</p>
                  <p className="text-sm text-yellow-700">
                    Asegúrate de que la información de tu tarjeta o cuenta bancaria sea correcta
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Saldo suficiente</p>
                  <p className="text-sm text-yellow-700">
                    Verifica que tengas saldo suficiente en tu cuenta o tarjeta
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Método alternativo</p>
                  <p className="text-sm text-yellow-700">
                    Intenta con otro método de pago disponible
                  </p>
                </div>
              </div>
            </div>
          )}
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
                <p className="text-sm text-brown-600">info@casapinon.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/checkout" 
            className="btn-primary flex-1 text-center flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar Nuevamente
          </Link>
          
          <Link 
            to="/productos" 
            className="btn-secondary flex-1 text-center"
          >
            Seguir Comprando
          </Link>
        </div>

        {/* Alternative Payment Methods */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-brown-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Métodos de Pago Disponibles
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded border">
              <p className="font-medium text-brown-900">Tarjetas</p>
              <p className="text-brown-600">Crédito/Débito</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="font-medium text-brown-900">PSE</p>
              <p className="text-brown-600">Bancos</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="font-medium text-brown-900">Efectivo</p>
              <p className="text-brown-600">Efecty/Baloto</p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="font-medium text-brown-900">Digital</p>
              <p className="text-brown-600">Nequi/DaviPlata</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailure;
