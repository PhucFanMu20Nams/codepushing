const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Middleware to verify JWT token and authenticate admin users
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is required.'
      });
    }

    // Verify token
    const config = require('../config/db.config');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Find admin by ID
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token - admin not found.'
      });
    }

    // Add admin info to request object
    req.admin = {
      id: admin._id,
      username: admin.username,
      email: admin.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
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
