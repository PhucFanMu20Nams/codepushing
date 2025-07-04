require('dotenv').config();

// Use a strong secret key in production
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'textura-super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};
