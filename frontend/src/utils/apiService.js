/**
 * API service with integrated client-side caching
 * Handles all API calls with automatic caching and cache invalidation
 */

import cacheManager from './cacheManager.js';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  /**
   * Generic fetch with caching
   */
  async fetchWithCache(url, options = {}, cacheType = null, cacheParams = {}) {
    // Check cache first for GET requests
    if ((!options.method || options.method === 'GET') && cacheType) {
      const cached = cacheManager.get(cacheType, cacheParams);
      if (cached) {
        // Silent cache hit - no console logs for users
        return cached;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache successful GET responses silently
      if ((!options.method || options.method === 'GET') && cacheType) {
        cacheManager.set(cacheType, data, cacheParams);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all products with caching
   */
  async getProducts(params = {}) {
    // Handle array parameters properly
    const processedParams = { ...params };
    
    // Convert arrays to single values for the API
    if (Array.isArray(processedParams.brand) && processedParams.brand.length === 1) {
      processedParams.brand = processedParams.brand[0];
    } else if (Array.isArray(processedParams.brand) && processedParams.brand.length === 0) {
      delete processedParams.brand;
    }
    
    if (Array.isArray(processedParams.type) && processedParams.type.length === 1) {
      processedParams.type = processedParams.type[0];
    } else if (Array.isArray(processedParams.type) && processedParams.type.length === 0) {
      delete processedParams.type;
    }
    
    if (Array.isArray(processedParams.colors) && processedParams.colors.length === 1) {
      processedParams.color = processedParams.colors[0]; // Note: backend expects 'color', not 'colors'
      delete processedParams.colors;
    } else if (Array.isArray(processedParams.colors) && processedParams.colors.length === 0) {
      delete processedParams.colors;
    }

    const queryParams = new URLSearchParams(processedParams).toString();
    const url = `${this.baseURL}/products${queryParams ? `?${queryParams}` : ''}`;
    
    return this.fetchWithCache(
      url,
      {},
      'products',
      { query: queryParams }
    );
  }

  /**
   * Get product by ID with caching
   */
  async getProductById(productId) {
    const url = `${this.baseURL}/products/${productId}`;
    
    return this.fetchWithCache(
      url,
      {},
      'productDetail',
      { id: productId }
    );
  }

  /**
   * Search products with caching
   */
  async searchProducts(query, params = {}) {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    const url = `${this.baseURL}/products/search?${queryString}`;
    
    return this.fetchWithCache(
      url,
      {},
      'search',
      { query: query, params: JSON.stringify(params) }
    );
  }

  /**
   * Create product (admin only) - invalidates cache
   */
  async createProduct(productData, token) {
    const url = `${this.baseURL}/products`;
    
    const result = await this.fetchWithCache(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      }
    );

    // Invalidate relevant caches
    this.invalidateProductCaches();
    
    return result;
  }

  /**
   * Update product (admin only) - invalidates cache
   */
  async updateProduct(productId, productData, token) {
    const url = `${this.baseURL}/products/${productId}`;
    
    const result = await this.fetchWithCache(
      url,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      }
    );

    // Invalidate relevant caches
    this.invalidateProductCaches(productId);
    
    return result;
  }

  /**
   * Delete product (admin only) - invalidates cache
   */
  async deleteProduct(productId, token) {
    const url = `${this.baseURL}/products/${productId}`;
    
    const result = await this.fetchWithCache(
      url,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Invalidate relevant caches
    this.invalidateProductCaches(productId);
    
    return result;
  }

  /**
   * Upload product with images (admin only) - invalidates cache
   */
  async uploadProductWithImages(formData, token) {
    const url = `${this.baseURL}/products/upload`;
    
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // FormData, don't set Content-Type
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();

    // Invalidate relevant caches
    this.invalidateProductCaches();
    
    return data;
  }

  /**
   * Invalidate product-related caches
   */
  invalidateProductCaches(productId = null) {
    // Clear all product listing caches
    cacheManager.clearType('products');
    
    // Clear search caches
    cacheManager.clearType('search');
    
    // Clear specific product cache if ID provided
    if (productId) {
      cacheManager.delete('productDetail', { id: productId });
    } else {
      // Clear all product detail caches
      cacheManager.clearType('productDetail');
    }
    
    // Only log for admin users - silent for regular users
    if (window.location.pathname.startsWith('/admin')) {
      console.log('Product caches invalidated', productId ? `for product: ${productId}` : '(all)');
    }
  }

  /**
   * Preload popular/frequently accessed data
   */
  async preloadData() {
    try {
      // Preload first page of products
      await this.getProducts({ page: 1, limit: 12 });
      
      // Preload men's products (if it's a popular category)
      await this.getProducts({ category: 'Men', page: 1, limit: 6 });
      
      // Only log for admin users
      if (window.location.pathname.startsWith('/admin')) {
        console.log('Data preloaded successfully');
      }
    } catch (error) {
      // Silent for regular users, only warn for admin
      if (window.location.pathname.startsWith('/admin')) {
        console.warn('Failed to preload data:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    // Get client-side stats
    const clientStats = cacheManager.getStats();
    
    try {
      // Get server-side stats if user is admin (has token)
      const token = localStorage.getItem('token');
      if (token) {
        const url = `${this.baseURL}/cache/stats`;
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const { stats: serverStats } = await response.json();
          
          // Combine client and server stats
          return {
            client: clientStats,
            server: serverStats
          };
        }
      }
      
      // If server stats couldn't be fetched, just return client stats
      return {
        client: clientStats,
        server: null
      };
    } catch (error) {
      console.error('Error fetching server cache stats:', error);
      return {
        client: clientStats,
        server: null
      };
    }
  }

  /**
   * Clear all caches (both client and server if admin)
   */
  async clearAllCaches() {
    // Clear client-side cache
    cacheManager.clearAll();
    
    try {
      // Clear server-side cache if user is admin (has token)
      const token = localStorage.getItem('token');
      if (token) {
        const url = `${this.baseURL}/cache/clear`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          console.log('Server-side cache cleared successfully');
        }
      }
    } catch (error) {
      console.error('Error clearing server cache:', error);
    }
    
    return true;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
