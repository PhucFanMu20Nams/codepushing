import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './ProductPage.css';
import apiService from '../utils/apiService.js';

// Component to show available products when no products found in current category
function NoProductsFoundWithAlternatives({ currentCategory }) {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products without category filter to show available options
        const data = await apiService.getProducts({ limit: 20 });
        setAvailableProducts(data.data || []);
      } catch (error) {
        console.error('Error fetching available products:', error);
        setAvailableProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableProducts();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
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
    return <div className="loading">Loading available products...</div>;
  }

  // Filter products by category to show relevant products
  const categoryProducts = availableProducts.filter(product => 
    product.category && product.category.toLowerCase() === currentCategory.toLowerCase()
  );

  // Get other category products for "Other Items You Might Like"
  const otherProducts = availableProducts.filter(product => 
    product.category && product.category.toLowerCase() !== currentCategory.toLowerCase()
  );

  return (
    <div className="no-products-section">
      {/* Show category products if any exist */}
      {categoryProducts.length > 0 && (
        <>
          <div className="no-products-header">
            <h2>Available {currentCategory} Products</h2>
            <p>Here are all our {currentCategory.toLowerCase()} items</p>
          </div>
          
          <div className="available-products-grid">
            {categoryProducts.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="available-product-card">
                <div className="available-product-image">
                  <img 
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
                        e.target.src = '/placeholder-image.jpg';
                      }
                    }}
                  />
                </div>
                <div className="available-product-info">
                  <h3 className="available-product-name">{product.name}</h3>
                  <p className="available-product-brand">{product.brand}</p>
                  <p className="available-product-price">
                    {typeof product.price === 'number' 
                      ? product.price.toLocaleString('vi-VN') + ' VND' 
                      : product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      
      {/* Show other products section */}
      {otherProducts.length > 0 && (
        <>
          <div className="no-products-header" style={{ marginTop: categoryProducts.length > 0 ? '60px' : '0' }}>
            <h2>{categoryProducts.length > 0 ? 'Other Items You Might Like' : `No ${currentCategory} Products Found`}</h2>
            <p>{categoryProducts.length > 0 ? 'Explore these featured products from other categories' : 'But here are our featured products you might like'}</p>
          </div>
          
          <div className="available-products-grid">
            {otherProducts.slice(0, 6).map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="available-product-card">
                <div className="available-product-image">
                  <img 
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
                        e.target.src = '/placeholder-image.jpg';
                      }
                    }}
                  />
                </div>
                <div className="available-product-info">
                  <h3 className="available-product-name">{product.name}</h3>
                  <p className="available-product-brand">{product.brand}</p>
                  <p className="available-product-price">
                    {typeof product.price === 'number' 
                      ? product.price.toLocaleString('vi-VN') + ' VND' 
                      : product.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      
      <div className="browse-all-container">
        <Link to="/" className="browse-all-btn">
          BROWSE ALL PRODUCTS
        </Link>
      </div>
    </div>
  );
}

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: [],
    type: [],
    colors: [],
    priceMin: '',
    priceMax: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    types: [],
    colors: [],
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine category based on current path
  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path.includes('/clothes')) return 'Clothing';
    if (path.includes('/footwear')) return 'Footwear';
    if (path.includes('/accessories')) return 'Accessories';
    if (path.includes('/service')) return 'Service';
    return 'Clothing'; // Default
  };

  const currentCategory = getCurrentCategory();

  // Get filter configuration based on category
  const getFilterConfig = () => {
    switch (currentCategory) {
      case 'Clothing':
        return {
          brands: ['Nike', 'Adidas'],
          types: ['T-Shirt', 'Shirt', 'Pants'],
          colors: ['Blue', 'White', 'Beige', 'Khaki']
        };
      case 'Footwear':
        return {
          brands: ['Nike', 'Adidas'],
          types: ['Sneakers'],
          colors: ['White', 'Black/White', 'Grey/White', 'White/Navy']
        };
      case 'Accessories':
        return {
          brands: ['Nike', 'Adidas'],
          types: ['Hat', 'Cap', 'Bag', 'Watch'],
          colors: ['Black', 'White', 'Brown']
        };
      case 'Service':
        return {
          brands: ['Premium', 'Standard'],
          types: ['Cleaning', 'Repair'],
          colors: []
        };
      default:
        return {
          brands: ['Nike', 'Adidas'],
          types: ['Sneakers', 'T-Shirt', 'Shirt', 'Pants'],
          colors: ['Blue', 'White', 'Black/White', 'Grey/White', 'White/Navy', 'Beige', 'Khaki']
        };
    }
  };

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      brand: [],
      type: [],
      colors: [],
      priceMin: '',
      priceMax: ''
    });
    setCurrentPage(1);
    setFilterOptions(getFilterConfig());
  }, [currentCategory]);

  // Fetch products function with useCallback to prevent infinite re-renders
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        category: currentCategory,
        page: currentPage,
        limit: 12
      };

      // Add filter parameters
      if (filters.brand.length) queryParams.brand = filters.brand;
      if (filters.type.length) queryParams.type = filters.type;
      if (filters.colors.length) queryParams.colors = filters.colors;
      if (filters.priceMin) queryParams.priceMin = filters.priceMin;
      if (filters.priceMax) queryParams.priceMax = filters.priceMax;

      const data = await apiService.getProducts(queryParams);
      setProducts(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, filters, currentPage]);

  // Fetch products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (filterType, value, isChecked) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      if (filterType === 'colors') {
        // Handle color filtering
        if (isChecked) {
          updatedFilters.colors = [...prevFilters.colors, value];
        } else {
          updatedFilters.colors = prevFilters.colors.filter(color => color !== value);
        }
      } else {
        // Handle other filter types
        if (isChecked) {
          updatedFilters[filterType] = [...prevFilters[filterType], value];
        } else {
          updatedFilters[filterType] = prevFilters[filterType].filter(item => item !== value);
        }
      }
      
      return updatedFilters;
    });
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
                      onChange={(e) => handleFilterChange('brand', brand, e.target.checked)} 
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
                      onChange={(e) => handleFilterChange('type', type, e.target.checked)} 
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Colors</h3>
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
                      checked={filters.colors.includes(color)}
                      onChange={(e) => handleFilterChange('colors', color, e.target.checked)} 
                    />
                    <span>{color}</span>
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
              <NoProductsFoundWithAlternatives currentCategory={currentCategory} />
            ) : (
              products.map((product) => (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="product-image">
                    <img 
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
                          e.target.src = '/placeholder-image.jpg';
                        }
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
