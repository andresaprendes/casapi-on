import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutFailure from './pages/CheckoutFailure'
import CheckoutPending from './pages/CheckoutPending'
import About from './pages/About'
import Contact from './pages/Contact'
import Orders from './pages/Orders'
import AdminProducts from './pages/AdminProducts'
import AdminDashboard from './pages/AdminDashboard'
import AdminDatabase from './pages/AdminDatabase'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import { CartProvider } from './store/CartContext'
import { AuthProvider } from './store/AuthContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
        <Helmet>
          <title>Casa Piñón Ebanistería - Muebles de Madera Fina en Medellín y Oriente Antioqueño</title>
          <meta name="description" content="Casa Piñón Ebanistería: Muebles de madera real, puertas, ventanas y piezas personalizadas en Medellín, Rionegro, El Retiro y Oriente Antioqueño. Carpintería fina con precisión artesanal." />
        </Helmet>
        
        <Header />
        <CartSidebar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:category" element={<Products />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
                               <Route path="/carrito" element={<Cart />} />
                   <Route path="/checkout" element={<Checkout />} />
                   <Route path="/checkout/success" element={<CheckoutSuccess />} />
                   <Route path="/checkout/failure" element={<CheckoutFailure />} />
                   <Route path="/checkout/pending" element={<CheckoutPending />} />
                   <Route path="/nosotros" element={<About />} />
                   <Route path="/contacto" element={<Contact />} />
                   <Route path="/admin/login" element={<AdminLogin />} />
                   <Route path="/admin" element={
                     <ProtectedRoute>
                       <AdminDashboard />
                     </ProtectedRoute>
                   } />
                   <Route path="/admin/pedidos" element={
                     <ProtectedRoute>
                       <Orders />
                     </ProtectedRoute>
                   } />
                   <Route path="/admin/productos" element={
                     <ProtectedRoute>
                       <AdminProducts />
                     </ProtectedRoute>
                   } />
                   <Route path="/admin/database" element={
                     <ProtectedRoute>
                       <AdminDatabase />
                     </ProtectedRoute>
                   } />
          </Routes>
        </main>
        
        <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App 