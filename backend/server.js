const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

// Load environment variables
require('dotenv').config();

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cacheRoutes = require('./routes/cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Get configuration from environment variables
const STATIC_FILES_PATH = process.env.STATIC_FILES_PATH || 'images';
const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5173'];

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    if (CORS_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URL_ENCODED_LIMIT || '10mb' }));

// Static files - use environment variable for path
app.use('/images', express.static(path.join(__dirname, STATIC_FILES_PATH)));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/categories', require('./routes/categories'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'MongoDB'
  });
});

// Debug endpoint for testing category options
app.get('/api/debug/category-options', async (req, res) => {
  try {
    const { getAllCategoryOptionsService } = require('./services/productServices');
    console.log('Debug: Testing getAllCategoryOptionsService...');
    const result = await getAllCategoryOptionsService();
    console.log('Debug: Result:', result);
    res.json({
      success: true,
      debug: true,
      result: result
    });
  } catch (error) {
    console.error('Debug: Error in getAllCategoryOptionsService:', error);
    res.status(500).json({
      success: false,
      debug: true,
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint for testing authentication
app.post('/api/debug/test-auth', async (req, res) => {
  try {
    console.log('=== TEST AUTH DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No valid auth header',
        received: authHeader
      });
    }

    const token = authHeader.substring(7);
    console.log('Token length:', token.length);
    
    const config = require('./config/db.config');
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      res.json({
        success: true,
        message: 'Authentication successful',
        decoded: decoded
      });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      res.status(401).json({
        success: false,
        message: 'Token verification failed',
        error: jwtError.message
      });
    }
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
const startServer = async () => {
  try {
    await db.connectDB();
    console.log('MongoDB connection established');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error);
    process.exit(1);
  }
};

startServer();
