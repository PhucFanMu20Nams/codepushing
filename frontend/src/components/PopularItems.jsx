import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PopularItems.css';
import apiService from '../utils/apiService.js';

function PopularItems() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch products using the cached API service
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Use limit=6 to get just enough products for the popular items section
        const response = await apiService.getProducts({ limit: 6 });
        // console.log('Products data from API:', response);
        
        // Check the structure of the response and extract products accordingly
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.products && Array.isArray(response.products)) {
          setProducts(response.products);
        } else {
          // console.warn('Unexpected API response structure:', response);
          setError('Unexpected API response structure');
          // Don't fall back to sample products immediately
        }
      } catch (error) {
        // console.error('Error fetching products:', error);
        setError('Failed to load products from server');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to handle image URLs - updated to handle backend paths better
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/shirt-1.jpg'; // Default fallback
    
    // If it's already an absolute URL, use it as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Get the API URL from environment, or use a default if not available
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Handle paths from backend that include 'products/'
    if (imagePath.includes('products/')) {
      // Make sure the path is properly formatted with leading slash if needed
      if (imagePath.startsWith('/')) {
        return `${apiUrl}${imagePath}`;
      } else {
        return `${apiUrl}/images/${imagePath}`;
      }
    }
    
    // Handle paths from backend that start with /images/
    if (imagePath.startsWith('/images/')) {
      return `${apiUrl}${imagePath}`;
    }
    
    // Handle frontend public assets (these should be in the public folder)
    if (imagePath.startsWith('/assets/')) {
      return imagePath;
    }
    
    // For any other path, try prepending the API URL and /images/
    return `${apiUrl}/images/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  // Only fall back to sample products if we have no products and there was an error
  const displayProducts = products.length > 0 ? products : (error ? sampleProducts : []);

  // If there are no products and no error, show a message
  if (displayProducts.length === 0) {
    return (
      <section className="popular-items">
        <div className="container">
          <h2 className="section-title">POPULAR ITEMS</h2>
          <p className="section-subtitle">No products available at this time</p>
        </div>
      </section>
    );
  }

  return (
    <section className="popular-items">
      <div className="container">
        <h2 className="section-title">POPULAR ITEMS</h2>
        <p className="section-subtitle">Top-Selling Pieces from Last Month</p>
        
        <div className="products-grid">
          {displayProducts.slice(0, 6).map(product => (
            <Link to={`/product/${product.id || product._id}`} key={product.id || product._id} className="product-card">
              <div className="product-image">
                <img 
                  loading="lazy"
                  src={getImageUrl(product.image || product.imageUrl)} 
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src, 'Original path:', product.image || product.imageUrl);
                    // Try a different path construction as a fallback
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const filename = (product.image || product.imageUrl || '').split('/').pop();
                    if (filename) {
                      e.target.src = `${apiUrl}/images/products/${filename}`;
                    } else {
                      e.target.src = '/assets/images/shirt-1.jpg'; // Last resort fallback
                    }
                  }}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-price">{
                  typeof product.price === 'number' 
                    ? product.price.toLocaleString('vi-VN') + ' VND' 
                    : product.price
                }</p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="shop-now-container">
          <button className="shop-now-btn">SHOP NOW</button>
        </div>
      </div>
    </section>
  );
}

export default PopularItems;