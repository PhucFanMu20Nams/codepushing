import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import './ProductDetail.css';
import apiService from '../utils/apiService.js';

function ProductDetail() {
  const { productId } = useParams();
  const location = useLocation();
  const { openModal } = useModal();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null);
  const [isSliding, setIsSliding] = useState(false);
  const imageContainerRef = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    // Determine the actual product ID based on URL format
    let actualProductId;
    
    if (productId) {
      // Coming from /product/:productId route
      actualProductId = productId.replace(/:/g, '');
    } else {
      // Coming from direct route like /PD0001, extract from pathname
      actualProductId = location.pathname.replace('/', '');
    }
    
    // Fetch product data using cached API service
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Clear cache for this specific product to ensure fresh data
        apiService.invalidateProductCaches(actualProductId);
        const data = await apiService.getProductById(actualProductId);
        console.log('Product data received:', data);
        console.log('Color:', data.color, 'Style:', data.style);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (actualProductId) {
      fetchProduct();
    }
  }, [productId, location.pathname]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const nextImage = () => {
    if (isSliding || !product.gallery || product.gallery.length <= 1) return;
    setSlideDirection('left'); // reverse: slide out to left
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === product.gallery.length - 1 ? 0 : prev + 1
      );
      setSlideDirection('right-in'); // slide in from right
      setTimeout(() => {
        setSlideDirection(null);
        setIsSliding(false);
      }, 300);
    }, 300);
  };

  const prevImage = () => {
    if (isSliding || !product.gallery || product.gallery.length <= 1) return;
    setSlideDirection('right'); // reverse: slide out to right
    setIsSliding(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.gallery.length - 1 : prev - 1
      );
      setSlideDirection('left-in'); // slide in from left
      setTimeout(() => {
        setSlideDirection(null);
        setIsSliding(false);
      }, 300);
    }, 300);
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
    touchStartX.current = null;
  };

  // Helper function to fix image paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/placeholder-image.jpg'; // Use placeholder from public folder
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        {product.category} / {product.brand} / {product.type}
      </div>
      
      <div className="product-content">
        <div
          className="product-images"
          ref={imageContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Arrow button for previous image */}
          {product.gallery && product.gallery.length > 1 && (
            <button className="arrow left" onClick={prevImage} aria-label="Previous image">
              <svg width="40" height="40" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="92" height="92"/>
                <path d="M56 24L32 46L56 68" stroke="#181818" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          {/* Show current image */}
          <img 
            src={getImageUrl(product.gallery ? product.gallery[currentImageIndex] : product.image)} 
            alt={product.name}
            className={`main-image${slideDirection ? ` slide-${slideDirection}` : ''}`}
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              e.target.src = '/assets/images/ralph_product.jpg';
            }}
          />
          
          {/* Arrow button for next image */}
          {product.gallery && product.gallery.length > 1 && (
            <button className="arrow right" onClick={nextImage} aria-label="Next image">
              <svg width="40" height="40" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="92" height="92"/>
                <path d="M36 24L60 46L36 68" stroke="#181818" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="product-info">
          <div className="brand">{product.brand}</div>
          <h1 className="product-name">{product.name}</h1>
          <div className="price">{product.price.toLocaleString()} VND</div>
          
          <div className="size-selection">
            <p>Select size</p>
            <div className="size-options">
              {product.sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            className="inbox-btn" 
            onClick={openModal}
          >
            INBOX US
          </button>
          
          <div className="details">
            <h3>Details</h3>
            <ul>
              {product.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;