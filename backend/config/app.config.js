/**
 * Application Configuration
 * Centralized configuration management using environment variables
 * Enhanced with security validations and production checks
 */

require('dotenv').config();

// Security validation helper
const validateConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Critical security checks for production
  if (process.env.NODE_ENV === 'production') {
    // JWT Secret validation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 64) {
      errors.push('JWT_SECRET must be at least 64 characters in production');
    }
    if (jwtSecret === 'fallback-secret-change-in-production' || 
        jwtSecret === 'textura-super-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
    
    // Database URI validation
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
      warnings.push('Consider using a cloud database service for production');
    }
    
    // Upload security validation
    const maxFileSize = parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024);
    if (maxFileSize > 10 * 1024 * 1024) { // 10MB
      warnings.push('Upload file size limit is high for production (>10MB)');
    }
    
    // CORS validation
    const corsOrigins = process.env.CORS_ORIGINS;
    if (!corsOrigins || corsOrigins.includes('localhost')) {
      warnings.push('CORS origins should be set to production domains only');
    }
    
    // Rate limiting validation
    const rateLimit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
    if (rateLimit > 1000) {
      warnings.push('Rate limit is very high for production (>1000 req/window)');
    }
  }
  
  // Log validation results
  if (errors.length > 0) {
    console.error('🚨 CRITICAL SECURITY ERRORS:');
    errors.forEach(error => console.error(`   - ${error}`));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1); // Exit in production for critical errors
    }
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ SECURITY WARNINGS:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  return { errors, warnings };
};

// Run validation
const validation = validateConfig();

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
    // Connection pool settings for production
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    // Additional security settings
    jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
    refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME) || 900000, // 15 minutes
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024), // 5MB
    maxFiles: parseInt(process.env.UPLOAD_MAX_FILES) || 10,
    uploadDir: process.env.UPLOAD_DIR || 'images/products',
    allowedExtensions: process.env.UPLOAD_ALLOWED_EXTENSIONS || 'jpg,jpeg,png,gif,webp',
    staticFilesPath: process.env.STATIC_FILES_PATH || 'images',
    // Enhanced security settings
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ],
    maxFileNameLength: parseInt(process.env.MAX_FILENAME_LENGTH) || 255,
    scanForViruses: process.env.SCAN_UPLOADS === 'true',
    quarantineDir: process.env.QUARANTINE_DIR || 'quarantine',
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
    // CORS and origin settings
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['localhost'],
    trustProxy: process.env.TRUST_PROXY === 'true' || false,
    
    // Security headers
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableCSRF: process.env.ENABLE_CSRF === 'true',
    enableHSTS: process.env.ENABLE_HSTS === 'true',
    
    // Request security
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
    enableXSSProtection: process.env.ENABLE_XSS_PROTECTION !== 'false',
    enableContentTypeNoSniff: process.env.ENABLE_CONTENT_TYPE_NOSNIFF !== 'false',
    
    // Session security
    sessionSecret: process.env.SESSION_SECRET || 'change-this-session-secret',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000, // 1 hour
    enableSecureCookies: process.env.NODE_ENV === 'production',
    
    // IP and geographic restrictions
    enableIPWhitelist: process.env.ENABLE_IP_WHITELIST === 'true',
    allowedIPs: process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [],
    blockedCountries: process.env.BLOCKED_COUNTRIES ? process.env.BLOCKED_COUNTRIES.split(',') : [],
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

  // Security validation methods
  validateEnvironment: () => validation,
  isSecureEnvironment: () => {
    return process.env.NODE_ENV === 'production' && 
           process.env.JWT_SECRET && 
           process.env.JWT_SECRET.length >= 64 &&
           !process.env.JWT_SECRET.includes('change') &&
           !process.env.JWT_SECRET.includes('default');
  },

  // Get all sensitive variables (for logging/debugging - without values)
  getSensitiveKeys: () => [
    'MONGODB_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'UPLOAD_DIR',
    'CORS_ORIGINS',
    'ALLOWED_IPS'
  ],

  // Get configuration summary for monitoring
  getConfigSummary: () => ({
    environment: process.env.NODE_ENV || 'development',
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI,
    corsOriginsCount: (process.env.CORS_ORIGINS || '').split(',').length,
    uploadMaxSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || (5 * 1024 * 1024),
    rateLimit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    securityLevel: process.env.NODE_ENV === 'production' ? 'HIGH' : 'DEVELOPMENT'
  })
};
