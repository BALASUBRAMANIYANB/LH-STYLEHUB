import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SellerDashboard from './pages/SellerDashboard';
import RequireAdmin from './components/RequireAdmin';
import { useAuth } from './contexts/AuthContext';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Story from './pages/Story';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import Products from './pages/Products';
import TShirts from './pages/TShirts';
import ProductDetails from './pages/ProductDetails';
import Polo from './pages/Polo';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import TermsConditions from './pages/TermsConditions';
import CartSidebar from './components/CartSidebar';
import './App.css';


function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(0);
  const { cart, addToCart, removeItem, updateQuantity, clearCart } = useCart();

  // Auto-slide promotional offers every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Router>
      <div className="App">
        {/* Promotional Banner */}
        <div className="promo-banner">
          <div className="promo-slideshow">
            <div className={`promo-slide ${currentPromo === 0 ? 'active' : ''}`}>
              <span className="promo-text">Grab our launch offer - Save 25%</span>
            </div>
            <div className={`promo-slide ${currentPromo === 1 ? 'active' : ''}`}>
              <span className="promo-text">Own the luxe!</span>
            </div>
          </div>
        </div>
        
        <Header
          cartCount={getCartCount()}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onCartClick={() => setIsCartOpen(true)}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/tshirts" element={<TShirts />} />
            <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
            <Route path="/polo" element={<Polo />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/story" element={<Story />} />
            <Route path="/cart" element={<div className="page-placeholder">Cart Page</div>} />
            <Route path="/tracking" element={<div className="page-placeholder">Order Tracking Page</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout cartItems={cart} onOrderComplete={() => {}} onClearCart={clearCart} />} />
            <Route path="/orders" element={<div className="page-placeholder">My Orders Page</div>} />
            <Route path="/seller" element={<RequireAdmin><SellerDashboard /></RequireAdmin>} />
          </Routes>
        </main>

        <Footer />
        
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onRemoveItem={removeItem}
          onUpdateQuantity={updateQuantity}
          cartTotal={getCartTotal()}
          onCheckout={() => {
            setIsCartOpen(false);
            window.location.href = '/checkout';
          }}
        />
      </div>
    </Router>
  );
}


// App component wraps AppContent with AuthProvider and CartProvider
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
