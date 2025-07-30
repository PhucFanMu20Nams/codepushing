import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import apiService from '../utils/apiService.js';

function Header() {
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      setIsLoading(true);
      setShowResults(true);
      fetchSearchResults(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const fetchSearchResults = async (query) => {
    try {
      const data = await apiService.searchProducts(query, { limit: 5 });
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleViewMoreClick = () => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowResults(false);
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Get API URL from environment
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo farro-font">
          <Link to="/">TEXTURA</Link>
        </div>
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item montserrat-font">
              <Link to="/clothes" className="nav-link">
                Clothes
              </Link>
            </li>
            <li className="nav-item montserrat-font">
              <Link to="/footwear" className="nav-link">
                Footwear
              </Link>
            </li>
            <li className="nav-item montserrat-font">
              <Link to="/accessories" className="nav-link">
                Accessories
              </Link>
            </li>
            <li className="nav-item montserrat-font">
              <Link to="/service" className="nav-link">
                Service
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Search functionality */}
        <div className="header-icons">
          <div className="search-container" ref={searchRef}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={() => searchTerm.length > 1 && setShowResults(true)}
            />
            <a href="#" className="icon-link search-icon" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </a>

            {/* Search results dropdown */}
            {showResults && (
              <div className="header-search-results">
                <h3 className="search-results-title">PRODUCTS</h3>
                {isLoading ? (
                  <div className="search-loading">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="no-search-results">No products found</div>
                ) : (
                  <>
                    <ul className="header-product-results">
                      {searchResults.map(product => (
                        <li 
                          key={product.id || product._id} 
                          className="header-product-result-item"
                          onClick={() => handleProductClick(product.id || product._id)}
                        >
                          <div className="header-product-result-image">
                            <img src={getImageUrl(product.image)} alt={product.name} />
                          </div>
                          <div className="header-product-result-details">
                            <div className="header-product-result-category">
                              {product.category} {product.subcategory}
                            </div>
                            <div className="header-product-result-name">{product.name}</div>
                            <div className="header-product-result-price">
                              {formatPrice(product.price)} VND
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="header-view-more-container">
                      <button 
                        className="header-view-more-btn"
                        onClick={handleViewMoreClick}
                      >
                        View More
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;