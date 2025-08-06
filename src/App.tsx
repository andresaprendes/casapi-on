import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import { CartProvider } from './store/CartContext'

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Casa Piñón Ebanistería - Muebles de Madera Fina en Medellín y Oriente Antioqueño</title>
          <meta name="description" content="Casa Piñón Ebanistería: Muebles de madera real, puertas, ventanas y piezas personalizadas en Medellín, Rionegro, El Retiro y Oriente Antioqueño. Carpintería fina con precisión artesanal." />
        </Helmet>
        
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:category" element={<Products />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App 