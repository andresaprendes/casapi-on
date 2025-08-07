import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Truck, Clock, Award } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import ProductCard from '../components/ProductCard'
import TestimonialCard from '../components/TestimonialCard'
import { products, testimonials } from '../data/mockData'

const Home = () => {
  const featuredProducts = products.slice(0, 6)
  const featuredTestimonials = testimonials.slice(0, 3)

  const features = [
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Muebles de madera real con acabados de primera calidad'
    },
    {
      icon: Truck,
      title: 'Envío a Domicilio',
      description: 'Entrega en Medellín y Oriente Antioqueño'
    },
    {
      icon: Clock,
      title: 'Entrega Puntual',
      description: 'Cumplimos con los tiempos de entrega acordados'
    },
    {
      icon: Award,
      title: 'Artesanía Fina',
      description: 'Precisión y detalle en cada pieza'
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
              Más de 15 años de experiencia en carpintería fina, 
              especializados en muebles de madera real para hogares en Medellín y Oriente Antioqueño.
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
              Descubre nuestra colección de muebles de madera real, 
              diseñados y fabricados con precisión artesanal.
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

      {/* Categories Section */}
      <section className="section-padding bg-brown-900 text-cream-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Nuestras Categorías
            </h2>
            <p className="text-lg text-cream-200 max-w-2xl mx-auto">
              Explora nuestras categorías especializadas en muebles y carpintería fina.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sala', href: '/productos/sala', description: 'Sofás, mesas de centro, estanterías' },
              { name: 'Comedor', href: '/productos/comedor', description: 'Mesas, sillas, aparadores' },
              { name: 'Habitación', href: '/productos/habitacion', description: 'Camas, mesitas, armarios' },
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
              Contáctanos para obtener una cotización personalizada. 
              Atendemos Medellín, Rionegro, El Retiro y toda la región del Oriente Antioqueño.
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