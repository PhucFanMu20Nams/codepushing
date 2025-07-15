const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to verify JWT token and authenticate admin users
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Headers:', Object.keys(req.headers));
    
    // TEMPORARY: Development bypass for testing
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('🚧 DEVELOPMENT MODE: Bypassing authentication for testing');
      // Set a fake admin user for development
      req.admin = {
        id: 'dev-admin',
        username: 'dev-admin',
        email: 'dev@test.com'
      };
      return next();
    }
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token extracted, length:', token.length);
    
    if (!token) {
      console.log('❌ No token after extraction');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is required.'
      });
    }

    // Verify token
    const config = require('../config/db.config');
    console.log('🔍 Verifying token...');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('✅ Token verified, user ID:', decoded.id);
    
    // Find admin by ID
    console.log('🔍 Looking up admin...');
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('❌ Admin not found in database');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token - admin not found.'
      });
    }

    console.log('✅ Admin found:', admin.username);
    
    // Add admin info to request object
    req.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email
    };

    console.log('✅ Authentication successful, proceeding...');
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional middleware to verify admin token but continue if not present
 * Useful for endpoints that work for both authenticated and non-authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const config = require('../config/db.config');
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        
        if (admin) {
          req.admin = {
            id: admin._id,
            username: admin.username,
            email: admin.email
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we continue even if token verification fails
    next();
  }
};

module.exports = {
  authenticateAdmin,
  optionalAuth
};
