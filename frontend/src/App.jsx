import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import './index.css';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import PopularItems from './components/PopularItems';
import Suggestion from './components/Suggestion';
import ProductDetail from './components/ProductDetail';
import InboxModal from './components/InboxModal';
import SearchResults from './components/SearchResults';
import ProductPage from './components/ProductPage';
import Login from './Admin/Login';
import Dashboard from './Admin/Dashboard'; 
import Products from './Admin/Products'; 
import apiService from './utils/apiService.js';

function AppContent() {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initialize cache and preload data
    const initializeApp = async () => {
      try {
        // Preload popular data for better user experience
        await apiService.preloadData();
        
        // Get products for any component that still needs them
        await apiService.getProducts();
      } catch (error) {
        // Silent error handling for users
        console.error('Failed to initialize app data:', error);
      }
    };

    initializeApp();
    
    // Clean up expired cache entries periodically (silent background process)
    const cleanupInterval = setInterval(() => {
      const stats = apiService.getCacheStats();
      
      // Only log cache stats for admin users
      if (window.location.pathname.startsWith('/admin')) {
        console.log('Cache stats:', stats);
      }
      
      // If cache is getting too large, clean up silently
      if (stats.totalSizeKB > 5000) { // 5MB threshold
        if (window.location.pathname.startsWith('/admin')) {
          console.log('Cache size threshold reached, cleaning up...');
        }
        // The cleanup is already handled automatically in the cache manager
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Ẩn header/footer nếu là bất kỳ trang nào thuộc /admin
  const hideHeaderFooter = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!hideHeaderFooter && <Header />}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Suggestion />
              <PopularItems />
            </>
          } />
          <Route path="/men" element={<ProductPage />} />
          <Route path="/clothes" element={<ProductPage />} />
          <Route path="/footwear" element={<ProductPage />} />
          <Route path="/accessories" element={<ProductPage />} />
          <Route path="/service" element={<ProductPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/PD*" element={<ProductDetail />} />
        </Routes>
      </main>
      {!hideHeaderFooter && <Footer />}
      {showModal && <Modal onClose={() => setShowModal(false)} />}
      <InboxModal />
    </div>
  );
}

function App() {
  return (
    <ModalProvider>
      <Router>
        <AppContent />
      </Router>
    </ModalProvider>
  );
}

export default App;
