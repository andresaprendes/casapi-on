import { Product, Testimonial } from '../types'

export const products: Product[] = [
  {
    id: '1',
    name: 'Mesa de Comedor de Piñón de Oreja',
    description: 'Mesa de comedor elegante fabricada en madera de piñón de oreja maciza, perfecta para 6 personas. Acabados de primera calidad con barniz natural que resalta la belleza única del piñón de oreja.',
    price: 2800000,
    category: 'comedor',
    subcategory: 'mesas',
    woodType: 'pinon-oreja',
    images: ['/images/image-1755135305383-454296344.webp'],
    materials: ['Piñón de Oreja macizo', 'Barniz natural'],
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 45,
    isCustom: false,
    designVariations: 'El diseño puede variar ligeramente según la disponibilidad de la madera de piñón de oreja y las preferencias del cliente.',
    estimatedDelivery: '4-6 semanas',
    features: ['Asientos para 6 personas', 'Madera de Piñón de Oreja auténtica', 'Diseño clásico'],
    specifications: {
      'Material': 'Piñón de Oreja macizo',
      'Acabado': 'Barniz natural',
      'Capacidad': '6 personas',
      'Garantía': '3 años'
    }
  },
  {
    id: '2',
    name: 'Puerta Principal de Piñón de Oreja',
    description: 'Puerta principal fabricada en madera de piñón de oreja maciza con herrajes de bronce. Diseño tradicional que aporta elegancia y seguridad a tu hogar.',
    price: 1200000,
    category: 'puertas',
    subcategory: 'principales',
    woodType: 'pinon-oreja',
    images: ['/images/image-1755137369333-477927924.webp'],
    materials: ['Piñón de Oreja macizo', 'Herrajes de bronce', 'Barniz protector'],
    dimensions: { length: 210, width: 90, height: 6 },
    weight: 35,
    isCustom: false,
    designVariations: 'Variaciones en el tallado y acabado según el estilo arquitectónico de la casa.',
    estimatedDelivery: '3-5 semanas',
    features: ['Piñón de Oreja macizo', 'Herrajes de bronce', 'Resistente a la intemperie'],
    specifications: {
      'Material': 'Piñón de Oreja macizo',
      'Dimensiones': '210x90cm',
      'Acabado': 'Barniz protector',
      'Garantía': '5 años'
    }
  },
  {
    id: '3',
    name: 'Cama Queen de Piñón de Oreja',
    description: 'Cama queen size fabricada en madera de piñón de oreja con cabecera tallada a mano. Diseño único que combina tradición y elegancia para tu habitación.',
    price: 2200000,
    category: 'habitacion',
    subcategory: 'camas',
    woodType: 'pinon-oreja',
    images: ['/images/image-1755137545858-681902723.webp'],
    materials: ['Piñón de Oreja macizo', 'Tallado artesanal', 'Barniz natural'],
    dimensions: { length: 200, width: 160, height: 120 },
    weight: 40,
    isCustom: false,
    designVariations: 'El tallado de la cabecera puede variar según el diseño preferido del cliente.',
    estimatedDelivery: '4-6 semanas',
    features: ['Tamaño Queen', 'Cabecera tallada', 'Madera de Piñón de Oreja auténtica'],
    specifications: {
      'Material': 'Piñón de Oreja macizo',
      'Tamaño': 'Queen (200x160cm)',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '4',
    name: 'Estantería Artesanal de Piñón de Oreja',
    description: 'Estantería de 5 niveles fabricada en madera de piñón de oreja con diseño artesanal. Perfecta para exhibir libros y objetos decorativos con el toque auténtico del piñón de oreja.',
    price: 1800000,
    category: 'sala',
    subcategory: 'estanterias',
    woodType: 'pinon-oreja',
    images: ['/images/image-1755137657743-535686656.webp'],
    materials: ['Piñón de Oreja macizo', 'Barniz natural', 'Tallado artesanal'],
    dimensions: { length: 100, width: 35, height: 180 },
    weight: 35,
    isCustom: false,
    designVariations: 'El número de niveles y el diseño del tallado pueden adaptarse según las necesidades del cliente.',
    estimatedDelivery: '3-5 semanas',
    features: ['5 niveles', 'Diseño artesanal', 'Madera de Piñón de Oreja'],
    specifications: {
      'Material': 'Piñón de Oreja macizo',
      'Niveles': '5',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '5',
    name: 'Mesa de Centro de Piñón de Oreja',
    description: 'Mesa de centro única fabricada en madera de piñón de oreja con detalles tallados. Pieza central perfecta para tu sala que refleja la tradición y calidad de Casa Piñón.',
    price: 1500000,
    category: 'sala',
    subcategory: 'mesas-centro',
    woodType: 'pinon-oreja',
    images: ['/images/image-1755138001829-743849468.webp'],
    materials: ['Piñón de Oreja macizo', 'Barniz natural', 'Tallado artesanal'],
    dimensions: { length: 120, width: 70, height: 45 },
    weight: 25,
    isCustom: false,
    designVariations: 'El diseño del tallado puede adaptarse según las preferencias del cliente.',
    estimatedDelivery: '3-4 semanas',
    features: ['Diseño único', 'Tallado artesanal', 'Madera de Piñón de Oreja auténtica'],
    specifications: {
      'Material': 'Piñón de Oreja macizo',
      'Acabado': 'Barniz natural',
      'Garantía': '3 años'
    }
  },
  {
    id: '6',
    name: 'Escritorio Ejecutivo de Cedro',
    description: 'Escritorio ejecutivo fabricado en madera de cedro con acabados premium. Diseño ergonómico y elegante para tu espacio de trabajo.',
    price: 3200000,
    category: 'oficina',
    subcategory: 'escritorios',
    woodType: 'cedro',
    images: ['/images/image-1755136170928-605023865.webp'],
    materials: ['Cedro macizo', 'Barniz premium', 'Herrajes de acero'],
    dimensions: { length: 140, width: 80, height: 75 },
    weight: 50,
    isCustom: false,
    designVariations: 'El diseño puede adaptarse según las necesidades específicas del cliente.',
    estimatedDelivery: '5-7 semanas',
    features: ['Diseño ergonómico', 'Madera de cedro premium', 'Herrajes de calidad'],
    specifications: {
      'Material': 'Cedro macizo',
      'Acabado': 'Barniz premium',
      'Garantía': '5 años'
    }
  },
  {
    id: '7',
    name: 'Ventana Corredera de Roble',
    description: 'Ventana corredera fabricada en madera de roble con sistema de deslizamiento suave. Perfecta para espacios modernos y tradicionales.',
    price: 1800000,
    category: 'ventanas',
    subcategory: 'correderas',
    woodType: 'roble',
    images: ['/images/image-1755136180161-48892126.webp'],
    materials: ['Roble macizo', 'Vidrio templado', 'Sistema de deslizamiento'],
    dimensions: { length: 120, width: 15, height: 120 },
    weight: 30,
    isCustom: false,
    designVariations: 'Las dimensiones pueden adaptarse según las aberturas de la casa.',
    estimatedDelivery: '4-6 semanas',
    features: ['Sistema corredero suave', 'Madera de roble', 'Vidrio templado'],
    specifications: {
      'Material': 'Roble macizo',
      'Vidrio': 'Templado',
      'Garantía': '5 años'
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
    image: '/images/image-1755135305383-454296344.webp',
    slug: 'comedor',
    subcategories: ['mesas', 'sillas', 'aparadores', 'buffets']
  },
  {
    id: 'puertas',
    name: 'Puertas',
    description: 'Puertas artesanales de madera de piñón',
    image: '/images/image-1755137369333-477927924.webp',
    slug: 'puertas',
    subcategories: ['principales', 'interiores', 'correderas', 'rústicas']
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    description: 'Camas y muebles de piñón para dormitorios',
    image: '/images/image-1755137545858-681902723.webp',
    slug: 'habitacion',
    subcategories: ['camas', 'mesitas', 'armarios', 'cómodas']
  },
  {
    id: 'sala',
    name: 'Sala',
    description: 'Estanterías y muebles de piñón para la sala',
    image: '/images/image-1755137657743-535686656.webp',
    slug: 'sala',
    subcategories: ['estanterias', 'mesas-centro', 'aparadores', 'libreros']
  },
  {
    id: 'oficina',
    name: 'Oficina',
    description: 'Escritorios y muebles ejecutivos de piñón',
    image: '/images/image-1755136170928-605023865.webp',
    slug: 'oficina',
    subcategories: ['escritorios', 'estanterias', 'archivadores', 'sillas']
  },
  {
    id: 'exterior',
    name: 'Exterior',
    description: 'Muebles y estructuras de madera para espacios exteriores',
    image: '/images/image-1755138001829-743849468.webp',
    slug: 'exterior',
    subcategories: ['mesas-jardin', 'sillas-jardin', 'pergolas', 'decking', 'bancas', 'macetas']
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

export const woodTypes = [
  {
    id: 'pinon-oreja',
    name: 'Piñón de Oreja',
    description: 'Madera de piñón de oreja colombiano, conocida por su durabilidad y belleza natural',
    characteristics: ['Durabilidad alta', 'Resistente a la humedad', 'Color marrón dorado', 'Veta pronunciada'],
    image: '/images/image-1755135305383-454296344.webp',
    slug: 'pinon-oreja',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'cedro',
    name: 'Cedro',
    description: 'Madera de cedro rojo, apreciada por su aroma y resistencia natural a insectos',
    characteristics: ['Aroma natural', 'Resistente a insectos', 'Color rojizo', 'Veta suave'],
    image: '/images/image-1755136170928-605023865.webp',
    slug: 'cedro',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'roble',
    name: 'Roble',
    description: 'Madera de roble blanco, conocida por su fortaleza y durabilidad excepcional',
    characteristics: ['Fortaleza excepcional', 'Durabilidad muy alta', 'Color marrón claro', 'Veta marcada'],
    image: '/images/image-1755136180161-48892126.webp',
    slug: 'roble',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'nogal',
    name: 'Nogal',
    description: 'Madera de nogal negro, apreciada por su color oscuro y elegancia',
    characteristics: ['Color oscuro elegante', 'Veta fina', 'Durabilidad alta', 'Acabado premium'],
    image: '/images/image-1755138001829-743849468.webp',
    slug: 'nogal',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'pino',
    name: 'Pino',
    description: 'Madera de pino radiata, versátil y económica para diversos usos',
    characteristics: ['Versatilidad', 'Precio accesible', 'Color claro', 'Fácil de trabajar'],
    image: '/images/image-1755137545858-681902723.webp',
    slug: 'pino',
    isPremium: false,
    origin: 'Colombia'
  },
  {
    id: 'guayacan',
    name: 'Guayacán',
    description: 'Madera de guayacán, conocida como "palo santo" por su extrema dureza',
    characteristics: ['Extrema dureza', 'Resistencia al agua', 'Color verde oliva', 'Durabilidad máxima'],
    image: '/images/image-1755137657743-535686656.webp',
    slug: 'guayacan',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'caoba',
    name: 'Caoba',
    description: 'Madera de caoba americana, apreciada por su color rojizo y estabilidad',
    characteristics: ['Color rojizo rico', 'Estabilidad dimensional', 'Veta suave', 'Acabado premium'],
    image: '/images/image-1755136374138-27692147.webp',
    slug: 'caoba',
    isPremium: true,
    origin: 'Colombia'
  },
  {
    id: 'teca',
    name: 'Teca',
    description: 'Madera de teca, conocida por su resistencia excepcional a la intemperie y durabilidad',
    characteristics: ['Resistencia extrema a la intemperie', 'Durabilidad máxima', 'Color dorado', 'Aceites naturales'],
    image: '/images/image-1755135305383-454296344.webp',
    slug: 'teca',
    isPremium: true,
    origin: 'Colombia'
  }
] 