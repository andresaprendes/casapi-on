import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brown-900 mb-2">
            ¡Compra Exitosa!
          </h1>
          <p className="text-brown-800">
            Gracias por tu compra. Hemos recibido tu pedido y nos pondremos en contacto contigo pronto.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-brown-900 text-white py-3 px-6 rounded-lg hover:bg-brown-800 transition-colors"
          >
            Volver al Inicio
          </Link>
          
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