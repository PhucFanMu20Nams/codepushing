/**
 * Simple In-Memory Cache Manager
 * 
 * A lightweight caching utility that stores data in memory to reduce database load
 * and improve response times for frequently accessed data.
 */

class CacheManager {
  constructor(options = {}) {
    // Cache storage - using Map for O(1) lookup
    this.cache = new Map();
    
    // Default TTL (time-to-live) in milliseconds - 1 hour
    this.defaultTTL = options.defaultTTL || 3600000;
    
    // Maximum number of items in cache
    this.maxItems = options.maxItems || 1000;
    
    // Stats for monitoring
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      items: 0
    };

    // Auto cleanup interval (every 15 minutes by default)
    this.cleanupInterval = options.cleanupInterval || 900000;
    
    // Start automatic cleanup
    this.startCleanupTimer();
  }

  /**
   * Generate a cache key from parameters
   */
  generateKey(prefix, params) {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${prefix}_${paramsStr}`;
  }

  /**
   * Get an item from cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    // If item doesn't exist
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if item has expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.items--;
      this.stats.misses++;
      return null;
    }
    
    // Cache hit
    this.stats.hits++;
    return item.value;
  }

  /**
   * Set an item in cache
   */
  set(key, value, ttl = this.defaultTTL) {
    // If cache is at capacity and this is a new key, remove oldest item
    if (this.cache.size >= this.maxItems && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.items--;
    }
    
    // Calculate expiry time
    const expiry = ttl ? Date.now() + ttl : null;
    
    // Estimate size in bytes (rough approximation)
    const size = JSON.stringify(value).length;
    
    // Update stats if this is a new entry
    if (!this.cache.has(key)) {
      this.stats.items++;
    }
    
    // Add item to cache
    this.cache.set(key, {
      value,
      expiry,
      createdAt: Date.now(),
      size
    });
    
    // Update stats
    this.stats.size += size;
    
    return true;
  }

  /**
   * Remove an item from cache
   */
  delete(key) {
    if (this.cache.has(key)) {
      const item = this.cache.get(key);
      this.stats.size -= item.size || 0;
      this.stats.items--;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.items = 0;
    return true;
  }

  /**
   * Remove expired items
   */
  cleanup() {
    const now = Date.now();
    let removedCount = 0;
    
    this.cache.forEach((value, key) => {
      if (value.expiry && value.expiry < now) {
        this.cache.delete(key);
        this.stats.size -= value.size || 0;
        removedCount++;
      }
    });
    
    this.stats.items = this.cache.size;
    return removedCount;
  }

  /**
   * Start automatic cleanup timer
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    // Ensure cleanup timer doesn't prevent Node process from exiting
    this.cleanupTimer.unref();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.calculateHitRate(),
      sizeInMB: (this.stats.size / (1024 * 1024)).toFixed(2),
      uptime: process.uptime()
    };
  }

  /**
   * Calculate cache hit rate as a percentage
   */
  calculateHitRate() {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return 0;
    return ((this.stats.hits / total) * 100).toFixed(2);
  }
}

// Create a singleton instance
const productCache = new CacheManager({
  defaultTTL: 3600000, // 1 hour
  maxItems: 500, // Max 500 items in cache
  cleanupInterval: 900000 // Clean up every 15 minutes
});

module.exports = {
  productCache
};
