import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PopularItems.css';
import apiService from '../utils/apiService.js';

function PopularItems() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products using the cached API service
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProducts({ limit: 6 });
        console.log('Products data:', data);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to sample data if API fails
        setProducts(sampleProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sample product data as fallback - using your specified 6 products
  const sampleProducts = [
    {
      id: "nike-dunk-low",
      name: 'Nike Dunk Low',
      brand: 'Nike',
      price: 1800000,
      image: '/images/products/nike-dunk-low.jpg'
    },
    {
      id: "nike-dunk-low-panda",
      name: 'Nike Dunk Low Retro Panda',
      brand: 'Nike',
      price: 2300000,
      image: '/assets/images/products/nike_dunk_retro_panda_1.jpg'
    },
    {
      id: "adidas-samba-og",
      name: 'Adidas Samba OG',
      brand: 'Adidas',
      price: 1900000,
      image: '/images/products/adidas-samba-og.jpg'
    },
    {
      id: "nike-sportswear-club-button-up",
      name: 'Nike Sportswear Club Woven Short-Sleeve Button-Up',
      brand: 'Nike',
      price: 890000,
      image: '/images/products/nike-button-up.jpg'
    },
    {
      id: "nike-sportswear-club-tshirt-ss25",
      name: 'Nike Sportswear Club T-Shirt SS25',
      brand: 'Nike',
      price: 550000,
      image: '/images/products/nike-tshirt-ss25.jgp'
    },
    {
      id: "nike-killshot-2-leather",
      name: 'Nike Killshot 2 Leather',
      brand: 'Nike',
      price: 1700000,
      image: '/images/products/nike-killshot-2.jpg'
    }
  ];

  // Helper function to handle image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/shirt-1.jpg'; // Default
    
    if (imagePath.startsWith('http')) return imagePath;
    
    // Handle backend images
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Handle frontend assets
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return path;
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <section className="popular-items">
      <div className="container">
        <h2 className="section-title">POPULAR ITEMS</h2>
        <p className="section-subtitle">Top-Selling Pieces from Last Month</p>
        
        <div className="products-grid">
          {displayProducts.slice(0, 6).map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = '/assets/images/shirt-1.jpg'; // Fallback
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