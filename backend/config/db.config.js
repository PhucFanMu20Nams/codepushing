require('dotenv').config();
const mongoose = require('mongoose');

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/textura_db",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h"
};

// For security auditing - log if using fallback values in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  WARNING: Using default MongoDB URI in production!');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
    console.error('🚨 CRITICAL: Using default JWT secret in production!');
  }
}

const connectDB = async () => {
  try {
    // Remove the deprecated options - they're no longer needed
    await mongoose.connect(module.exports.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports.connectDB = connectDB;