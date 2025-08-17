import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Truck, Clock, Award } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import TestimonialCard from '../components/TestimonialCard'
import PaymentStatusWidget from '../components/PaymentStatusWidget'
import { testimonials, woodTypes } from '../data/mockData'
import { useProducts } from '../hooks/useProducts'

const Home = () => {
  const { products } = useProducts()
  const featuredProducts = products.slice(0, 6)
  const featuredTestimonials = testimonials.slice(0, 3)

  const features = [
    {
      icon: Shield,
      title: 'Calidad Premium',
      description: 'Muebles de madera real con acabados de primera calidad'
    },
    {
      icon: Truck,
      title: 'Envío a Domicilio',
      description: 'Entrega en Medellín y Oriente Antioqueño'
    },
    {
      icon: Clock,
      title: '6 Cuotas Sin Intereses',
      description: 'Paga con tu tarjeta de crédito en cuotas mensuales'
    },
    {
      icon: Award,
      title: 'Garantía Total',
      description: 'Respaldamos la calidad de todos nuestros productos'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Casa Piñón Ebanistería - Muebles de Madera Fina en Medellín y Oriente Antioqueño</title>
        <meta name="description" content="Casa Piñón Ebanistería: Muebles de madera real, puertas, ventanas y piezas personalizadas en Medellín, Rionegro, El Retiro y Oriente Antioqueño. Carpintería fina con precisión artesanal." />
        <meta name="keywords" content="ebanistería medellín, muebles madera real, carpintería rionegro, muebles el retiro, oriente antioqueño, madera fina, muebles personalizados" />
        <link rel="canonical" href="https://casapinon.com/" />
      </Helmet>

      <HeroSection />

      {/* Payment Status Widget */}
      <PaymentStatusWidget />

      {/* Features Section */}
      <section className="section-padding bg-cream-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              ¿Por qué elegir Casa Piñón?
            </h2>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Muebles premium de madera real con la facilidad de pago en 6 cuotas sin intereses. 
              Transforma tu hogar con elegancia y comodidad financiera.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-brown-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-cream-50" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-brown-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-brown-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Descubre nuestra colección de muebles premium de madera real, 
              elegantes y funcionales para transformar tu hogar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link
              to="/productos"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Ver todos los productos</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-cream-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              Nuestras Categorías
            </h2>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Descubre nuestra amplia gama de productos artesanales en madera real.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Comedor', href: '/productos/comedor', description: 'Mesas y muebles de comedor' },
              { name: 'Puertas', href: '/productos/puertas', description: 'Puertas interiores y exteriores' },
              { name: 'Ventanas', href: '/productos/ventanas', description: 'Ventanas de madera fina' },
              { name: 'Personalizados', href: '/productos', description: 'Diseños a medida' },
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-brown-800 rounded-lg p-6 hover:bg-brown-700 transition-colors duration-200"
              >
                <Link to={category.href} className="block">
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {category.name}
                  </h3>
                  <p className="text-cream-200 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-cream-200 hover:text-white transition-colors duration-200">
                    <span className="text-sm font-medium">Explorar</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wood Types Showcase */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              Tipos de Madera Premium
            </h2>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Trabajamos con las mejores maderas colombianas para garantizar durabilidad y belleza natural.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {woodTypes.map((wood, index) => (
              <motion.div
                key={wood.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-brown-600 to-brown-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-cream-50 font-serif font-bold text-xl">
                      {wood.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-brown-900 mb-2">
                    {wood.name}
                  </h3>
                  <p className="text-brown-600 text-sm mb-4">
                    {wood.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wood.characteristics.slice(0, 2).map((char, charIndex) => (
                      <span
                        key={charIndex}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  {wood.isPremium && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brown-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-brown-600 max-w-2xl mx-auto">
              Satisfacción garantizada en Medellín, Rionegro, El Retiro y toda la región.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-brown-800 to-brown-900 text-cream-50">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              ¿Listo para transformar tu hogar?
            </h2>
            <p className="text-lg text-cream-200 mb-8 max-w-2xl mx-auto">
              Obtén muebles premium con la facilidad de pago en 6 cuotas sin intereses. 
              Envío a domicilio en Medellín, Rionegro, El Retiro y toda la región del Oriente Antioqueño.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contacto"
                className="btn-secondary"
              >
                Solicitar Cotización
              </Link>
              <a
                href="https://wa.me/573014664444"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Home 