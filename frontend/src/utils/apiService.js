/**
 * API service with integrated client-side caching
 * Handles all API calls with automatic caching and cache invalidation
 */

import cacheManager from './cacheManager.js';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.cacheManager = cacheManager; // Expose cache manager for debugging
  }

  /**
   * Generic fetch with caching
   */
  async fetchWithCache(url, options = {}, cacheType = null, cacheParams = {}) {
    console.log('fetchWithCache called:', { url, cacheType, cacheParams });
    
    // Check cache first for GET requests
    if ((!options.method || options.method === 'GET') && cacheType) {
      const cached = cacheManager.get(cacheType, cacheParams);
      if (cached) {
        console.log('Cache hit for:', { url, cacheType });
        return cached;
      } else {
        console.log('Cache miss for:', { url, cacheType });
      }
    }

    try {
      console.log('Making API request to:', url);
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      console.log('Response status:', response.status, 'for', url);

      if (!response.ok) {
        console.error('Response not ok:', response.status, 'for', url);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data for', url, ':', data);

      // Cache successful GET responses
      if ((!options.method || options.method === 'GET') && cacheType) {
        cacheManager.set(cacheType, data, cacheParams);
        console.log('Cached response for:', { url, cacheType });
      }

      return data;
    } catch (error) {
      console.error('API request failed for', url, ':', error);
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
   * Get field options for dropdowns with caching
   */
  async getFieldOptions() {
    const url = `${this.baseURL}/products/field-options`;
    
    return this.fetchWithCache(
      url,
      {},
      'fieldOptions'
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
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Invalidate relevant caches
      this.invalidateProductCaches(productId);
      
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product (admin only) - invalidates cache
   */
  async deleteProduct(productId, token) {
    const url = `${this.baseURL}/products/${productId}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Invalidate relevant caches
      this.invalidateProductCaches(productId);
      
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
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
   * Update product with images (admin only) - invalidates cache
   */
  async updateProductWithImages(productId, formData, token) {
    const url = `${this.baseURL}/products/${productId}/images`;
    
    console.log('=== API SERVICE DEBUG ===');
    console.log('URL:', url);
    console.log('ProductId:', productId);
    console.log('Token:', token ? `${token.substring(0, 10)}...` : 'NO TOKEN');
    console.log('FormData entries:');
    
    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    try {
      console.log('Making request...');
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData, don't set Content-Type
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Failed to parse error response as JSON:', parseError);
          // Try to get text content for better error reporting
          try {
            const errorText = await response.text();
            console.log('Raw error response:', errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.warn('Failed to get error response as text:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Invalidate relevant caches
      this.invalidateProductCaches(productId);
      
      return data;
    } catch (error) {
      console.error('Error updating product with images:', error);
      throw error;
    }
  }

  /**
   * Invalidate product-related caches
   */
  invalidateProductCaches(productId = null) {
    // Clear all product listing caches
    cacheManager.clearType('products');
    
    // Clear search caches
    cacheManager.clearType('search');
    
    // Clear specific product detail cache if productId provided
    if (productId) {
      cacheManager.clearType('productDetail', { productId });
    } else {
      // Clear all product detail caches
      cacheManager.clearType('productDetail');
    }
    
    // Use enhanced invalidation for product updates
    if (cacheManager.invalidateProductUpdate) {
      cacheManager.invalidateProductUpdate(productId);
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

  /**
   * Get field options for dropdowns
   */
  async getFieldOptions() {
    const url = `${this.baseURL}/products/field-options`;
    return this.fetchWithCache(url, {}, 'fieldOptions');
  }

  /**
   * Get category-specific field options
   */
  async getCategorySpecificOptions(category) {
    if (!category) {
      throw new Error('Category parameter is required');
    }
    
    const url = `${this.baseURL}/products/category-options/${encodeURIComponent(category)}`;
    
    try {
      const response = await this.fetchWithCache(url, {}, 'categoryOptions', { category });
      
      // Validate response structure
      if (!response.success || !response.data) {
        throw new Error('Invalid response structure from category options API');
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching category options for ${category}:`, error);
      
      // Return fallback empty options structure
      return {
        success: false,
        error: error.message,
        data: {
          category,
          brands: [],
          types: [],
          colors: [],
          styles: [],
          subcategories: []
        }
      };
    }
  }

  /**
   * Get all category options
   */
  async getAllCategoryOptions() {
    const url = `${this.baseURL}/products/category-options`;
    
    try {
      const response = await this.fetchWithCache(url, {}, 'allCategoryOptions');
      
      // Validate response structure
      if (!response.success || !response.data) {
        throw new Error('Invalid response structure from all category options API');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching all category options:', error);
      
      // Return fallback empty structure
      return {
        success: false,
        error: error.message,
        data: {
          categories: [],
          categoryOptions: {}
        }
      };
    }
  }

  /**
   * Get filter options for multiple categories (batch request optimization)
   */
  async getMultipleCategoryOptions(categories) {
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('Categories must be a non-empty array');
    }

    try {
      // For now, make individual requests - can be optimized later with a batch API
      const results = await Promise.all(
        categories.map(category => this.getCategorySpecificOptions(category))
      );
      
      const categoryOptionsMap = {};
      categories.forEach((category, index) => {
        if (results[index].success) {
          categoryOptionsMap[category] = results[index].data;
        }
      });
      
      return {
        success: true,
        data: categoryOptionsMap
      };
    } catch (error) {
      console.error('Error fetching multiple category options:', error);
      throw error;
    }
  }

  /**
   * Clear category options cache (useful when products are updated)
   */
  clearCategoryOptionsCache(category = null) {
    if (category) {
      cacheManager.invalidate('categoryOptions', { category });
      console.log(`Cleared cache for category: ${category}`);
    } else {
      cacheManager.invalidate('categoryOptions');
      cacheManager.invalidate('allCategoryOptions');
      console.log('Cleared all category options cache');
    }
  }

  /**
   * Preload category options for better UX
   */
  async preloadCategoryOptions(categories) {
    if (!Array.isArray(categories)) {
      categories = ['Clothing', 'Footwear', 'Accessories', 'Service'];
    }
    
    console.log('Preloading category options for:', categories);
    
    // Load in background without blocking
    Promise.all(
      categories.map(category => 
        this.getCategorySpecificOptions(category).catch(error => {
          console.warn(`Failed to preload options for ${category}:`, error);
          return null;
        })
      )
    ).then(results => {
      console.log('Category options preloading completed');
    });
  }

  /**
   * Category Management API Methods
   */
  
  /**
   * Get all categories
   */
  async getCategories() {
    const url = `${this.baseURL}/categories`;
    
    return this.fetchWithCache(
      url,
      {},
      'categories'
    );
  }

  /**
   * Alias for getCategories - for backward compatibility
   */
  async getAllCategories() {
    return this.getCategories();
  }

  /**
   * Create category (admin only) - invalidates cache
   */
  async createCategory(categoryData, token) {
    const url = `${this.baseURL}/categories`;
    
    const result = await this.fetchWithCache(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryData)
      }
    );
    
    // Invalidate all category-related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('fieldOptions');
    
    return result;
  }

  /**
   * Get specific category options
   */
  async getCategoryOptions(categoryName) {
    const url = `${this.baseURL}/categories/${encodeURIComponent(categoryName)}`;
    return this.fetchWithCache(url, {}, 'categoryOptions', { category: categoryName });
  }

  /**
   * Get specific field options for a category
   */
  async getCategoryFieldOptions(categoryName, field) {
    const url = `${this.baseURL}/categories/${encodeURIComponent(categoryName)}/options/${encodeURIComponent(field)}`;
    return this.fetchWithCache(url, {}, 'fieldOptions', { category: categoryName, field });
  }

  /**
   * Create or update category configuration (Admin only)
   */
  async createOrUpdateCategory(categoryData, token) {
    const url = `${this.baseURL}/categories`;
    const response = await this.fetchWithCache(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });

    // Invalidate related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('categoryOptions');
    cacheManager.invalidate('fieldOptions');
    cacheManager.invalidate('products');

    return response;
  }

  /**
   * Update category options (Admin only)
   */
  async updateCategoryOptions(categoryName, updates, token) {
    const url = `${this.baseURL}/categories/${encodeURIComponent(categoryName)}`;
    const response = await this.fetchWithCache(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    // Invalidate related caches
    cacheManager.invalidate('categoryOptions', { category: categoryName });
    cacheManager.invalidate('fieldOptions', { category: categoryName });
    cacheManager.invalidate('products');

    return response;
  }

  /**
   * Add option to specific category field (Admin only)
   */
  async addCategoryOption(categoryId, field, option, token) {
    const url = `${this.baseURL}/categories/${categoryId}/options`;
    const response = await this.fetchWithCache(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ field, option })
    });

    // Invalidate related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('categoryOptions');
    cacheManager.invalidate('fieldOptions');
    cacheManager.invalidate('products');

    return response;
  }

  /**
   * Remove option from specific category field (Admin only)
   */
  async removeCategoryOption(categoryId, field, option, token) {
    const url = `${this.baseURL}/categories/${categoryId}/options`;
    const response = await this.fetchWithCache(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ field, option })
    });

    // Invalidate related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('categoryOptions');
    cacheManager.invalidate('fieldOptions');
    cacheManager.invalidate('products');

    return response;
  }

  /**
   * Toggle category active status (Admin only)
   */
  async toggleCategoryStatus(categoryName, token) {
    const url = `${this.baseURL}/categories/${encodeURIComponent(categoryName)}/toggle`;
    const response = await this.fetchWithCache(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Invalidate related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('categoryOptions', { category: categoryName });
    cacheManager.invalidate('products');

    return response;
  }

  /**
   * Initialize default categories (Admin only)
   */
  async initializeDefaultCategories(token) {
    const url = `${this.baseURL}/categories/initialize`;
    const response = await this.fetchWithCache(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Invalidate all related caches
    cacheManager.invalidate('categories');
    cacheManager.invalidate('categoryOptions');
    cacheManager.invalidate('fieldOptions');

    return response;
  }
}

// Create singleton instance
const apiService = new ApiService();

// Make available globally for debugging (development only)
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}

export default apiService;
