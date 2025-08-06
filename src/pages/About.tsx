import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Award, Clock, Users, Heart, CheckCircle, Star } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Award,
      title: 'Excelencia Artesanal',
      description: 'Cada pieza es creada con la máxima atención al detalle y calidad premium.'
    },
    {
      icon: Clock,
      title: 'Puntualidad Garantizada',
      description: 'Cumplimos con los plazos de entrega establecidos sin comprometer la calidad.'
    },
    {
      icon: Users,
      title: 'Atención Personalizada',
      description: 'Trabajamos de cerca con cada cliente para entender sus necesidades específicas.'
    },
    {
      icon: Heart,
      title: 'Pasión por la Madera',
      description: 'Amamos nuestro oficio y transmitimos esa pasión en cada proyecto.'
    }
  ]

  const achievements = [
    'Más de 500 proyectos completados exitosamente',
    'Clientes satisfechos en Medellín y Oriente Antioqueño',
    'Especialización en muebles de madera real',
    'Diseños únicos y personalizados',
    'Instalación profesional y garantía total',
    'Envío a domicilio en toda la región'
  ]

  return (
    <>
      <Helmet>
        <title>Nosotros - Casa Piñón Ebanistería | Álvaro "Sapo Tieso" - 28 Años de Experiencia</title>
        <meta name="description" content="Conoce a Álvaro 'Sapo Tieso', maestro ebanista con 28 años de experiencia. Casa Piñón Ebanistería: muebles de madera real, puertas, ventanas y carpintería fina en Medellín y Oriente Antioqueño." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brown-900 to-brown-800 text-cream-50 py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Nuestra Historia
            </h1>
            <p className="text-xl text-cream-200 max-w-3xl mx-auto">
              Descubre la pasión y dedicación detrás de cada pieza que creamos en Casa Piñón Ebanistería.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6">
                Álvaro "Sapo Tieso"
              </h2>
              <p className="text-lg text-brown-700 mb-6 leading-relaxed">
                Conocido cariñosamente como "Sapo Tieso" por su determinación y precisión en el trabajo, 
                Álvaro es el corazón y alma de Casa Piñón Ebanistería. Sus 28 años de experiencia en 
                el oficio lo han convertido en un verdadero maestro de la madera.
              </p>
              <p className="text-lg text-brown-700 mb-6 leading-relaxed">
                Como ebanista y electricista certificado, Álvaro combina habilidades técnicas avanzadas 
                con un profundo entendimiento de los materiales y técnicas tradicionales. Su pasión por 
                la perfección se refleja en cada proyecto que emprende.
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-brown-600" />
                  <span className="text-brown-700 font-medium">28 años de experiencia</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-brown-600" />
                  <span className="text-brown-700 font-medium">Maestro ebanista</span>
                </div>
              </div>
            </motion.div>

            {/* Image/Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-brown-100 rounded-lg p-8 shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-brown-200 to-brown-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <img
                      src="/logo-white.png"
                      alt="Casa Piñón Ebanistería"
                      className="h-32 w-auto mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-serif font-bold text-brown-900 mb-4">
                      Álvaro "Sapo Tieso"
                    </h3>
                    <p className="text-brown-700 mb-4">
                      Maestro Ebanista & Electricista
                    </p>
                    <div className="space-y-2 text-sm text-brown-600">
                      <p>• 28 años de experiencia</p>
                      <p>• Especialista en madera real</p>
                      <p>• Diseños personalizados</p>
                      <p>• Instalación profesional</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Company Story */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-serif font-bold text-brown-900 mb-8 text-center">
              Nuestra Historia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-brown-800 mb-4">
                  Los Inicios
                </h3>
                <p className="text-brown-700 leading-relaxed">
                  Casa Piñón Ebanistería nació de la pasión de Álvaro por transformar la madera en 
                  obras de arte funcionales. Comenzó como un pequeño taller en Alto de Carrizales, 
                  donde cada proyecto era una oportunidad para perfeccionar su técnica.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-brown-800 mb-4">
                  Crecimiento y Reconocimiento
                </h3>
                <p className="text-brown-700 leading-relaxed">
                  Con el tiempo, la calidad del trabajo de Álvaro se convirtió en su mejor publicidad. 
                  Los clientes satisfechos recomendaban sus servicios, expandiendo su alcance a 
                  Medellín y todo el Oriente Antioqueño.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-serif font-bold text-brown-900 mb-8 text-center">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-brown-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-cream-50" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-brown-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-brown-700 text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-serif font-bold text-brown-900 mb-8 text-center">
              Nuestros Logros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-brown-600 flex-shrink-0" />
                  <span className="text-brown-700">{achievement}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center bg-brown-50 rounded-lg p-8"
          >
            <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6">
              ¿Listo para Trabajar Juntos?
            </h2>
            <p className="text-xl text-brown-700 mb-8 max-w-2xl mx-auto">
              Permítenos transformar tu visión en realidad. Contacta con Álvaro "Sapo Tieso" 
              y descubre por qué somos la mejor opción en ebanistería.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contacto"
                className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4"
              >
                Solicitar Cotización
              </a>
              <a
                href="/productos"
                className="btn-secondary inline-flex items-center justify-center text-lg px-8 py-4"
              >
                Ver Nuestros Trabajos
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default About 