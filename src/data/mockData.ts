import { Product, Testimonial } from '../types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Mesa de Comedor de Roble',
    description: 'Mesa de comedor elegante fabricada en roble macizo, perfecta para 6 personas. Acabados de primera calidad con barniz natural.',
    price: 2800000,
    category: 'comedor',
    subcategory: 'mesas',
    images: ['/images/mesa-comedor-roble-1.jpg', '/images/mesa-comedor-roble-2.jpg'],
    materials: ['Roble macizo', 'Barniz natural'],
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 45,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['Asientos para 6 personas', 'Acabado resistente', 'Diseño clásico'],
    specifications: {
      'Material': 'Roble macizo',
      'Acabado': 'Barniz natural',
      'Capacidad': '6 personas',
      'Garantía': '2 años'
    }
  },
  {
    id: '2',
    name: 'Sofá de Sala en Cedro',
    description: 'Sofá de tres plazas fabricado en cedro con tapizado premium. Diseño moderno y confortable para la sala.',
    price: 3200000,
    category: 'sala',
    subcategory: 'sofas',
    images: ['/images/sofa-cedro-1.jpg', '/images/sofa-cedro-2.jpg'],
    materials: ['Cedro', 'Tela premium', 'Espuma de alta densidad'],
    dimensions: { length: 220, width: 85, height: 90 },
    weight: 35,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '5-7 semanas',
    features: ['Tres plazas', 'Tapizado premium', 'Estructura sólida'],
    specifications: {
      'Material': 'Cedro y tela premium',
      'Capacidad': '3 personas',
      'Acabado': 'Barniz satinado',
      'Garantía': '3 años'
    }
  },
  {
    id: '3',
    name: 'Cama King en Pino',
    description: 'Cama king size fabricada en pino macizo con cabecera elegante. Perfecta para habitaciones principales.',
    price: 1800000,
    category: 'habitacion',
    subcategory: 'camas',
    images: ['/images/cama-king-pino-1.jpg', '/images/cama-king-pino-2.jpg'],
    materials: ['Pino macizo', 'Barniz natural'],
    dimensions: { length: 200, width: 180, height: 120 },
    weight: 25,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['Tamaño King', 'Cabecera elegante', 'Estructura robusta'],
    specifications: {
      'Material': 'Pino macizo',
      'Tamaño': 'King (200x180cm)',
      'Acabado': 'Barniz natural',
      'Garantía': '2 años'
    }
  },
  {
    id: '4',
    name: 'Puerta Interior de Teca',
    description: 'Puerta interior de teca maciza con diseño clásico. Perfecta para interiores residenciales.',
    price: 850000,
    category: 'puertas',
    subcategory: 'interiores',
    images: ['/images/puerta-teca-1.jpg', '/images/puerta-teca-2.jpg'],
    materials: ['Teca maciza', 'Bisagras de bronce'],
    dimensions: { length: 210, width: 90, height: 4 },
    weight: 15,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '2-4 semanas',
    features: ['Teca maciza', 'Bisagras de bronce', 'Diseño clásico'],
    specifications: {
      'Material': 'Teca maciza',
      'Dimensiones': '210x90cm',
      'Acabado': 'Barniz natural',
      'Garantía': '1 año'
    }
  },
  {
    id: '5',
    name: 'Ventana Corredera de Cedro',
    description: 'Ventana corredera fabricada en cedro con vidrio templado. Ideal para balcones y terrazas.',
    price: 1200000,
    category: 'ventanas',
    subcategory: 'correderas',
    images: ['/images/ventana-cedro-1.jpg', '/images/ventana-cedro-2.jpg'],
    materials: ['Cedro', 'Vidrio templado', 'Aluminio'],
    dimensions: { length: 120, width: 120, height: 8 },
    weight: 20,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['Sistema corredero', 'Vidrio templado', 'Aislamiento térmico'],
    specifications: {
      'Material': 'Cedro y vidrio',
      'Dimensiones': '120x120cm',
      'Tipo': 'Corredera',
      'Garantía': '2 años'
    }
  },
  {
    id: '6',
    name: 'Estantería de Roble',
    description: 'Estantería de roble macizo con 5 niveles. Perfecta para libros y decoración.',
    price: 1500000,
    category: 'sala',
    subcategory: 'estanterias',
    images: ['/images/estanteria-roble-1.jpg', '/images/estanteria-roble-2.jpg'],
    materials: ['Roble macizo', 'Barniz natural'],
    dimensions: { length: 100, width: 30, height: 180 },
    weight: 30,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['5 niveles', 'Diseño moderno', 'Estructura sólida'],
    specifications: {
      'Material': 'Roble macizo',
      'Niveles': '5',
      'Acabado': 'Barniz natural',
      'Garantía': '2 años'
    }
  }
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'María González',
    location: 'Medellín, El Poblado',
    rating: 5,
    comment: 'Excelente trabajo en nuestra mesa de comedor. La calidad de la madera y los acabados son increíbles. Super recomendados para muebles de madera real en Medellín.',
    date: new Date('2024-01-15'),
    productCategory: 'comedor'
  },
  {
    id: '2',
    name: 'Carlos Ramírez',
    location: 'Rionegro, Antioquia',
    rating: 5,
    comment: 'Casa Piñón hizo las puertas de nuestra casa nueva. El trabajo es impecable y el servicio al cliente excelente. Definitivamente los mejores en carpintería en Rionegro.',
    date: new Date('2024-02-20'),
    productCategory: 'puertas'
  },
  {
    id: '3',
    name: 'Ana Sofía López',
    location: 'El Retiro, Antioquia',
    rating: 5,
    comment: 'Compré un sofá de sala y quedé fascinada con la calidad. La madera de cedro es hermosa y el tapizado muy resistente. Perfecto para mi hogar en El Retiro.',
    date: new Date('2024-03-10'),
    productCategory: 'sala'
  },
  {
    id: '4',
    name: 'Roberto Jiménez',
    location: 'Llanogrande, Antioquia',
    rating: 5,
    comment: 'Las ventanas de cedro que nos hicieron son perfectas. Excelente aislamiento y muy hermosas. Casa Piñón es sinónimo de calidad en Oriente Antioqueño.',
    date: new Date('2024-01-30'),
    productCategory: 'ventanas'
  },
  {
    id: '5',
    name: 'Patricia Herrera',
    location: 'Medellín, Laureles',
    rating: 5,
    comment: 'La cama king que compré es espectacular. El pino macizo se ve increíble y la cabecera es muy elegante. Definitivamente volveré a comprar con Casa Piñón.',
    date: new Date('2024-02-15'),
    productCategory: 'habitacion'
  },
  {
    id: '6',
    name: 'Fernando Morales',
    location: 'Alto de Carrizales',
    rating: 5,
    comment: 'Como vecino de Alto de Carrizales, puedo decir que Casa Piñón es la mejor opción para muebles de madera real. Calidad local con estándares internacionales.',
    date: new Date('2024-03-05'),
    productCategory: 'personalizados'
  }
]

