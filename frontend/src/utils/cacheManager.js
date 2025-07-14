/**
 * Client-side caching utility for API responses and product data
 * Implements Local Storage caching with expiration times
 */

class CacheManager {
  constructor() {
    this.cacheTTL = {
      products: 60 * 60 * 1000, // 1 hour for product listings
      productDetail: 30 * 60 * 1000, // 30 minutes for individual products
      search: 15 * 60 * 1000, // 15 minutes for search results
      categories: 2 * 60 * 60 * 1000 // 2 hours for categories
    };
  }

  /**
   * Generate cache key for different types of data
   */
  generateKey(type, params = {}) {
    const paramsString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `textura_cache_${type}_${btoa(paramsString)}`;
  }

  /**
   * Store data in localStorage with expiration
   */
  set(type, data, params = {}) {
    try {
      const key = this.generateKey(type, params);
      const ttl = this.cacheTTL[type] || this.cacheTTL.products;
      
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        expires: Date.now() + ttl
      };

      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Clean up old cache entries periodically
      this.cleanup();
      
      return true;
    } catch (error) {
      // Silent for users, only warn for admin
      if (window.location.pathname.startsWith('/admin')) {
        console.warn('Cache set failed:', error);
      }
      return false;
    }
  }

  /**
   * Retrieve data from localStorage if not expired
   */
  get(type, params = {}) {
    try {
      const key = this.generateKey(type, params);
      const cached = localStorage.getItem(key);
      
      if (!cached) {
        return null;
      }

      const cacheData = JSON.parse(cached);
      
      // Check if cache has expired
      if (Date.now() > cacheData.expires) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      // Silent for users, only warn for admin
      if (window.location.pathname.startsWith('/admin')) {
        console.warn('Cache get failed:', error);
      }
      return null;
    }
  }

  /**
   * Clear specific cache entry
   */
  delete(type, params = {}) {
    try {
      const key = this.generateKey(type, params);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Cache delete failed:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries for a specific type
   */
  clearType(type) {
    try {
      const prefix = `textura_cache_${type}_`;
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Cache clearType failed:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('textura_cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Cache clearAll failed:', error);
      return false;
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanup() {
    try {
      const keysToRemove = [];
      const now = Date.now();
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('textura_cache_')) {
          try {
            const cached = localStorage.getItem(key);
            const cacheData = JSON.parse(cached);
            
            if (now > cacheData.expires) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // Invalid cache entry, remove it
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('textura_cache_')) {
        totalEntries++;
        const value = localStorage.getItem(key);
        totalSize += value.length;
        
        try {
          const cacheData = JSON.parse(value);
          if (now > cacheData.expires) {
            expiredEntries++;
          }
        } catch (e) {
          expiredEntries++;
        }
      }
    }

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      totalSizeKB: Math.round(totalSize / 1024)
    };
  }

  /**
   * Invalidate cache for product updates
   * Enhanced for real-time updates
   */
  invalidateProductUpdate(productId = null) {
    try {
      // Clear all product-related caches when a product is updated
      this.clearType('products');
      this.clearType('search');
      
      // Clear specific product detail cache if productId provided
      if (productId) {
        this.clearType('productDetail', { productId });
      }
      
      // Also clear categories cache as product changes might affect category data
      this.clearType('categories');
      
      console.log('Cache invalidated for product update:', productId || 'all products');
      return true;
    } catch (error) {
      console.warn('Error invalidating cache for product update:', error);
      return false;
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
