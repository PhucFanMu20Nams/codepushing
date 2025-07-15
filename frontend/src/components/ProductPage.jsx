import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useFilter } from '../context/FilterContext';
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
  const { getFiltersForCategory, loading: filterContextLoading, lastUpdated } = useFilter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '', // Changed to string for single selection
    type: '',  // Changed to string for single selection
    colors: [],
    priceMin: '',
    priceMax: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Determine category based on current path
  // Map category names for compatibility
  const getCategoryMappedName = (category) => {
    switch (category) {
      case 'Clothing': return 'Clothes';
      case 'Footwear': return 'Footwear';
      case 'Accessories': return 'Accessories';
      default: return 'Clothes';
    }
  };

  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path.includes('/clothes')) return 'Clothing';
    if (path.includes('/footwear')) return 'Footwear';
    if (path.includes('/accessories')) return 'Accessories';
    if (path.includes('/service')) return 'Service';
    return 'Clothing'; // Default
  };

  const currentCategory = getCurrentCategory();
  const mappedCategoryName = getCategoryMappedName(currentCategory);
  
  // Get filter options from context
  const filterOptions = getFiltersForCategory(mappedCategoryName);

  // Reset filters when category changes
  useEffect(() => {
    setFilters({
      brand: '', // Reset to empty string for single selection
      type: '',  // Reset to empty string for single selection
      colors: [],
      priceMin: '',
      priceMax: ''
    });
    setCurrentPage(1);
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
      if (filters.brand) queryParams.brand = filters.brand; // Single brand
      if (filters.type) queryParams.type = filters.type;    // Single type
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

  // Preload category options for better UX (run once on mount)
  useEffect(() => {
    const preloadCategories = ['Clothing', 'Footwear', 'Accessories', 'Service'];
    const categoriesToPreload = preloadCategories.filter(cat => cat !== currentCategory);
    
    if (categoriesToPreload.length > 0) {
      // Enhanced preload with performance monitoring
      const preloadStart = performance.now();
      apiService.preloadCategoryOptions(categoriesToPreload).then(() => {
        const preloadTime = performance.now() - preloadStart;
        console.log(`Category options preloaded in ${preloadTime.toFixed(2)}ms`);
      });
    }
  }, []); // Run only once on mount

  const handleFilterChange = (filterType, value, isChecked) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      
      if (filterType === 'colors') {
        // Handle color filtering - multiple selection
        if (isChecked) {
          updatedFilters.colors = [...prevFilters.colors, value];
        } else {
          updatedFilters.colors = prevFilters.colors.filter(color => color !== value);
        }
      } else if (filterType === 'brand' || filterType === 'type') {
        // Handle single-choice filters (brand, type)
        // If clicking on already selected item, deselect it; otherwise select the new one
        updatedFilters[filterType] = prevFilters[filterType] === value ? '' : value;
      }
      
      return updatedFilters;
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

  // Batch optimization: Load all categories at once on first visit
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('filterOptionsLoaded');
    
    if (!hasVisited) {
      const loadAllCategories = async () => {
        try {
          console.log('First visit detected - loading all category options...');
          const startTime = performance.now();
          
          const response = await apiService.getAllCategoryOptions();
          if (response.success) {
            console.log('All category options loaded:', response.data);
            
            // Cache individual category options for faster access
            const { categoryOptions } = response.data;
            Object.entries(categoryOptions).forEach(([category, options]) => {
              // Pre-populate individual category caches
              const cacheKey = `categoryOptions_${category}`;
              sessionStorage.setItem(cacheKey, JSON.stringify({
                success: true,
                data: { category, ...options }
              }));
            });
            
            sessionStorage.setItem('filterOptionsLoaded', 'true');
            
            const loadTime = performance.now() - startTime;
            console.log(`All category options cached in ${loadTime.toFixed(2)}ms`);
          }
        } catch (error) {
          console.warn('Failed to batch load category options:', error);
        }
      };
      
      loadAllCategories();
    }
  }, []); // Run only once on mount

  return (
    <div className="product-page">
      <div className="product-page-layout">
        {/* Left Sidebar - Filters */}
        <aside className="product-page-sidebar">
          <div className="sidebar-content">
            <div className="category-breadcrumb">
              <span>Category / {currentCategory}</span>
              <button 
                onClick={() => {
                  console.log('Manual refresh triggered');
                  window.dispatchEvent(new CustomEvent('categoryUpdated', { detail: { manual: true } }));
                }}
                style={{ 
                  marginLeft: '10px', 
                  padding: '4px 8px', 
                  fontSize: '12px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Filters
              </button>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Brand</h3>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>
                Debug: {filterOptions.brands.length} brands loaded | Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
              </div>
              <div className="search-box">
                <input type="text" placeholder="Search brands..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              
              {/* Loading State */}
              {filterContextLoading ? (
                <div className="filter-loading">
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </div>
              ) : filterOptions.brands.length === 0 ? (
                /* Empty State */
                <div className="filter-empty">
                  <p className="empty-message">No brands available for {currentCategory}</p>
                </div>
              ) : (
                /* Normal State */
                <div className="filter-options">
                  {filterOptions.brands.map(brand => (
                    <label key={brand} className="filter-option">
                      <input 
                        type="checkbox" 
                        value={brand} 
                        checked={filters.brand === brand}
                        onChange={() => handleFilterChange('brand', brand, true)} 
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              )}
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
              
              {/* Loading State */}
              {filterContextLoading ? (
                <div className="filter-loading">
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </div>
              ) : filterOptions.types.length === 0 ? (
                /* Empty State */
                <div className="filter-empty">
                  <p className="empty-message">No types available for {currentCategory}</p>
                </div>
              ) : (
                /* Normal State */
                <div className="filter-options">
                  {filterOptions.types.map(type => (
                    <label key={type} className="filter-option">
                      <input 
                        type="checkbox" 
                        value={type} 
                        checked={filters.type === type}
                        onChange={() => handleFilterChange('type', type, true)} 
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              )}
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
              
              {/* Loading State */}
              {filterContextLoading ? (
                <div className="filter-loading">
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </div>
              ) : filterOptions.colors.length === 0 ? (
                /* Empty State */
                <div className="filter-empty">
                  <p className="empty-message">No colors available for {currentCategory}</p>
                </div>
              ) : (
                /* Normal State */
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
              )}
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
