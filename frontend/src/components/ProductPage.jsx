import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProductPage.css';
import apiService from '../utils/apiService.js';

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: [],
    type: [],
    color: [],
    style: [],
    priceMin: '',
    priceMax: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    types: [],
    colors: [],
    styles: []
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine category based on current path
  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path.includes('/clothes')) return 'Clothes';
    if (path.includes('/footwear')) return 'Footwear';
    if (path.includes('/accessories')) return 'Accessories';
    if (path.includes('/service')) return 'Service';
    return 'Clothes'; // Default
  };

  const currentCategory = getCurrentCategory();

  // Get filter configuration based on category
  const getFilterConfig = () => {
    switch (currentCategory) {
      case 'Clothes':
        return {
          brands: ['Nike', 'Adidas', 'Lacoste', 'Ralph Lauren', 'Zara', 'H&M', 'Uniqlo'],
          types: ['T-Shirt', 'Shirt', 'Polo', 'Blazer', 'Hoodie', 'Sweater', 'Jacket'],
          colors: ['Black', 'White', 'Gray', 'Navy', 'Brown', 'Red', 'Blue', 'Green'],
          styles: ['Business', 'Casual', 'Streetwear', 'Sport', 'Formal', 'Smart Casual']
        };
      case 'Footwear':
        return {
          brands: ['Nike', 'Adidas', 'Converse', 'Vans', 'New Balance', 'Puma', 'Jordan'],
          types: ['Sneaker', 'Running', 'Basketball', 'Casual', 'Formal', 'Boots', 'Sandals'],
          colors: ['Black', 'White', 'Gray', 'Brown', 'Navy', 'Red', 'Blue', 'Multi'],
          styles: ['Sport', 'Casual', 'Retro', 'Modern', 'Classic', 'Street']
        };
      case 'Accessories':
        return {
          brands: ['Nike', 'Adidas', 'Supreme', 'Champion', 'Calvin Klein', 'Tommy Hilfiger'],
          types: ['Hat', 'Cap', 'Bag', 'Backpack', 'Watch', 'Sunglasses', 'Belt', 'Wallet'],
          colors: ['Black', 'White', 'Brown', 'Navy', 'Gray', 'Red', 'Green', 'Multi'],
          styles: ['Casual', 'Sport', 'Luxury', 'Streetwear', 'Vintage', 'Modern']
        };
      case 'Service':
        return {
          brands: ['Premium', 'Standard', 'Express', 'Custom'],
          types: ['Cleaning', 'Repair', 'Alteration', 'Styling', 'Consultation', 'Maintenance'],
          colors: [], // Services might not have colors
          styles: ['Professional', 'Casual', 'Express', 'Premium', 'Standard']
        };
      default:
        return {
          brands: [],
          types: [],
          colors: [],
          styles: []
        };
    }
  };

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      brand: [],
      type: [],
      color: [],
      style: [],
      priceMin: '',
      priceMax: ''
    });
    setCurrentPage(1);
    setFilterOptions(getFilterConfig());
  }, [currentCategory]);

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage, location.pathname]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: currentCategory,
        page: currentPage,
        limit: 6
      };

      // Add array filters
      if (filters.brand.length > 0) {
        params.brand = filters.brand.join(',');
      }
      if (filters.type.length > 0) {
        params.type = filters.type.join(',');
      }
      if (filters.color.length > 0) {
        params.color = filters.color.join(',');
      }
      if (filters.style.length > 0) {
        params.style = filters.style.join(',');
      }
      if (filters.priceMin) {
        params.minPrice = filters.priceMin;
      }
      if (filters.priceMax) {
        params.maxPrice = filters.priceMax;
      }

      const data = await apiService.getProducts(params);
      
      setProducts(data.products || []);
      setTotalPages(Math.ceil((data.total || 0) / 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value, isChecked) => {
    setFilters(prev => {
      if (filterType === 'priceMin' || filterType === 'priceMax') {
        // Only allow numbers for price inputs
        const numericValue = value.replace(/[^0-9]/g, '');
        return {
          ...prev,
          [filterType]: numericValue
        };
      }
      
      // Handle array filters (brand, type, color, style)
      const currentArray = prev[filterType] || [];
      let newArray;
      
      if (isChecked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [filterType]: newArray
      };
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Add separate handler for price inputs
  const handlePriceChange = (filterType, value) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setFilters(prev => ({
      ...prev,
      [filterType]: numericValue
    }));
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="product-page">
      <div className="product-page-layout">
        {/* Left Sidebar - Filters */}
        <aside className="product-page-sidebar">
          <div className="sidebar-content">
            <div className="category-breadcrumb">
              <span>Category / {currentCategory}</span>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Brand</h3>
              <div className="search-box">
                <input type="text" placeholder="Search brands..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                {filterOptions.brands.map(brand => (
                  <label key={brand} className="filter-option">
                    <input 
                      type="checkbox" 
                      value={brand} 
                      checked={filters.brand.includes(brand)}
                      onChange={(e) => handleFilterChange('brand', e.target.value, e.target.checked)} 
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Type</h3>
              <div className="search-box">
                <input type="text" placeholder="Search types..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                {filterOptions.types.map(type => (
                  <label key={type} className="filter-option">
                    <input 
                      type="checkbox" 
                      value={type} 
                      checked={filters.type.includes(type)}
                      onChange={(e) => handleFilterChange('type', e.target.value, e.target.checked)} 
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter - Only show if colors exist for this category */}
            {filterOptions.colors.length > 0 && (
              <div className="filter-group">
                <h3 className="filter-heading">Color</h3>
                <div className="search-box">
                  <input type="text" placeholder="Search colors..." />
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <div className="filter-options">
                  {filterOptions.colors.map(color => (
                    <label key={color} className="filter-option">
                      <input 
                        type="checkbox" 
                        value={color} 
                        checked={filters.color.includes(color)}
                        onChange={(e) => handleFilterChange('color', e.target.value, e.target.checked)} 
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Style Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Style</h3>
              <div className="search-box">
                <input type="text" placeholder="Search styles..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                {filterOptions.styles.map(style => (
                  <label key={style} className="filter-option">
                    <input 
                      type="checkbox" 
                      value={style} 
                      checked={filters.style.includes(style)}
                      onChange={(e) => handleFilterChange('style', e.target.value, e.target.checked)} 
                    />
                    <span>{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Price</h3>
              <div className="price-range">
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="From"
                  value={filters.priceMin}
                  onChange={(e) => handlePriceChange('priceMin', e.target.value)}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
                <span>-</span>
                <input 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="To"
                  value={filters.priceMax}
                  onChange={(e) => handlePriceChange('priceMax', e.target.value)}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="product-page-main">
          {/* Header Section */}
          <div className="page-header">
            <h1 className="page-title">{currentCategory.toUpperCase()}</h1>
            <div className="instagram-promo">
              <div className="promo-text">
                <p>Direct to our Instagram</p>
                <p>to see more outfits</p>
              </div>
              <div className="promo-image">
                <img src="/assets/images/cta-banner.jpg" alt="Instagram promo" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand}</p>
                    <p className="product-price">{formatPrice(product.price)} VND</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="next-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                NEXT &gt;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProductPage;
