/**
 * Application Configuration
 * Centralized configuration management using environment variables
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || 'development',
    jsonLimit: process.env.JSON_LIMIT || '10mb',
    urlEncodedLimit: process.env.URL_ENCODED_LIMIT || '10mb'
  },

  // Database Configuration
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/textura_db',
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024), // 5MB
    maxFiles: parseInt(process.env.UPLOAD_MAX_FILES) || 10,
    uploadDir: process.env.UPLOAD_DIR || 'images/products',
    allowedExtensions: process.env.UPLOAD_ALLOWED_EXTENSIONS || 'jpg,JPG,jpeg,JPEG,png,PNG,gif,GIF,webp,WEBP',
    staticFilesPath: process.env.STATIC_FILES_PATH || 'images'
  },

  // CORS Configuration
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  },

  // Rate Limiting Configuration
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15
  },

  // Security Configuration
  security: {
    // Add any other security-related configurations here
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['localhost'],
    trustProxy: process.env.TRUST_PROXY === 'true' || false
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100
  },

  // Validation Helpers
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test',

  // Get all sensitive variables (for logging/debugging - without values)
  getSensitiveKeys: () => [
    'MONGODB_URI',
    'JWT_SECRET',
    'UPLOAD_DIR',
    'CORS_ORIGINS'
  ]
};
