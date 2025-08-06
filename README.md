# Casa Piñón Ebanistería - Tienda Online

Sitio web de comercio electrónico para Casa Piñón Ebanistería, especializada en muebles de madera real, puertas, ventanas y piezas personalizadas en Medellín y Oriente Antioqueño.

## 🎯 Características

- **SEO Optimizado**: Enfocado en palabras clave locales (Medellín, Rionegro, El Retiro, Oriente Antioqueño)
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **E-commerce Completo**: Carrito de compras, checkout y gestión de productos
- **Integración de Pagos**: Preparado para Epayco (Colombia)
- **WhatsApp Business**: Integración directa con WhatsApp
- **Cálculo de Envíos**: Por zonas geográficas en Antioquia
- **Testimonios**: Sistema de reseñas de clientes locales

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Routing**: React Router DOM
- **Estado**: React Context + useReducer
- **Formularios**: React Hook Form
- **Notificaciones**: React Hot Toast
- **SEO**: React Helmet Async
- **Iconos**: Lucide React

## 🚀 Instalación

1. **Clonar el repositorio**:
```bash
git clone <repository-url>
cd casa-pinon-ebanisteria
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Ejecutar en desarrollo**:
```bash
npm run dev
```

4. **Construir para producción**:
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.tsx      # Navegación principal
│   ├── Footer.tsx      # Pie de página
│   ├── HeroSection.tsx # Sección hero
│   ├── ProductCard.tsx # Tarjeta de producto
│   └── TestimonialCard.tsx # Tarjeta de testimonio
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx        # Página principal
│   ├── Products.tsx    # Catálogo de productos
│   ├── ProductDetail.tsx # Detalle de producto
│   ├── Cart.tsx        # Carrito de compras
│   ├── Checkout.tsx    # Finalizar compra
│   ├── About.tsx       # Sobre nosotros
│   └── Contact.tsx     # Contacto
├── store/              # Gestión de estado
│   └── CartContext.tsx # Contexto del carrito
├── types/              # Definiciones TypeScript
│   └── index.ts        # Interfaces y tipos
├── data/               # Datos mock
│   └── mockData.ts     # Productos y testimonios
├── hooks/              # Custom hooks
├── utils/              # Utilidades
└── assets/             # Recursos estáticos
```

## 🎨 Paleta de Colores

- **Primary Brown**: `#43302b` (Brown 900)
- **Secondary Brown**: `#846358` (Brown 800)
- **Cream**: `#fdf8f6` (Cream 50)
- **Light Cream**: `#e4ddd3` (Cream 500)

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔍 SEO

### Palabras Clave Principales
- ebanistería medellín
- muebles madera real
- carpintería rionegro
- muebles el retiro
- oriente antioqueño
- madera fina
- muebles personalizados

### Meta Tags
- Títulos optimizados para cada página
- Descripciones específicas por región
- Open Graph para redes sociales
- Schema markup para negocio local

## 💳 Integración de Pagos

### Epayco (Recomendado)
- **Comisión**: 2.9% + IVA
- **Ventajas**: Costo efectivo, fácil integración
- **Documentación**: [Epayco Docs](https://docs.epayco.co/)

### MercadoPago (Alternativa)
- **Comisión**: 3.5% + IVA
- **Ventajas**: Reconocimiento de marca
- **Documentación**: [MercadoPago Docs](https://www.mercadopago.com.co/developers)

## 🚚 Envíos

### Zonas de Cobertura
1. **Medellín**: $50,000 (Gratis desde $2,000,000)
2. **Oriente Antioqueño**: $80,000 (Gratis desde $2,500,000)
   - Rionegro, El Retiro, Llanogrande, La Ceja, Marinilla, Guarne
3. **Resto de Antioquia**: $120,000 (Gratis desde $3,000,000)

## 📞 Contacto

- **WhatsApp**: +57 301 466 4444
- **Email**: info@casapinon.com
- **Ubicación**: Alto de Carrizales, Antioquia

## 🚀 Despliegue

### Railway (Recomendado)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📈 Próximas Funcionalidades

- [ ] Sistema de reseñas reales
- [ ] Galería de proyectos
- [ ] Chat en vivo
- [ ] Seguimiento de pedidos
- [ ] Programa de fidelización
- [ ] Blog con consejos de carpintería
- [ ] Calculadora de presupuestos
- [ ] Integración con Google My Business

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Desarrollado por

Casa Piñón Ebanistería - Especialistas en muebles de madera real en Medellín y Oriente Antioqueño. 