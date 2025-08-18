import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    productos: [
      { name: 'Muebles', href: '/productos/muebles' },
      { name: 'Puertas', href: '/productos/puertas' },
      { name: 'Ventanas', href: '/productos/ventanas' },
      { name: 'Piezas Personalizadas', href: '/productos/personalizadas' }
    ],
    empresa: [
      { name: 'Nosotros', href: '/nosotros' },
      { name: 'Contacto', href: '/contacto' },
      { name: 'Ubicación', href: '/contacto' }
    ],
    servicios: [
      { name: 'Diseño Personalizado', href: '/productos' },
      { name: 'Instalación', href: '/contacto' },
      { name: 'Mantenimiento', href: '/contacto' },
      { name: 'Envío a Domicilio', href: '/contacto' }
    ]
  }

  return (
    <footer className="bg-brown-900 text-cream-50">
      {/* Main Footer */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <img
                src="/logo-white.png"
                alt="Casa Piñón Ebanistería"
                className="h-20 w-auto brightness-200 contrast-300"
              />
            </div>
            <p className="text-cream-200 mb-4">
              Muebles de madera real y carpintería fina en Medellín y Oriente Antioqueño.
              Precisión artesanal en cada pieza.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+573014664444" className="hover:text-white transition-colors duration-200">
                  +57 301 466 4444
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@casapinon.co" className="hover:text-white transition-colors duration-200">
                  info@casapinon.co
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4" />
                <a href="https://maps.app.goo.gl/nhasHxZeW3RPdzrQA?g_st=ipc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
                  Alto de Carrizales, Antioquia
                </a>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4">Productos</h3>
            <ul className="space-y-2">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4">Servicios</h3>
            <ul className="space-y-2">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-cream-200 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="border-t border-brown-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-cream-200 text-sm">
                © {currentYear} Casa Piñón Ebanistería. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/573014664444"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center text-brown-900 hover:bg-white transition-colors duration-200"
                title="Chatear por WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:info@casapinon.co"
                className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center text-brown-900 hover:bg-white transition-colors duration-200"
                title="Enviar Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://maps.app.goo.gl/nhasHxZeW3RPdzrQA?g_st=ipc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center text-brown-900 hover:bg-white transition-colors duration-200"
                title="Ver en Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 