/**
 * Background Cache Management Component
 * Handles cache operations without UI display
 * Fetches and monitors cache stats in the background
 */

import React, { useEffect } from 'react';
import apiService from '../utils/apiService.js';
// No need for CSS since we're not displaying anything

function CacheStats() {
  // We'll still collect stats in the background but not display them
  const refreshStats = async () => {
    try {
      // Still fetch stats to keep track of cache performance in the background
      await apiService.getCacheStats();
      // No need to update state variables since we're not displaying them
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  useEffect(() => {
    refreshStats();
    
    // Auto-refresh every 30 seconds (still maintaining the background functionality)
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keep the cache clear functionality but make it happen automatically when needed
  const clearCacheIfNeeded = async () => {
    try {
      const cacheStats = await apiService.getCacheStats();
      
      // If client cache health is below 50%, automatically clear it
      if (cacheStats && cacheStats.client) {
        const activeEntries = cacheStats.client.activeEntries;
        const totalEntries = cacheStats.client.activeEntries + cacheStats.client.expiredEntries;
        
        if (totalEntries > 0 && (activeEntries / totalEntries) < 0.5) {
          console.log('Cache health below 50%, automatically clearing cache');
          await apiService.clearAllCaches();
        }
      }
    } catch (error) {
      console.error('Error in automatic cache management:', error);
    }
  };

  // Add periodic cache health check
  useEffect(() => {
    // Check cache health every 2 hours
    const healthCheckInterval = setInterval(clearCacheIfNeeded, 7200000);
    return () => clearInterval(healthCheckInterval);
  }, []);

  // Return an empty fragment - no UI will be rendered
  return null;
}

export default CacheStats;
