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
        setAvailableProducts(data.products || []);
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
    return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
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
              <Link to={`/product/${product.id}`} key={product.id} className="available-product-card">
                <div className="available-product-image">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
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
              <Link to={`/product/${product.id}`} key={product.id} className="available-product-card">
                <div className="available-product-image">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
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

  // Fetch products function with useCallback to prevent infinite re-renders
  const fetchProducts = useCallback(async () => {
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

      // First try with all filters
      let data = await apiService.getProducts(params);
      
      // If no products found, try frontend filtering as fallback
      if (!data.products || data.products.length === 0) {
        // Fetch all products and filter on frontend
        const allProductsData = await apiService.getProducts({ page: 1, limit: 100 });
        
        if (allProductsData.products) {
          let filteredProducts = allProductsData.products;
          
          // Apply category filter
          filteredProducts = filteredProducts.filter(product => 
            product.category && product.category.toLowerCase() === currentCategory.toLowerCase()
          );
          
          // Apply brand filter
          if (filters.brand.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
              product.brand && filters.brand.some(brand => 
                product.brand.toLowerCase().includes(brand.toLowerCase())
              )
            );
          }
          
          // Apply type filter
          if (filters.type.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
              product.type && filters.type.some(type => 
                product.type.toLowerCase().includes(type.toLowerCase())
              )
            );
          }
          
          // Apply color filter
          if (filters.color.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
              product.color && filters.color.some(color => 
                product.color.toLowerCase().includes(color.toLowerCase())
              )
            );
          }
          
          // Apply price range filter
          if (filters.priceMin) {
            const minPrice = parseInt(filters.priceMin);
            filteredProducts = filteredProducts.filter(product => 
              product.price >= minPrice
            );
          }
          
          if (filters.priceMax) {
            const maxPrice = parseInt(filters.priceMax);
            filteredProducts = filteredProducts.filter(product => 
              product.price <= maxPrice
            );
          }
          
          // Apply pagination manually
          const startIndex = (currentPage - 1) * 6;
          const endIndex = startIndex + 6;
          const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
          
          data = {
            products: paginatedProducts,
            total: filteredProducts.length
          };
        }
      }
      
      setProducts(data.products || []);
      setTotalPages(Math.ceil((data.total || 0) / 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentPage, filters]);

  // Fetch products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
              <NoProductsFoundWithAlternatives currentCategory={currentCategory} />
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
