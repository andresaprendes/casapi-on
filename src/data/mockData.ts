import { Product, Testimonial } from '../types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Mesa de Comedor de Piñón',
    description: 'Mesa de comedor elegante fabricada en madera de piñón maciza, perfecta para 6 personas. Acabados de primera calidad con barniz natural que resalta la belleza única del piñón.',
    price: 2800000,
    category: 'comedor',
    subcategory: 'mesas',
    images: ['/images/mesa-comedor-pinon-1.jpg', '/images/mesa-comedor-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Barniz natural'],
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 45,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['Asientos para 6 personas', 'Madera de piñón auténtica', 'Diseño clásico'],
    specifications: {
      'Material': 'Piñón macizo',
      'Acabado': 'Barniz natural',
      'Capacidad': '6 personas',
      'Garantía': '3 años'
    }
  },
  {
    id: '2',
    name: 'Puerta Principal de Piñón',
    description: 'Puerta principal fabricada en madera de piñón maciza con herrajes de bronce. Diseño tradicional que aporta elegancia y seguridad a tu hogar.',
    price: 1200000,
    category: 'puertas',
    subcategory: 'principales',
    images: ['/images/puerta-pinon-1.jpg', '/images/puerta-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz protector'],
    dimensions: { length: 210, width: 90, height: 6 },
    weight: 35,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['Piñón macizo', 'Herrajes de bronce', 'Resistente a la intemperie'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '210x90cm',
      'Acabado': 'Barniz protector',
      'Garantía': '5 años'
    }
  },
  {
    id: '3',
    name: 'Cama Queen de Piñón',
    description: 'Cama queen size fabricada en madera de piñón con cabecera tallada a mano. Diseño único que combina tradición y elegancia para tu habitación.',
    price: 2200000,
    category: 'habitacion',
    subcategory: 'camas',
    images: ['/images/cama-pinon-1.jpg', '/images/cama-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Tallado artesanal', 'Barniz natural'],
    dimensions: { length: 200, width: 160, height: 120 },
    weight: 40,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '4-6 semanas',
    features: ['Tamaño Queen', 'Cabecera tallada', 'Madera de piñón auténtica'],
    specifications: {
      'Material': 'Piñón macizo',
      'Tamaño': 'Queen (200x160cm)',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '4',
    name: 'Estantería Artesanal de Piñón',
    description: 'Estantería de 5 niveles fabricada en madera de piñón con diseño artesanal. Perfecta para exhibir libros y objetos decorativos con el toque auténtico del piñón.',
    price: 1800000,
    category: 'sala',
    subcategory: 'estanterias',
    images: ['/images/estanteria-pinon-1.jpg', '/images/estanteria-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Barniz natural', 'Tallado artesanal'],
    dimensions: { length: 100, width: 35, height: 180 },
    weight: 35,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '3-5 semanas',
    features: ['5 niveles', 'Diseño artesanal', 'Madera de piñón'],
    specifications: {
      'Material': 'Piñón macizo',
      'Niveles': '5',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '5',
    name: 'Mesa de Centro de Piñón',
    description: 'Mesa de centro única fabricada en madera de piñón con detalles tallados. Pieza central perfecta para tu sala que refleja la tradición y calidad de Casa Piñón.',
    price: 1500000,
    category: 'sala',
    subcategory: 'mesas-centro',
    images: ['/images/mesa-centro-pinon-1.jpg', '/images/mesa-centro-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Tallado decorativo', 'Barniz natural'],
    dimensions: { length: 120, width: 60, height: 45 },
    weight: 25,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '2-4 semanas',
    features: ['Diseño único', 'Tallado decorativo', 'Madera de piñón auténtica'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '120x60cm',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '6',
    name: 'Escritorio Ejecutivo de Piñón',
    description: 'Escritorio ejecutivo fabricado en madera de piñón con cajones tallados y amplío espacio de trabajo. Ideal para oficinas que valoran la elegancia y funcionalidad.',
    price: 3200000,
    category: 'oficina',
    subcategory: 'escritorios',
    images: ['/images/escritorio-pinon-1.jpg', '/images/escritorio-pinon-2.jpg'],
    materials: ['Piñón macizo', 'Herrajes de bronce', 'Barniz satinado'],
    dimensions: { length: 150, width: 70, height: 75 },
    weight: 50,
    inStock: true,
    isCustom: false,
    estimatedDelivery: '5-7 semanas',
    features: ['Cajones tallados', 'Amplio espacio', 'Diseño ejecutivo'],
    specifications: {
      'Material': 'Piñón macizo',
      'Dimensiones': '150x70cm',
      'Acabado': 'Barniz satinado',
      'Garantía': '3 años'
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
    id: 'comedor',
    name: 'Comedor',
    description: 'Mesas y muebles de piñón para el comedor',
    image: '/images/category-comedor.jpg',
    slug: 'comedor',
    subcategories: ['mesas', 'sillas', 'aparadores', 'buffets']
  },
  {
    id: 'puertas',
    name: 'Puertas',
    description: 'Puertas artesanales de madera de piñón',
    image: '/images/category-puertas.jpg',
    slug: 'puertas',
    subcategories: ['principales', 'interiores', 'correderas', 'rústicas']
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    description: 'Camas y muebles de piñón para dormitorios',
    image: '/images/category-habitacion.jpg',
    slug: 'habitacion',
    subcategories: ['camas', 'mesitas', 'armarios', 'cómodas']
  },
  {
    id: 'sala',
    name: 'Sala',
    description: 'Estanterías y muebles de piñón para la sala',
    image: '/images/category-sala.jpg',
    slug: 'sala',
    subcategories: ['estanterias', 'mesas-centro', 'aparadores', 'libreros']
  },
  {
    id: 'oficina',
    name: 'Oficina',
    description: 'Escritorios y muebles ejecutivos de piñón',
    image: '/images/category-oficina.jpg',
    slug: 'oficina',
    subcategories: ['escritorios', 'estanterias', 'archivadores', 'sillas']
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