export const categories = [
  {
    id: 'sala',
    name: 'Sala',
    description: 'Muebles para la sala de estar',
    image: '/images/category-sala.jpg',
    slug: 'sala',
    subcategories: ['sofas', 'mesas-centro', 'estanterias', 'aparadores']
  },
  {
    id: 'comedor',
    name: 'Comedor',
    description: 'Muebles para el comedor',
    image: '/images/category-comedor.jpg',
    slug: 'comedor',
    subcategories: ['mesas', 'sillas', 'aparadores', 'buffets']
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    description: 'Muebles para dormitorios',
    image: '/images/category-habitacion.jpg',
    slug: 'habitacion',
    subcategories: ['camas', 'mesitas', 'armarios', 'vestieres']
  },
  {
    id: 'puertas',
    name: 'Puertas',
    description: 'Puertas interiores y exteriores',
    image: '/images/category-puertas.jpg',
    slug: 'puertas',
    subcategories: ['interiores', 'exteriores', 'correderas', 'abatibles']
  },
  {
    id: 'ventanas',
    name: 'Ventanas',
    description: 'Ventanas de madera',
    image: '/images/category-ventanas.jpg',
    slug: 'ventanas',
    subcategories: ['correderas', 'abatibles', 'fijas', 'guillotina']
  }
]

export const shippingZones: any[] = [
  {
    name: 'Medellín',
    cities: ['Medellín'],
    basePrice: 50000,
    freeShippingThreshold: 2000000
  },
  {
    name: 'Oriente Antioqueño',
    cities: ['Rionegro', 'El Retiro', 'Llanogrande', 'La Ceja', 'Marinilla', 'Guarne'],
    basePrice: 80000,
    freeShippingThreshold: 2500000
  },
  {
    name: 'Resto de Antioquia',
    cities: ['Bello', 'Envigado', 'Sabaneta', 'Itagüí', 'Caldas'],
    basePrice: 120000,
    freeShippingThreshold: 3000000
  }
] 