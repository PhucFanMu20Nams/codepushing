require('dotenv').config();

// Use a strong secret key in production
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'textura-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

// Security validation for production
if (process.env.NODE_ENV === 'production') {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error('🚨 CRITICAL: JWT secret must be at least 32 characters in production!');
    process.exit(1);
  }
  
  if (jwtSecret === 'textura-super-secret-key-change-in-production') {
    console.error('🚨 CRITICAL: Please change the default JWT secret in production!');
    process.exit(1);
  }
}
