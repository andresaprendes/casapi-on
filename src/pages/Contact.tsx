import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import emailjs from '@emailjs/browser'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // Configuración de EmailJS
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        from_phone: data.phone,
        subject: data.subject,
        message: data.message,
        to_email: 'info@casapinon.co'
      }

      // Enviar email usando EmailJS
      await emailjs.send(
        'service_g2bg5y8', // Service ID de EmailJS
        'template_1sb5jsp', // Template ID de EmailJS
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '3VIAbXhCV_ANhCN6m' // Public Key de EmailJS
      )

      setSubmitStatus('success')
      reset()
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono & WhatsApp',
      value: '+57 301 466 4444',
      link: 'https://wa.me/573014664444',
      description: 'Línea directa con Álvaro "Sapo Tieso"'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@casapinon.co',
      link: 'mailto:info@casapinon.co',
      description: 'Envíanos un correo electrónico'
    },
    {
      icon: Clock,
      title: 'Horario de Atención',
      value: 'Lunes a Sábado',
      description: '8:00 AM - 5:30 PM'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      value: 'Alto de Carrizales, Antioquia',
      link: 'https://maps.app.goo.gl/hWwg7QJZqJR1p4y86',
      description: 'Visítanos en nuestro taller'
    }
  ]

  return (
    <>
      <Helmet>
        <title>Contacto - Casa Piñón Ebanistería | Medellín y Oriente Antioqueño</title>
        <meta name="description" content="Contacta a Casa Piñón Ebanistería. WhatsApp: +57 301 466 4444. Email: info@casapinon.co. Horario: Lunes a Sábado 8AM-5:30PM. Ubicación: Alto de Carrizales, Antioquia." />
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
              Contáctanos
            </h1>
            <p className="text-xl text-cream-200 max-w-3xl mx-auto">
              Estamos aquí para hacer realidad tu proyecto. Contacta directamente con 
              Álvaro "Sapo Tieso" y descubre por qué somos la mejor opción en ebanistería.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brown-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <info.icon className="w-8 h-8 text-cream-50" />
                </div>
                <h3 className="text-lg font-serif font-bold text-brown-900 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    target={info.link.startsWith('http') ? '_blank' : '_self'}
                    rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                    className="text-brown-700 hover:text-brown-900 transition-colors duration-200 font-medium"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-brown-700 font-medium">{info.value}</p>
                )}
                <p className="text-sm text-brown-600 mt-1">{info.description}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-3xl font-serif font-bold text-brown-900 mb-8">
                Envíanos un Mensaje
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brown-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'El nombre es requerido' })}
                      className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { 
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brown-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-brown-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    {...register('subject', { required: 'El asunto es requerido' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.subject && (
                    <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brown-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register('message', { required: 'El mensaje es requerido' })}
                    className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent resize-none"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  />
                  {errors.message && (
                    <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <p className="font-medium">¡Mensaje enviado exitosamente!</p>
                    <p className="text-sm">Te contactaremos pronto.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="font-medium">Error al enviar el mensaje</p>
                    <p className="text-sm">Por favor, intenta nuevamente o contacta directamente por WhatsApp.</p>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-3xl font-serif font-bold text-brown-900 mb-8">
                Nuestra Ubicación
              </h2>
              <div className="bg-brown-100 rounded-lg p-4">
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=place_id:ChIJqcPNLt2dRo4Rj-gDdQTzJ-0&zoom=17`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Casa Piñón Ebanistería - Alto de Carrizales, Antioquia"
                  />
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h3 className="font-serif font-bold text-brown-900 mb-2">
                    Taller Casa Piñón Ebanistería
                  </h3>
                  <p className="text-brown-700 mb-2">
                    Alto de Carrizales, Antioquia, Colombia
                  </p>
                  <a
                    href="https://maps.app.goo.gl/hWwg7QJZqJR1p4y86"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brown-800 hover:text-brown-600 transition-colors duration-200 font-medium inline-flex items-center space-x-1"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Ver en Google Maps</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="section-padding bg-brown-50">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl font-serif font-bold text-brown-900 mb-6">
              ¿Necesitas una Respuesta Rápida?
            </h2>
            <p className="text-xl text-brown-700 mb-8 max-w-2xl mx-auto">
              Contacta directamente con Álvaro "Sapo Tieso" por WhatsApp y obtén una 
              respuesta inmediata sobre tu proyecto.
            </p>
            <a
              href="https://wa.me/573014664444"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chatear por WhatsApp</span>
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Contact 