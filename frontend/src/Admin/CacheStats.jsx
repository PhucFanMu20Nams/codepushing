/**
 * Cache Statistics Component for Admin Dashboard
 * Shows cache performance and allows manual cache management
 */

import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService.js';
import './CacheStats.css';

function CacheStats() {
  const [stats, setStats] = useState({
    client: {
      totalEntries: 0,
      expiredEntries: 0,
      activeEntries: 0,
      totalSizeKB: 0
    },
    server: null
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await apiService.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    refreshStats();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cache? This will affect website performance until cache is rebuilt.')) {
      await apiService.clearAllCaches();
      refreshStats();
    }
  };

  const getCacheHealthColor = (activeEntries, totalEntries) => {
    if (totalEntries === 0) return '#44aa44';
    
    const activePercentage = (activeEntries / totalEntries) * 100;
    if (activePercentage < 50) return '#ff4444'; // Red
    if (activePercentage < 75) return '#ff8800'; // Orange
    return '#44aa44'; // Green
  };

  return (
    <div className="cache-stats">
      <h3 className="cache-stats-title">Cache Performance</h3>
      
      {isLoading ? (
        <div className="cache-loading">Loading cache statistics...</div>
      ) : (
        <>
          <div className="cache-section">
            <h4>Client-Side Cache</h4>
            <div className="cache-stats-grid">
              <div className="cache-stat-card">
                <div className="cache-stat-value">{stats.client.activeEntries}</div>
                <div className="cache-stat-label">Active Entries</div>
              </div>
              
              <div className="cache-stat-card">
                <div className="cache-stat-value">{stats.client.totalSizeKB} KB</div>
                <div className="cache-stat-label">Cache Size</div>
              </div>
              
              <div className="cache-stat-card">
                <div 
                  className="cache-stat-value"
                  style={{ 
                    color: getCacheHealthColor(
                      stats.client.activeEntries, 
                      stats.client.activeEntries + stats.client.expiredEntries
                    ) 
                  }}
                >
                  {stats.client.activeEntries + stats.client.expiredEntries > 0 
                    ? Math.round((stats.client.activeEntries / (stats.client.activeEntries + stats.client.expiredEntries)) * 100) 
                    : 100}%
                </div>
                <div className="cache-stat-label">Cache Health</div>
              </div>
            </div>
          </div>
          
          {stats.server && (
            <div className="cache-section">
              <h4>Server-Side Cache</h4>
              <div className="cache-stats-grid">
                <div className="cache-stat-card">
                  <div className="cache-stat-value">{stats.server.items}</div>
                  <div className="cache-stat-label">Items</div>
                </div>
                
                <div className="cache-stat-card">
                  <div className="cache-stat-value">{stats.server.sizeInMB} MB</div>
                  <div className="cache-stat-label">Size</div>
                </div>
                
                <div className="cache-stat-card">
                  <div className="cache-stat-value">{stats.server.hits}</div>
                  <div className="cache-stat-label">Hits</div>
                </div>
                
                <div className="cache-stat-card">
                  <div className="cache-stat-value">{stats.server.misses}</div>
                  <div className="cache-stat-label">Misses</div>
                </div>
                
                <div className="cache-stat-card">
                  <div 
                    className="cache-stat-value"
                    style={{ 
                      color: stats.server.hitRate > 70 ? '#44aa44' : 
                             stats.server.hitRate > 40 ? '#ff8800' : '#ff4444'
                    }}
                  >
                    {stats.server.hitRate}%
                  </div>
                  <div className="cache-stat-label">Hit Rate</div>
                </div>
              </div>
            </div>
          )}

          <div className="cache-actions">
            <button 
              className="cache-action-btn refresh"
              onClick={refreshStats}
            >
              Refresh Stats
            </button>
            
            <button 
              className="cache-action-btn clear"
              onClick={handleClearCache}
            >
              Clear All Cache
            </button>
          </div>

          <div className="cache-info">
            <p className="cache-last-refresh">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
            <div className="cache-tips">
              <h4>Cache Strategy:</h4>
              <ul>
                <li><strong>Client-side:</strong> Local storage with variable TTL</li>
                <li><strong>Server-side:</strong> In-memory cache with 1-hour TTL</li>
                <li><strong>HTTP cache:</strong> Product listings: 1 hour</li>
                <li><strong>HTTP cache:</strong> Product details: 30 minutes</li>
                <li><strong>HTTP cache:</strong> Static assets: 1 year</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CacheStats;
