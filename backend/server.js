const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cacheRoutes = require('./routes/cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cache', cacheRoutes);

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
