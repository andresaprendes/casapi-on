import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, Star, Truck, Shield, Clock } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-brown-900 to-brown-800 text-cream-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fdf8f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom section-padding relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Muebles Premium de Madera Real
              <span className="block text-cream-200">para tu Hogar</span>
            </h1>
            <p className="text-xl text-cream-200 mb-8 leading-relaxed">
              Transforma tu hogar con muebles elegantes y de alta calidad. 
              Paga en 6 cuotas sin intereses con tu tarjeta de crédito. 
              Envío a domicilio en Medellín y Oriente Antioqueño.
            </p>
            
            {/* Payment Highlight */}
            <div className="bg-cream-200 bg-opacity-10 rounded-lg p-4 mb-8 border border-cream-200 border-opacity-20">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-cream-200" />
                <span className="text-lg font-semibold text-cream-50">¡6 CUOTAS SIN INTERESES!</span>
                <Star className="w-5 h-5 text-cream-200" />
              </div>
              <p className="text-center text-cream-200 text-sm">
                Paga con tu tarjeta de crédito en cuotas mensuales sin intereses
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-cream-200" />
                <span className="text-sm">Calidad Premium</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-cream-200" />
                <span className="text-sm">Envío a Domicilio</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cream-200" />
                <span className="text-sm">Garantía Total</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-cream-200" />
                <span className="text-sm">Entrega Puntual</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/productos"
                className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4"
              >
                Ver Productos
              </Link>
              <Link
                to="/contacto"
                className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-4"
              >
                Solicitar Cotización
              </Link>
            </div>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-cream-200 rounded-lg p-6 shadow-2xl overflow-hidden">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src="/images/image-1755135305383-454296344.png"
                  alt="Mesa de Comedor Premium de Madera Real - Casa Piñón Ebanistería"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-brown-800 text-cream-50 px-4 py-2 rounded-full text-sm font-medium">
                  <span>✨</span>
                  <span>Muebles Premium de Madera Real</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-cream-200">Descubre más</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-cream-200" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection 