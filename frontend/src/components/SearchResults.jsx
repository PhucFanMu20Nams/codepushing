import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './SearchResults.css';
import apiService from '../utils/apiService.js';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query, page]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const data = await apiService.searchProducts(query, { page, limit: 12 });
      setProducts(data.data || []);
      setTotalPages(data.pagination?.pages || 0);
      setTotalResults(data.pagination?.total || 0);
    } catch (error) {
      console.error('Search results error:', error);
      setProducts([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  return (
    <div className="search-results-page">
      <div className="container">
        <h1 className="search-page-title">
          Search Results for "<span>{query}</span>"
        </h1>
        <p className="search-results-count">{totalResults} products found</p>

        {loading ? (
          <div className="loading-indicator">Loading results...</div>
        ) : products.length === 0 ? (
          <div className="no-results-found">
            <p>No products found matching your search.</p>
            <p>Please try a different search term or browse our categories.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(product => (
                <Link to={`/product/${product.id || product._id}`} key={product.id || product._id} className="product-card">
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.src = '/placeholder-image.jpg'; // Fallback
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

            {totalPages > 1 && (
              <div className="pagination">
                {page > 1 && (
                  <button onClick={() => setPage(page - 1)} className="pagination-btn prev">
                    Previous
                  </button>
                )}
                
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                
                {page < totalPages && (
                  <button onClick={() => setPage(page + 1)} className="pagination-btn next">
                    Next
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;