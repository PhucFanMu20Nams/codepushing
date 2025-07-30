/**
 * Frontend Configuration
 * Centralized configuration using environment variables
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  API_URL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  TIMEOUT: 10000, // 10 seconds
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Textura',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG_MODE === 'true',
  SHOW_CONSOLE_LOGS: import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true',
};

// Cache Configuration
export const CACHE_CONFIG = {
  ENABLED: import.meta.env.VITE_CACHE_ENABLED !== 'false',
  TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000, // 5 minutes default
  MAX_SIZE: 100,
};

// Image Configuration
export const IMAGE_CONFIG = {
  QUALITY: parseInt(import.meta.env.VITE_IMAGE_QUALITY) || 85,
  LAZY_LOADING: import.meta.env.VITE_LAZY_LOADING !== 'false',
  PLACEHOLDER: '/placeholder-image.jpg',
};

// Helper function to build image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return IMAGE_CONFIG.PLACEHOLDER;
  if (imagePath.startsWith('http')) return imagePath;
  
  return `${API_CONFIG.BASE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

// Helper function to check if we're in development
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Helper function to check if we're in production
export const isProduction = () => {
  return import.meta.env.PROD;
};

export default {
  API_CONFIG,
  APP_CONFIG,
  CACHE_CONFIG,
  IMAGE_CONFIG,
  getImageUrl,
  isDevelopment,
  isProduction,
};
