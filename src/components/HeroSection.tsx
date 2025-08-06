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
              Muebles de Madera Real
              <span className="block text-cream-200">con Precisión Artesanal</span>
            </h1>
            <p className="text-xl text-cream-200 mb-8 leading-relaxed">
              Descubre la excelencia en ebanistería con Álvaro "Sapo Tieso". 
              28 años de experiencia creando muebles únicos, puertas y ventanas 
              que transforman tu espacio en un hogar extraordinario.
            </p>
            
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
            <div className="bg-cream-200 rounded-lg p-8 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-brown-100 to-brown-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <img
                    src="/logo-white.png"
                    alt="Casa Piñón Ebanistería"
                    className="h-24 w-auto mx-auto mb-6"
                  />
                  <div className="mt-4 text-sm text-brown-600">
                    <p>• Muebles de madera real</p>
                    <p>• Puertas y ventanas</p>
                    <p>• Diseños personalizados</p>
                    <p>• Envío a domicilio</p>
                  </div>
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