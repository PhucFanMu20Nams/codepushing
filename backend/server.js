const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const db = require('./models');

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');

// Import cache routes with error handling
let cacheRoutes;
try {
  cacheRoutes = require('./routes/cache');
  console.log('✅ Cache routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading cache routes:', error.message);
  cacheRoutes = null;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware with cache control disabled
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      imgSrc: ["'self'", "*", "data:"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Disable Helmet's default cache control - we handle it ourselves
  noCache: false
}));
app.use(compression());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Static file serving with aggressive caching for images
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: function(res, path) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set aggressive cache headers for images (1 year)
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Only mount cache routes if they loaded successfully
if (cacheRoutes) {
  app.use('/api/cache', cacheRoutes);
  console.log('✅ Cache routes mounted at /api/cache');
} else {
  console.error('❌ Cache routes not mounted due to loading error');
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established');
    
    await db.sequelize.sync();
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();